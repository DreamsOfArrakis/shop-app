import SectionHeading from "@/components/layouts/SectionHeading";
import { Shell } from "@/components/layouts/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionBanner } from "@/features/collections";
import { SearchProductsGridSkeleton } from "@/features/products";
import {
  FilterSelections,
  SearchProductsInifiteScroll,
} from "@/features/search";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { toTitleCase, unslugify } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface CategoryPageProps {
  params: Promise<{
    collectionSlug: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { collectionSlug } = await params;
  return {
    title: `THE FURNITURE STORE | ${toTitleCase(unslugify(collectionSlug))}`,
    description: `THE FURNITURE STORE | Buy ${collectionSlug} funiture.`,
  };
}

const CollectionRouteQuery = gql(/* GraphQL */ `
  query CollectionRouteQuery($collectionSlug: String) {
    collectionsCollection(
      filter: { slug: { eq: $collectionSlug } }
      orderBy: [{ order: DescNullsLast }]
      first: 1
    ) {
      edges {
        node {
          title
          label
          description
          ...CollectionBannerFragment
          productsCollection(orderBy: [{ created_at: DescNullsLast }]) {
            pageInfo {
              hasNextPage
            }
            edges {
              node {
                id
                ...ProductCardFragment
              }
            }
          }
        }
      }
    }
  }
`);

async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { collectionSlug } = await params;
  const resolvedSearchParams = await searchParams;

  // Use direct fetch since URQL has issues with fragments
  const { env } = await import("@/env.mjs");
  const graphqlUrl = `https://${env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/graphql/v1`;

  // Include fragment definitions in the query
  const query = `
    fragment CollectionBannerFragment on collections {
      id
      label
      slug
      featuredImage: medias {
        id
        key
        alt
      }
    }
    
    fragment ProductCardFragment on products {
      id
      name
      description
      rating
      slug
      badge
      price
      featuredImage: medias {
        id
        key
        alt
      }
      collections {
        id
        label
        slug
      }
    }
    
    query CollectionRouteQuery($collectionSlug: String) {
      collectionsCollection(
        filter: { slug: { eq: $collectionSlug } }
        orderBy: [{ order: DescNullsLast }]
        first: 1
      ) {
        edges {
          node {
            title
            label
            description
            ...CollectionBannerFragment
            productsCollection(orderBy: [{ created_at: DescNullsLast }]) {
              pageInfo {
                hasNextPage
              }
              edges {
                node {
                  id
                  ...ProductCardFragment
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      query,
      variables: { collectionSlug },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error("❌ GraphQL Errors:", json.errors);
    return notFound();
  }

  const data = json.data;

  // Check if collection exists
  if (
    !data?.collectionsCollection?.edges ||
    data.collectionsCollection.edges.length === 0 ||
    !data.collectionsCollection.edges[0]?.node
  ) {
    return notFound();
  }

  const collection = data.collectionsCollection.edges[0].node;
  const productsList = collection.productsCollection;

  // Allow empty products collection - just show empty state
  // Only return 404 if productsCollection is explicitly null (error case)
  if (productsList === null) {
    console.error("productsCollection is null for collection:", collectionSlug);
    return notFound();
  }

  // Debug: Log collection data
  console.log("Collection data:", {
    slug: collectionSlug,
    title: collection.title,
    description: collection.description,
  });

  return (
    <Shell>
      <CollectionBanner collectionBannerData={collection} />
      <SectionHeading
        heading={collection.title}
        description={collection.description || undefined}
      />

      <Suspense
        fallback={
          <div>
            <Skeleton className="max-w-xl h-8 mb-3" />
            <Skeleton className="max-w-2xl h-8" />
          </div>
        }
      >
        <FilterSelections shopLayout={false} />
      </Suspense>

      <Suspense fallback={<SearchProductsGridSkeleton />}>
        <SearchProductsInifiteScroll collectionId={collection.id} />
      </Suspense>
    </Shell>
  );
}

export default CategoryPage;
