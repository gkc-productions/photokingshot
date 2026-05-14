import { prisma } from "../lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const templates = [
  {
    title: "How to Prepare for a Premium Atlanta Portrait Session",
    category: "Session Prep",
    excerpt: "A practical draft outline for wardrobe, timing, location planning, and confident portrait direction.",
    content: "Draft outline:\n\n- Wardrobe choices\n- Arrival timing\n- Location mood\n- Shot list ideas\n- Delivery expectations"
  },
  {
    title: "Graduation Photo Ideas That Feel Personal, Not Generic",
    category: "Graduation",
    excerpt: "A draft guide for graduates who want images with polish, pride, and personality.",
    content: "Draft outline:\n\n- Campus details\n- Family combinations\n- Cap and gown moments\n- Creative portraits\n- Announcement usage"
  },
  {
    title: "What Makes Event Photography Look Professional",
    category: "Events",
    excerpt: "A draft breakdown of timing, light, storytelling, and the small details that make event galleries stronger.",
    content: "Draft outline:\n\n- Room coverage\n- Key people\n- Candid timing\n- Detail images\n- Gallery pacing"
  },
  {
    title: "Camera Gear Worth Considering for Better Low-Light Photos",
    category: "Gear",
    excerpt: "A draft gear article placeholder for low-light event and portrait photography.",
    content: "Draft outline:\n\n- Fast lenses\n- Portable lighting\n- Stabilization\n- Memory cards\n- Practical setup notes"
  },
  {
    title: "How Churches and Community Groups Can Plan Photo Coverage",
    category: "Community",
    excerpt: "A draft planning guide for ministry milestones, outreach events, and community documentation.",
    content: "Draft outline:\n\n- Schedule planning\n- Key moments\n- Respectful coverage\n- Group photos\n- Delivery needs"
  },
  {
    title: "Creative Editorial Shoot Planning for Artists and Brands",
    category: "Creative",
    excerpt: "A draft framework for turning a creative concept into a focused editorial shoot.",
    content: "Draft outline:\n\n- Mood board\n- Location\n- Wardrobe\n- Lighting direction\n- Final asset list"
  }
];

async function main() {
  const runId = Date.now();

  // Future: call the OpenAI API or Twin AI here to expand approved outlines into editable draft copy.
  // Keep generated posts as DRAFT until a human reviews, edits, and publishes them.
  await prisma.blogPost.createMany({
    data: templates.map((post, index) => ({
      ...post,
      slug: `${slugify(post.title)}-${runId}-${index + 1}`,
      status: "DRAFT",
      hasAffiliateLinks: false
    }))
  });

  console.log(`Created ${templates.length} draft blog placeholders.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
