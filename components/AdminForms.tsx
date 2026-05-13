import type { AffiliateProduct, BlogPost, PortfolioItem } from "@prisma/client";
import { upsertAffiliateProduct, upsertBlogPost, upsertPortfolioItem } from "@/app/actions";

const input = "mt-2 w-full rounded-sm border border-white/10 px-3 py-3";
const label = "text-sm font-semibold text-white/78";

export function BlogPostForm({ post }: { post?: BlogPost }) {
  return (
    <form action={upsertBlogPost} className="grid gap-4 rounded-sm border border-white/10 bg-white/[0.04] p-5">
      <input type="hidden" name="id" value={post?.id || ""} />
      <label className={label}>Title<input name="title" required defaultValue={post?.title} className={input} /></label>
      <label className={label}>Slug<input name="slug" defaultValue={post?.slug} className={input} /></label>
      <label className={label}>Excerpt<textarea name="excerpt" required rows={3} defaultValue={post?.excerpt} className={input} /></label>
      <label className={label}>Content<textarea name="content" required rows={10} defaultValue={post?.content} className={input} /></label>
      <label className={label}>Category<input name="category" required defaultValue={post?.category || "Photography"} className={input} /></label>
      <label className={label}>Status<select name="status" defaultValue={post?.status || "DRAFT"} className={input}><option>DRAFT</option><option>PUBLISHED</option></select></label>
      <label className="flex items-center gap-3 text-sm font-semibold text-white/78">
        <input type="hidden" name="hasAffiliateLinks" value="false" />
        <input type="checkbox" name="hasAffiliateLinks" value="true" defaultChecked={post?.hasAffiliateLinks} className="h-4 w-4" />
        Has affiliate links
      </label>
      <button className="min-h-12 rounded-sm bg-[#d6a83f] px-5 py-3 text-sm font-black uppercase tracking-wide text-black hover:bg-white">Save Post</button>
    </form>
  );
}

export function AffiliateProductForm({ product }: { product?: AffiliateProduct }) {
  return (
    <form action={upsertAffiliateProduct} className="grid gap-4 rounded-sm border border-white/10 bg-white/[0.04] p-5">
      <input type="hidden" name="id" value={product?.id || ""} />
      <label className={label}>Product title<input name="title" required defaultValue={product?.title} className={input} /></label>
      <label className={label}>Category<input name="category" required defaultValue={product?.category || "Camera Gear"} className={input} /></label>
      <label className={label}>Best for<input name="bestFor" required defaultValue={product?.bestFor} className={input} /></label>
      <label className={label}>Description<textarea name="description" required rows={5} defaultValue={product?.description} className={input} /></label>
      <label className={label}>Affiliate URL<input name="affiliateUrl" type="url" required defaultValue={product?.affiliateUrl || "https://www.amazon.com/"} className={input} /></label>
      <label className="flex items-center gap-3 text-sm font-semibold text-white/78">
        <input type="hidden" name="isActive" value="false" />
        <input type="checkbox" name="isActive" value="true" defaultChecked={product?.isActive ?? true} className="h-4 w-4" />
        Active on public gear page
      </label>
      <button className="min-h-12 rounded-sm bg-[#d6a83f] px-5 py-3 text-sm font-black uppercase tracking-wide text-black hover:bg-white">Save Product</button>
    </form>
  );
}

export function PortfolioItemForm({ item }: { item?: PortfolioItem }) {
  return (
    <form action={upsertPortfolioItem} className="grid gap-4 rounded-sm border border-white/10 bg-white/[0.04] p-5">
      <input type="hidden" name="id" value={item?.id || ""} />
      <label className={label}>Title<input name="title" required defaultValue={item?.title} className={input} /></label>
      <label className={label}>Category<input name="category" required defaultValue={item?.category || "Portraits"} className={input} /></label>
      <label className={label}>Image URL<input name="imageUrl" type="url" required defaultValue={item?.imageUrl || "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"} className={input} /></label>
      <label className={label}>Description<textarea name="description" required rows={5} defaultValue={item?.description} className={input} /></label>
      <label className="flex items-center gap-3 text-sm font-semibold text-white/78">
        <input type="hidden" name="isFeatured" value="false" />
        <input type="checkbox" name="isFeatured" value="true" defaultChecked={item?.isFeatured} className="h-4 w-4" />
        Feature on home page
      </label>
      <button className="min-h-12 rounded-sm bg-[#d6a83f] px-5 py-3 text-sm font-black uppercase tracking-wide text-black hover:bg-white">Save Portfolio Item</button>
    </form>
  );
}
