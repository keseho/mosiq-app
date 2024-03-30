import { Doc } from "../_generated/dataModel";

export type FileWithUrls = Doc<"files"> & {
  songUrl: string;
  imageUrl: string | null;
  owner: Doc<"users">;
  favorite: boolean;
};
