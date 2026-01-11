import { NextResponse } from "next/server";
import { env } from "@/env.mjs";
import { getClient } from "@/lib/urql";
import { gql } from "@/gql";

// Simple test query
const TestQuery = gql(/* GraphQL */ `
  query TestQuery {
    productsCollection(first: 1) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`);

// Test collections query - using same structure as the actual page
const TestCollectionsQuery = gql(/* GraphQL */ `
  query TestCollectionsQuery($collectionSlug: String) {
    collectionsCollection(
      filter: { slug: { eq: $collectionSlug } }
      orderBy: [{ order: DescNullsLast }]
      first: 1
    ) {
      edges {
        node {
          id
          slug
          label
          title
          description
        }
      }
    }
  }
`);

export async function GET() {
  const debugInfo: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      hasDatabaseUrl: !!env.DATABASE_URL,
      hasSupabaseUrl: !!env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseProjectRef: !!env.NEXT_PUBLIC_SUPABASE_PROJECT_REF,
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      graphqlUrl: `https://${env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/graphql/v1`,
    },
    tests: {},
  };

  // Test 1: GraphQL endpoint connectivity
  try {
    const graphqlUrl = `https://${env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/graphql/v1`;
    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        query: "{ __typename }",
      }),
    });

    debugInfo.tests.graphqlEndpoint = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: graphqlUrl,
    };

    if (response.ok) {
      const data = await response.json();
      debugInfo.tests.graphqlEndpoint.data = data;
    } else {
      debugInfo.tests.graphqlEndpoint.error = await response.text();
    }
  } catch (error: any) {
    debugInfo.tests.graphqlEndpoint = {
      error: error.message,
      stack: error.stack,
    };
  }

  // Test 2: URQL client query
  try {
    const { data, error } = await getClient().query(TestQuery, {});
    debugInfo.tests.urqlQuery = {
      success: !error,
      hasData: !!data,
      error: error
        ? {
            message: error.message,
            networkError: error.networkError?.message,
            graphQLErrors: error.graphQLErrors,
          }
        : null,
      data: data ? Object.keys(data) : null,
    };
  } catch (error: any) {
    debugInfo.tests.urqlQuery = {
      error: error.message,
      stack: error.stack,
    };
  }

  // Test 3: Collections query (the one that's failing) - using direct fetch
  try {
    const graphqlUrl = `https://${env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/graphql/v1`;
    const collectionsQuery = `
      query TestCollectionsQuery($collectionSlug: String) {
        collectionsCollection(
          filter: { slug: { eq: $collectionSlug } }
          orderBy: [{ order: DescNullsLast }]
          first: 1
        ) {
          edges {
            node {
              id
              slug
              label
              title
              description
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
        query: collectionsQuery,
        variables: { collectionSlug: "bathroom" },
      }),
    });

    debugInfo.tests.collectionsQuery = {
      status: response.status,
      ok: response.ok,
    };

    if (response.ok) {
      const result = await response.json();
      debugInfo.tests.collectionsQuery.success = !result.errors;
      debugInfo.tests.collectionsQuery.hasData = !!result.data;
      debugInfo.tests.collectionsQuery.error = result.errors || null;
      debugInfo.tests.collectionsQuery.data = result.data
        ? {
            hasCollections: !!result.data.collectionsCollection,
            edgesCount: result.data.collectionsCollection?.edges?.length || 0,
            firstCollection:
              result.data.collectionsCollection?.edges?.[0]?.node || null,
          }
        : null;
    } else {
      debugInfo.tests.collectionsQuery.error = await response.text();
    }
  } catch (error: any) {
    debugInfo.tests.collectionsQuery = {
      error: error.message,
      stack: error.stack,
    };
  }

  // Test 4: Database connection (via Supabase REST as fallback)
  try {
    const restUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=id&limit=1`;
    const response = await fetch(restUrl, {
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    debugInfo.tests.restEndpoint = {
      status: response.status,
      ok: response.ok,
      url: restUrl,
    };

    if (response.ok) {
      const data = await response.json();
      debugInfo.tests.restEndpoint.hasData = Array.isArray(data);
      debugInfo.tests.restEndpoint.dataCount = Array.isArray(data)
        ? data.length
        : 0;
    } else {
      debugInfo.tests.restEndpoint.error = await response.text();
    }
  } catch (error: any) {
    debugInfo.tests.restEndpoint = {
      error: error.message,
    };
  }

  // Test 5: Product detail query (the one that's failing)
  try {
    const graphqlUrl = `https://${env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/graphql/v1`;
    const productQuery = `
      query TestProductQuery($productSlug: String) {
        productsCollection(filter: { slug: { eq: $productSlug } }) {
          edges {
            node {
              id
              name
              slug
              description
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
        query: productQuery,
        variables: { productSlug: "proudct-1" },
      }),
    });

    debugInfo.tests.productQuery = {
      status: response.status,
      ok: response.ok,
    };

    if (response.ok) {
      const result = await response.json();
      debugInfo.tests.productQuery.success = !result.errors;
      debugInfo.tests.productQuery.hasData = !!result.data;
      debugInfo.tests.productQuery.error = result.errors || null;
      debugInfo.tests.productQuery.data = result.data
        ? {
            hasProducts: !!result.data.productsCollection,
            edgesCount: result.data.productsCollection?.edges?.length || 0,
            firstProduct:
              result.data.productsCollection?.edges?.[0]?.node || null,
          }
        : null;
    } else {
      debugInfo.tests.productQuery.error = await response.text();
    }
  } catch (error: any) {
    debugInfo.tests.productQuery = {
      error: error.message,
      stack: error.stack,
    };
  }

  return NextResponse.json(debugInfo, { status: 200 });
}
