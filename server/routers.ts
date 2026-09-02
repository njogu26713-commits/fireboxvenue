import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  addFaq,
  addProject,
  addService,
  deleteFaq,
  deleteProject,
  deleteService,
  updateFaq,
  updateProject,
  updateService,
  getFaqs,
  getProjects,
  getServices,
  getSupportChannels,
  getSupportMessages,
  addSupportMessage,
  upsertSupportChannel,
} from "./db";

const serviceInput = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(2000),
  imageUrl: z.string().trim().url().or(z.literal("")).optional(),
  liveUrl: z.string().trim().url().or(z.literal("")).optional(),
  githubUrl: z.string().trim().url().or(z.literal("")).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const supportPlatforms = ["whatsapp", "tiktok", "telegram", "facebook", "instagram", "youtube"] as const;

const supportChannelInput = z.object({
  platform: z.enum(supportPlatforms),
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().max(512),
  sortOrder: z.number().int().min(0).default(0),
});

const supportMessageInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(1).max(5000),
});

const faqInput = z.object({
  question: z.string().trim().min(1).max(255),
  answer: z.string().trim().min(1).max(5000),
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
  faq: router({
    list: publicProcedure.query(() => getFaqs()),
    add: publicProcedure.input(faqInput).mutation(({ input }) => addFaq(input)),
    update: publicProcedure.input(faqInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateFaq(id, values);
    }),
    delete: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteFaq(input.id)),
  }),
  support: router({
    channels: publicProcedure.query(() => getSupportChannels()),
    messages: publicProcedure.query(() => getSupportMessages()),
    submitMessage: publicProcedure.input(supportMessageInput).mutation(({ input }) => addSupportMessage(input)),
    saveChannel: publicProcedure.input(supportChannelInput).mutation(({ input }) => upsertSupportChannel(input)),
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
