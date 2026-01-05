import type { BuildQueryResult, ExtractTablesWithRelations } from "drizzle-orm";
import type * as schema from "../db/schema";

type TSchema = ExtractTablesWithRelations<typeof schema>;

export type PostDetail = BuildQueryResult<
    TSchema,
    TSchema["posts"],
    { with: { category: true; postsToTags: { with: { tag: true } } } }
>;

export type PostListItem = Omit<PostDetail, "content">;
