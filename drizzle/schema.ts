export type UserRole = "user" | "admin";
export type SupportPlatform =
  | "whatsapp"
  | "tiktok"
  | "telegram"
  | "facebook"
  | "instagram"
  | "youtube";

export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export type InsertUser = Partial<Omit<User, "id" | "createdAt" | "updatedAt">> &
  Pick<User, "openId">;

export interface Service {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertService = Omit<
  Service,
  "id" | "createdAt" | "updatedAt" | "imageUrl" | "liveUrl" | "githubUrl"
> & {
  imageUrl?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
};

export interface Project {
  id: number;
  title: string;
  client: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertProject = Omit<
  Project,
  "id" | "createdAt" | "updatedAt" | "imageUrl" | "liveUrl" | "githubUrl"
> & {
  imageUrl?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
};

export interface SupportChannel {
  id: number;
  platform: SupportPlatform;
  label: string;
  value: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertSupportChannel = Omit<
  SupportChannel,
  "id" | "createdAt" | "updatedAt"
>;

export interface SupportMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

export type InsertSupportMessage = Omit<SupportMessage, "id" | "createdAt">;

export interface Faq {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertFaq = Omit<Faq, "id" | "createdAt" | "updatedAt">;

export type DirectorySection = "products" | "developers" | "docs";

export interface DirectoryItem {
  id: number;
  section: DirectorySection;
  title: string;
  description: string;
  href: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertDirectoryItem = Omit<DirectoryItem, "id" | "createdAt" | "updatedAt">;
