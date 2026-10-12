import type { Express, Request, Response } from "express";
import { GridFSBucket, ObjectId } from "mongodb";
import { getActiveHomepageHeroVideoFileId, getDb } from "../db";

type ByteRange = { start: number; end: number };

function parseByteRange(header: string, fileSize: number): ByteRange | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || fileSize <= 0) return null;

  let start: number;
  let end: number;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(fileSize - suffixLength, 0);
    end = fileSize - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : fileSize - 1;
  }

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= fileSize ||
    end < start
  ) {
    return null;
  }
  return { start, end: Math.min(end, fileSize - 1) };
}

function setVideoHeaders(
  res: Response,
  contentType: string,
  contentLength: number
) {
  res.set({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(contentLength),
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
  });
}

export function registerHomepageHeroVideoRoute(app: Express) {
  app.get("/api/homepage-hero-video", async (req: Request, res: Response) => {
    try {
      const requestedId = typeof req.query.v === "string" ? req.query.v : "";
      if (!/^[a-f\d]{24}$/i.test(requestedId)) {
        res.status(404).end();
        return;
      }

      const activeId = await getActiveHomepageHeroVideoFileId();
      if (activeId !== requestedId.toLowerCase()) {
        res.status(404).end();
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(503).end("Video storage is unavailable.");
        return;
      }
      const objectId = new ObjectId(requestedId);
      const bucket = new GridFSBucket(db, { bucketName: "siteMedia" });
      const file = await bucket.find({ _id: objectId }).limit(1).next();
      if (!file || file.metadata?.purpose !== "homepageHeroVideo") {
        res.status(404).end();
        return;
      }

      const contentType =
        file.metadata?.contentType === "video/webm"
          ? "video/webm"
          : "video/mp4";
      const rangeHeader = req.headers.range;
      if (rangeHeader) {
        const range = parseByteRange(rangeHeader, file.length);
        if (!range) {
          res
            .status(416)
            .set("Content-Range", `bytes */${file.length}`)
            .set("Accept-Ranges", "bytes")
            .end();
          return;
        }

        const contentLength = range.end - range.start + 1;
        setVideoHeaders(res, contentType, contentLength);
        res
          .status(206)
          .set(
            "Content-Range",
            `bytes ${range.start}-${range.end}/${file.length}`
          );
        bucket
          .openDownloadStream(objectId, {
            start: range.start,
            end: range.end + 1,
          })
          .on("error", error => {
            console.error("[HomepageHeroVideo] Range stream failed:", error);
            if (res.headersSent) res.destroy(error);
            else res.status(500).end();
          })
          .pipe(res);
        return;
      }

      setVideoHeaders(res, contentType, file.length);
      bucket
        .openDownloadStream(objectId)
        .on("error", error => {
          console.error("[HomepageHeroVideo] Stream failed:", error);
          if (res.headersSent) res.destroy(error);
          else res.status(500).end();
        })
        .pipe(res);
    } catch (error) {
      console.error("[HomepageHeroVideo] Request failed:", error);
      if (!res.headersSent) res.status(500).end();
      else
        res.destroy(
          error instanceof Error ? error : new Error("Video stream failed")
        );
    }
  });
}
