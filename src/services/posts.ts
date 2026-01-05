import { count, eq } from "drizzle-orm";
import { db } from "../db";
import { posts } from "../db/schema";

type PostWithRelations = NonNullable<
    Awaited<
        ReturnType<
            typeof db.query.posts.findFirst<{
                with: {
                    category: true;
                    postsToTags: {
                        with: {
                            tag: true;
                        };
                    };
                };
            }>
        >
    >
>;

export const postService = {
    async getPostBySlug(slug: string) {
        return await db.query.posts.findFirst({
            where: eq(posts.slug, slug),
            with: {
                category: true,
                postsToTags: {
                    with: {
                        tag: true,
                    },
                },
            },
        });
    },

    async listPosts(page: number, limit: number) {
        const [data, total] = await Promise.all([
            db.query.posts.findMany({
                limit: limit,
                offset: (page - 1) * limit,
                columns: {
                    content: false,
                },
                with: {
                    category: true,
                    postsToTags: {
                        with: {
                            tag: true,
                        },
                    },
                },
                orderBy: (posts, { desc }) => [desc(posts.createdAt)],
            }),
            db.select({ count: count() }).from(posts),
        ]);

        return {
            data,
            total: total[0].count,
        };
    },

    async createPost(values: {
        title?: string | null;
        content: string;
        slug: string;
        description?: string | null;
        authorId: number;
        cover?: string | null;
        isPublished: boolean;
        categoryId?: number | null;
    }) {
        const [newPost] = await db.insert(posts).values(values).returning();

        return await db.query.posts.findFirst({
            where: eq(posts.id, newPost.id),
            with: {
                category: true,
                postsToTags: {
                    with: {
                        tag: true,
                    },
                },
            },
        });
    },

    async existsBySlug(slug: string) {
        const post = await db.query.posts.findFirst({
            where: eq(posts.slug, slug),
            columns: {
                id: true,
            },
        });
        return !!post;
    },

    formatPost(post: PostWithRelations | Omit<PostWithRelations, "content">) {
        const {
            category,
            postsToTags,
            categoryId: _categoryId,
            authorId: _authorId,
            createdAt,
            updatedAt,
            ...cleanResult
        } = post as PostWithRelations;

        return {
            ...cleanResult,
            categories: category ? [category.name] : [],
            tags: postsToTags.map((pt) => pt.tag.name),
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
        };
    },
};
