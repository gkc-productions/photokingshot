export function DbNotice({ area = "content" }: { area?: string }) {
  return (
    <div className="rounded-sm border border-[#d6a83f]/30 bg-[#d6a83f]/10 p-5 text-sm leading-6 text-[#f4d98d]">
      <p className="font-black text-white">Database setup needed</p>
      <p className="mt-2">The {area} is ready, but PostgreSQL tables are not reachable from this server right now. Run the Prisma migration command after the production database is available.</p>
      <code className="mt-3 block overflow-x-auto rounded-sm bg-black/50 p-3 text-xs text-white">npx prisma migrate deploy</code>
    </div>
  );
}
