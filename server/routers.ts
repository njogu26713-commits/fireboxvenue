import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  addProject,
  addService,
  deleteProject,
  deleteService,
  updateProject,
  updateService,
  getProjects,
  getServices,
} from "./db";

const serviceInput = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(2000),
  imageUrl: z.string().trim().url().or(z.literal("")).optional(),
  liveUrl: z.string().trim().url().or(z.literal("")).optional(),
  githubUrl: z.string().trim().url().or(z.literal("")).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const projectInput = z.object({
  title: z.string().trim().min(1).max(255),
  client: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(2000),
  imageUrl: z.string().trim().url().or(z.literal("")).optional(),
  liveUrl: z.string().trim().url().or(z.literal("")).optional(),
  githubUrl: z.string().trim().url().or(z.literal("")).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  content: router({
    list: publicProcedure.query(async () => ({
      services: await getServices(),
      projects: await getProjects(),
    })),
    addService: publicProcedure.input(serviceInput).mutation(({ input }) => addService(input)),
    addProject: publicProcedure.input(projectInput).mutation(({ input }) => addProject(input)),
    updateService: publicProcedure.input(serviceInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateService(id, values);
    }),
    updateProject: publicProcedure.input(projectInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateProject(id, values);
    }),
    deleteService: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteService(input.id)),
    deleteProject: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteProject(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
