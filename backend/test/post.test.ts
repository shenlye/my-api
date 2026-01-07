import { beforeAll, describe, expect, test } from "bun:test";
import z from "zod";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { app } from "../src/index";
import {
    createPaginatedSuccessSchema,
    createSuccessSchema,
} from "../src/lib/schema";
import { PostSchema } from "../src/routes/posts/schema";

describe("Posts CRUD tests", () => {
    let adminToken: string;
    let testPostId: number;
    const testPostSlug = `test-post-${Bun.randomUUID().slice(0, 8)}`;

    beforeAll(async () => {
        // Ensure admin user exists with a known password
        const passwordHash = await Bun.password.hash("admin123");
        await db
            .insert(users)
            .values({
                role: "admin",
                username: "testadmin",
                email: "testadmin@example.com",
                passwordHash: passwordHash,
            })
            .onConflictDoNothing();

        // Login to get token
        const loginRes = await app.request("/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                identifier: "testadmin",
                password: "admin123",
            }),
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error("Login failed:", JSON.stringify(loginData, null, 2));
            throw new Error("Login failed");
        }
        adminToken = loginData.data.token;
    });

    test("POST /api/v1/posts - should create a new post", async () => {
        const res = await app.request("/api/v1/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                title: "Test Post",
                slug: testPostSlug,
                content: "This is a test post content",
                description: "Test description",
                isPublished: true,
                category: "Test Category",
                tags: ["test-tag-1", "test-tag-2"],
            }),
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.title).toBe("Test Post");
        expect(data.data.slug).toBe(testPostSlug);
        testPostId = data.data.id;
    });

    test("POST /api/v1/posts - should return 401 without token", async () => {
        const res = await app.request("/api/v1/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: "Unauthorized Post",
                content: "Content",
            }),
        });
        expect(res.status).toBe(401);
    });

    test("GET /api/v1/posts - should return a list of posts", async () => {
        const res = await app.request("/api/v1/posts");
        expect(res.status).toBe(200);
        const data = await res.json();
        const postSummarySchema = PostSchema.omit({ content: true });
        const ListResSchema = createPaginatedSuccessSchema(postSummarySchema);
        const result = ListResSchema.safeParse(data);
        if (!result.success) {
            console.error(z.treeifyError(result.error));
        }
        expect(result.success).toBe(true);
        type PostSummary = z.infer<typeof postSummarySchema>;
        const isPostFound = data.data.some(
            (p: PostSummary) => p.slug === testPostSlug,
        );
        expect(isPostFound).toBe(true);
    });

    test("GET /api/v1/posts/:slug - should return a single post", async () => {
        const res = await app.request(`/api/v1/posts/${testPostSlug}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        const result = createSuccessSchema(PostSchema).safeParse(data);
        if (!result.success) {
            console.error(z.treeifyError(result.error));
        }
        expect(result.success).toBe(true);
        expect(data.data.slug).toBe(testPostSlug);
    });

    test("GET /api/v1/posts/:slug - should return 404 for non-existent post", async () => {
        const res = await app.request("/api/v1/posts/non-existent-slug");
        expect(res.status).toBe(404);
    });

    test("PATCH /api/v1/posts/:id - should update a post", async () => {
        const res = await app.request(`/api/v1/posts/${testPostId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                title: "Updated Test Post",
            }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.title).toBe("Updated Test Post");
    });

    test("DELETE /api/v1/posts/:id - should delete a post", async () => {
        const res = await app.request(`/api/v1/posts/${testPostId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);

        // Verify it's gone
        const getRes = await app.request(`/api/v1/posts/${testPostSlug}`);
        expect(getRes.status).toBe(404);
    });
});
