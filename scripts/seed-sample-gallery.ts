import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.clientGallery.upsert({
    where: { slug: "sample-client-gallery" },
    update: {},
    create: {
      title: "Sample Client Gallery",
      slug: "sample-client-gallery",
      clientName: "Sample Client",
      accessCode: "SAMPLE-001",
      passwordHash: await bcrypt.hash("change-this-password", 12),
      isPublished: false,
      allowDownloads: true,
      description: "Unpublished sample gallery for testing the admin image URL workflow.",
      images: {
        create: [
          {
            imageUrl: "/images/portfolio/placeholder.svg",
            title: "Sample Image",
            caption: "Future upgrade: Cloudflare R2/S3 upload support.",
            sortOrder: 1
          }
        ]
      }
    }
  });

  console.log("Created or found unpublished sample gallery.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
