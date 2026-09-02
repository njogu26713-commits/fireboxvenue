import { MongoClient, type Collection, type Db } from "mongodb";
import type {
  InsertFaq,
  InsertBlogPost,
  InsertProject,
  InsertService,
  InsertSupportChannel,
  InsertSupportMessage,
  InsertUser,
  DirectoryItem,
  DirectorySection,
  Faq,
  BlogPost,
  InsertDirectoryItem,
  Project,
  Service,
  SupportChannel,
  SupportMessage,
  User,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let client: MongoClient | null = null;
let database: Db | null = null;
let connectionPromise: Promise<Db | null> | null = null;

const collectionNames = {
  users: "users",
  services: "services",
  projects: "projects",
  supportChannels: "supportChannels",
  supportMessages: "supportMessages",
  faqs: "faqs",
  blogPosts: "blogPosts",
  directory: "directory",
} as const;

/** Lazily connect so local type-checking and tests work without MongoDB configured. */
export async function getDb(): Promise<Db | null> {
  if (database) return database;
  if (!ENV.mongoUri) return null;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      client = new MongoClient(ENV.mongoUri, {
        serverSelectionTimeoutMS: 5_000,
      });
      await client.connect();
      database = client.db(ENV.mongoDbName);
      console.info("[Database] Connected to MongoDB");
      return database;
    } catch (error) {
      console.warn("[Database] Failed to connect to MongoDB:", error);
      client = null;
      database = null;
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

function collection<T>(db: Db, name: string): Collection<any> {
  return db.collection(name);
}

async function nextId(db: Db, sequenceName: string): Promise<number> {
  const result = await db
    .collection<{ _id: string; value: number }>("sequences")
    .findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  return result?.value ?? 1;
}

function clean<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, field]) => field !== undefined)
  ) as Partial<T>;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: MongoDB is not available");
    return;
  }

  const users = collection<User>(db, collectionNames.users);
  const now = new Date();
  const existing = await users.findOne({ openId: user.openId });
  const role =
    user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : undefined);
  const update = clean({
    ...user,
    ...(role ? { role } : {}),
    updatedAt: now,
    lastSignedIn: user.lastSignedIn ?? now,
  });

  if (existing) {
    await users.updateOne({ openId: user.openId }, { $set: update });
    return;
  }

  await users.insertOne({
    id: await nextId(db, "users"),
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    role: role ?? "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: user.lastSignedIn ?? now,
  });
}

export async function getUserByOpenId(
  openId: string
): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: MongoDB is not available");
    return undefined;
  }
  return (
    (await collection<User>(db, collectionNames.users).findOne({ openId })) ??
    undefined
  );
}

export async function getServices(): Promise<Service[]> {
  const db = await getDb();
  if (!db) return [];
  return collection<Service>(db, collectionNames.services)
    .find({})
    .sort({ sortOrder: 1 })
    .toArray();
}

export async function getProjects(): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  return collection<Project>(db, collectionNames.projects)
    .find({})
    .sort({ sortOrder: 1 })
    .toArray();
}

export async function addService(service: InsertService): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  await collection<Service>(db, collectionNames.services).insertOne({
    ...service,
    id: await nextId(db, "services"),
    imageUrl: service.imageUrl ?? null,
    liveUrl: service.liveUrl ?? null,
    githubUrl: service.githubUrl ?? null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function addProject(project: InsertProject): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  await collection<Project>(db, collectionNames.projects).insertOne({
    ...project,
    id: await nextId(db, "projects"),
    imageUrl: project.imageUrl ?? null,
    liveUrl: project.liveUrl ?? null,
    githubUrl: project.githubUrl ?? null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateService(
  id: number,
  service: Partial<InsertService>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<Service>(db, collectionNames.services).updateOne(
    { id },
    { $set: { ...clean(service), updatedAt: new Date() } }
  );
}

export async function updateProject(
  id: number,
  project: Partial<InsertProject>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<Project>(db, collectionNames.projects).updateOne(
    { id },
    { $set: { ...clean(project), updatedAt: new Date() } }
  );
}

export async function deleteService(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<Service>(db, collectionNames.services).deleteOne({ id });
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<Project>(db, collectionNames.projects).deleteOne({ id });
}

export async function getSupportChannels(): Promise<SupportChannel[]> {
  const db = await getDb();
  if (!db) return [];
  return collection<SupportChannel>(db, collectionNames.supportChannels)
    .find({})
    .sort({ sortOrder: 1 })
    .toArray();
}

export async function upsertSupportChannel(
  channel: InsertSupportChannel
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const channels = collection<SupportChannel>(
    db,
    collectionNames.supportChannels
  );
  const now = new Date();
  await channels.updateOne(
    { platform: channel.platform },
    {
      $set: {
        label: channel.label,
        value: channel.value,
        sortOrder: channel.sortOrder,
        updatedAt: now,
      },
      $setOnInsert: { id: await nextId(db, "supportChannels"), createdAt: now },
    },
    { upsert: true }
  );
}

export async function addSupportMessage(
  message: InsertSupportMessage
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<SupportMessage>(
    db,
    collectionNames.supportMessages
  ).insertOne({
    ...message,
    id: await nextId(db, "supportMessages"),
    createdAt: new Date(),
  });
}

export async function getSupportMessages(): Promise<SupportMessage[]> {
  const db = await getDb();
  if (!db) return [];
  return collection<SupportMessage>(db, collectionNames.supportMessages)
    .find({})
    .sort({ createdAt: 1 })
    .toArray();
}

export async function getFaqs(): Promise<Faq[]> {
  const db = await getDb();
  if (!db) return [];
  return collection<Faq>(db, collectionNames.faqs)
    .find({})
    .sort({ sortOrder: 1, id: 1 })
    .toArray();
}

export async function addFaq(faq: InsertFaq): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  await collection<Faq>(db, collectionNames.faqs).insertOne({
    ...faq,
    id: await nextId(db, "faqs"),
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateFaq(
  id: number,
  faq: Partial<InsertFaq>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<Faq>(db, collectionNames.faqs).updateOne(
    { id },
    { $set: { ...clean(faq), updatedAt: new Date() } }
  );
}

export async function deleteFaq(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<Faq>(db, collectionNames.faqs).deleteOne({ id });
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  const db = await getDb();
  if (!db) return [];
  const filter = includeDrafts ? {} : { status: "published" };
  return collection<BlogPost>(db, collectionNames.blogPosts)
    .find(filter)
    .sort({ publishedAt: -1, createdAt: -1, id: -1 })
    .toArray()
    .then(posts =>
      posts.map(post => ({ ...post, category: post.category ?? "article" }))
    );
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const post = await collection<BlogPost>(
    db,
    collectionNames.blogPosts
  ).findOne({
    slug,
    status: "published",
  });
  return post ? { ...post, category: post.category ?? "article" } : undefined;
}

export async function addBlogPost(post: InsertBlogPost): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  await collection<BlogPost>(db, collectionNames.blogPosts).insertOne({
    ...post,
    id: await nextId(db, "blogPosts"),
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateBlogPost(
  id: number,
  post: Partial<InsertBlogPost>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<BlogPost>(db, collectionNames.blogPosts).updateOne(
    { id },
    { $set: { ...clean(post), updatedAt: new Date() } }
  );
}

export async function deleteBlogPost(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<BlogPost>(db, collectionNames.blogPosts).deleteOne({ id });
}

export async function getDirectoryItems(
  section?: DirectorySection
): Promise<DirectoryItem[]> {
  const db = await getDb();
  if (!db) return [];
  const filter = section ? { section } : {};
  return collection<DirectoryItem>(db, collectionNames.directory)
    .find(filter)
    .sort({ section: 1, sortOrder: 1, id: 1 })
    .toArray();
}

export async function addDirectoryItem(
  item: InsertDirectoryItem
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  await collection<DirectoryItem>(db, collectionNames.directory).insertOne({
    ...item,
    id: await nextId(db, "directory"),
    href: item.href ?? null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateDirectoryItem(
  id: number,
  item: Partial<InsertDirectoryItem>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<DirectoryItem>(db, collectionNames.directory).updateOne(
    { id },
    { $set: { ...clean(item), updatedAt: new Date() } }
  );
}

export async function deleteDirectoryItem(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await collection<DirectoryItem>(db, collectionNames.directory).deleteOne({
    id,
  });
}

export async function closeDb(): Promise<void> {
  if (client) await client.close();
  client = null;
  database = null;
}
