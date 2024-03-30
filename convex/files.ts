import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { FileWithUrls } from "./types/index";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const files = await ctx.db.query("files").collect();

    return Promise.all(
      files.map(async (file) => {
        const songUrl = await ctx.storage.getUrl(file.song);
        let imageUrl: string | null = null; // Initialize imageUrl to null
        if (file.image) {
          imageUrl = await ctx.storage.getUrl(file.image);
        }

        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", identity.tokenIdentifier)
          )
          .unique();

        if (user === null) {
          throw new ConvexError("User does not exist in the database");
        }

        const favourite = await ctx.db
          .query("userFavourites")
          .withIndex("by_user_file", (q) =>
            q.eq("userId", user._id).eq("fileId", file._id)
          )
          .unique();

        const owner = await ctx.db.get(file.ownerId);

        // Ensure 'favorite' property is included in the returned object
        return {
          ...file,
          songUrl,
          imageUrl,
          owner,
          favourite: favourite ? true : false,
        } as unknown as FileWithUrls;
      })
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveSongStorageId = mutation({
  // You can customize these as you like
  args: {
    songStorageId: v.id("_storage"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError("User not found.");
    }

    // Save the storageId to the database using `insert`

    return await ctx.db.insert("files", {
      song: args.songStorageId,
      ownerId: user._id,
      title: args.title,
    });
  },
});

export const saveImageStorageId = mutation({
  args: {
    imageStorageId: v.id("_storage"),
    id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError("User not found.");
    }

    // Save the storageId to the database using `update`

    return await ctx.db.patch(args.id, {
      image: args.imageStorageId,
    });
  },
});

export const favorite = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const file = await ctx.db.get(args.id);

    if (!file) {
      throw new Error("File not found");
    }

    const userId = file.ownerId;

    const existingFavorite = await ctx.db
      .query("userFavourites")
      .withIndex("by_user_file", (q) =>
        q.eq("userId", userId).eq("fileId", file._id)
      )
      .unique();

    if (existingFavorite) {
      throw new Error("File already favorited");
    }

    await ctx.db.insert("userFavourites", {
      userId,
      fileId: file._id,
    });

    return file;
  },
});

export const unfavorite = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const file = await ctx.db.get(args.id);

    if (!file) {
      throw new Error("File not found");
    }

    const userId = file.ownerId;

    const existingFavorite = await ctx.db
      .query("userFavourites")
      .withIndex("by_user_file", (q) =>
        q.eq("userId", userId).eq("fileId", file._id)
      )
      .unique();

    if (!existingFavorite) {
      throw new Error("Favorited file not found");
    }

    await ctx.db.delete(existingFavorite._id);

    return file;
  },
});

export const getFavorite = query({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const existingFavorite = await ctx.db
      .query("userFavourites")
      .withIndex("by_user_file", (q) =>
        q.eq("userId", user._id).eq("fileId", id)
      )
      .unique();

    return !!existingFavorite;
  },
});

// export const saveSongStorageId = mutation({
//   args: {
//     songStorageId: v.id("_storage"),
//     title: v.string(),
//   },
//   handler: async (ctx) => {},
// });

export const deleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const file = await ctx.db.get(id);

    if (!file) {
      throw new Error("File not found");
    }

    // Check if the user is the owner of the file or has sufficient permissions

    await ctx.db.delete(id);

    return file;
  },
});
