import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { Check, Film, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const DEFAULT_VIDEO_URL = "/firebox-tech-loop.mp4";
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

type SupportedVideoMime = "video/mp4" | "video/webm";

function getSupportedMime(file: File): SupportedVideoMime | null {
  if (file.type === "video/mp4" || file.type === "video/webm") return file.type;
  if (file.type) return null;
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".mp4")) return "video/mp4";
  if (lowerName.endsWith(".webm")) return "video/webm";
  return null;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("Could not read the selected video."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      if (comma < 0) reject(new Error("Could not encode the selected video."));
      else resolve(result.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });
}

export default function HeroVideoAdminPanel() {
  const utils = trpc.useUtils();
  const currentVideo = trpc.siteSettings.heroVideo.useQuery();
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (currentVideo.data) setVideoUrl(currentVideo.data);
  }, [currentVideo.data]);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setSelectedPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const refreshCurrentVideo = async () => {
    await utils.siteSettings.heroVideo.invalidate();
  };

  const saveVideoUrl = trpc.siteSettings.updateHeroVideo.useMutation({
    onSuccess: async () => {
      await refreshCurrentVideo();
      toast.success("Homepage loop video updated");
    },
    onError: error => toast.error(error.message),
  });

  const uploadVideo = trpc.siteSettings.uploadHeroVideo.useMutation({
    onSuccess: async url => {
      await refreshCurrentVideo();
      setVideoUrl(url);
      setSelectedFile(null);
      toast.success("Video uploaded and set as the homepage loop");
    },
    onError: error => toast.error(error.message),
  });

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      event.currentTarget.value = "";
      toast.error("Choose a video that is 25 MB or smaller.");
      return;
    }
    if (!getSupportedMime(file)) {
      event.currentTarget.value = "";
      toast.error("Choose an MP4 or WebM video.");
      return;
    }
    setSelectedFile(file);
  };

  const saveUrl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveVideoUrl.mutate({ url: videoUrl.trim() });
  };

  const submitUpload = async () => {
    if (!selectedFile) return;
    const mimeType = getSupportedMime(selectedFile);
    if (!mimeType) {
      toast.error("Choose an MP4 or WebM video.");
      return;
    }
    try {
      const dataBase64 = await readFileAsBase64(selectedFile);
      uploadVideo.mutate({ dataBase64, mimeType });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Video upload failed."
      );
    }
  };

  const previewSource =
    selectedPreview ?? currentVideo.data ?? DEFAULT_VIDEO_URL;
  const isBusy = saveVideoUrl.isPending || uploadVideo.isPending;

  return (
    <section className="space-y-6" aria-labelledby="hero-video-admin-title">
      <div className="border border-white/10 bg-[#0a0e15] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
              HOMEPAGE / MEDIA CONTROL
            </span>
            <h2
              id="hero-video-admin-title"
              className="mt-2 font-sans text-2xl font-semibold"
            >
              CHANGE THE LOOP VIDEO
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-xs leading-6 text-[#99a6b7]">
              Upload an MP4 or WebM (up to 25 MB), or use a direct HTTPS video
              URL. The homepage fits the frame to the video’s natural
              proportions so the full picture remains visible.
            </p>
          </div>
          <Film className="h-5 w-5 text-[#ff5a1f]" />
        </div>

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
          <div className="space-y-6">
            <form onSubmit={saveUrl} className="space-y-3">
              <label className="block">
                <span className="field-label">Direct video URL</span>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={event => setVideoUrl(event.target.value)}
                  placeholder="https://example.com/loop.mp4"
                  maxLength={2048}
                  className="field-input"
                  aria-describedby="hero-video-url-help"
                />
              </label>
              <p
                id="hero-video-url-help"
                className="font-sans text-[10px] leading-5 text-[#7f8c9d]"
              >
                Use a direct HTTPS MP4/WebM link, or select “Restore bundled
                video” to return to the original clip.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isBusy || !videoUrl.trim()}
                  className="action-button"
                >
                  <Check className="h-4 w-4" />
                  {saveVideoUrl.isPending ? "SAVING…" : "SAVE VIDEO URL"}
                </button>
                <button
                  type="button"
                  onClick={() => setVideoUrl(DEFAULT_VIDEO_URL)}
                  className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#aab4c2] transition hover:border-white/40 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> RESTORE BUNDLED VIDEO
                </button>
              </div>
            </form>

            <div className="border-t border-white/10 pt-5">
              <label className="field-label" htmlFor="hero-video-file">
                Upload a replacement video
              </label>
              <input
                id="hero-video-file"
                type="file"
                accept="video/mp4,video/webm,.mp4,.webm"
                onChange={onFileChange}
                className="mt-2 block w-full font-sans text-xs text-[#b4bfcd] file:mr-4 file:rounded-lg file:border file:border-white/15 file:bg-[#111925] file:px-4 file:py-2.5 file:font-sans file:text-[10px] file:tracking-[0.08em] file:text-white hover:file:border-[#6ae4ff]/40"
              />
              {selectedFile && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#0d141d] p-3">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-xs text-white">
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 font-sans text-[10px] text-[#7f8c9d]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · new
                      upload will replace the active loop
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={submitUpload}
                    disabled={isBusy}
                    className="action-button"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadVideo.isPending ? "UPLOADING…" : "UPLOAD & ACTIVATE"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="field-label">
              {selectedFile
                ? "Selected video preview"
                : "Current homepage loop"}
            </p>
            <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-black">
              {currentVideo.isLoading ? (
                <div className="grid aspect-video place-items-center font-sans text-xs text-[#8e9bad]">
                  Loading current video…
                </div>
              ) : (
                <video
                  key={previewSource}
                  src={previewSource}
                  controls
                  muted
                  loop
                  playsInline
                  className="aspect-video w-full object-contain"
                />
              )}
            </div>
            {currentVideo.isError && (
              <p role="alert" className="mt-2 font-sans text-xs text-red-300">
                Could not load the current video setting.{" "}
                {currentVideo.error.message}
              </p>
            )}
            <p className="mt-2 break-all font-mono text-[10px] leading-5 text-[#718094]">
              Active source: {currentVideo.data ?? DEFAULT_VIDEO_URL}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
