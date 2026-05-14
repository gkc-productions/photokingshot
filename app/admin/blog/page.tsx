import Link from "next/link";
import { deleteBlogPost } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdmin();
  const result = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } })
    .then((posts) => ({ posts, hasDb: true }))
    .catch(() => ({ posts: [], hasDb: false }));
  return (
    <section className="section-shell py-10">
      <div className="flex items-center justify-between gap-4">
        <div><p className="eyebrow">Admin</p><h1 className="mt-3 text-4xl font-black">Blog posts</h1></div>
        <Link href="/admin/blog/new" className="gold-button rounded-sm px-4 py-3 text-sm font-black">New Post</Link>
      </div>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="blog admin" /></div> : null}
      <div className="mt-8 grid gap-4">
        {result.posts.map((post) => (
          <article key={post.id} className="surface-card rounded-sm p-5">
            <p className="eyebrow">{post.status} / {post.category}</p>
            <h2 className="mt-2 text-2xl font-black">{post.title}</h2>
            <p className="muted-copy mt-2">{post.excerpt}</p>
            <div className="mt-4 flex gap-3">
              <Link href={`/admin/blog/${post.id}/edit`} className="text-[var(--gold)]">Edit</Link>
              <form action={deleteBlogPost}><input type="hidden" name="id" value={post.id} /><button className="text-red-300">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
