export function DbNotice({ area = "content" }: { area?: string }) {
  return (
    <div className="gold-notice rounded-sm p-5 text-sm leading-6">
      <p className="font-black text-[var(--foreground)]">Database setup needed</p>
      <p className="mt-2">The {area} is ready, but PostgreSQL tables are not reachable from this server right now. Run the Prisma migration command after the production database is available.</p>
      <code className="mt-3 block overflow-x-auto rounded-sm bg-black/80 p-3 text-xs text-white">npx prisma migrate deploy</code>
    </div>
  );
}
