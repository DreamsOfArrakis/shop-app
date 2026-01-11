import type { NavItemWithOptionalChildren } from "@/types";

import { slugify } from "@/lib/utils";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "THE FURNITURE STORE",
  description: "Ecommerce Application built with NextJS 14",
  url: "https://hiyori.hugo-coding.com",
  address: "668 E Harbor Blvd\nVentura, CA 93001",
  disclaimer: "*This is a test/demo site. No products are available for purchase. This site is for testing and demonstration purposes only. Built with Next.js 14 (React, TypeScript), Tailwind CSS, Supabase (PostgreSQL database, Authentication, Storage), Drizzle ORM, and deployed on Vercel.",
  mainNav: [
    {
      title: "Shop",
      href: "/shop",
      description: "All the products we have to offer.",
      items: [],
    },
    {
      title: "Our Story",
      href: "https://github.com/clonglam/HIYORI-master",
      description: "Our Story.",
      items: [],
    },
    {
      title: "Brands & Designers",
      href: "https://github.com/clonglam/HIYORI-master",
      description: "Read our latest blog posts.",
      items: [],
    },
    {
      title: "Blog",
      href: "https://blog.hugo-coding.com",
      description: "Read our latest blog posts.",
      items: [],
    },
    {
      title: "Contact",
      href: "https://hugo-coding.com/#contact",
      description: "Read our latest blog posts.",
      items: [],
    },
  ] satisfies NavItemWithOptionalChildren[],
};
