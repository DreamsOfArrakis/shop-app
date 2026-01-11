"use client";
import { useAuth } from "@/providers/AuthProvider";
import { DocumentType, gql } from "@/gql";
import { useQuery } from "@urql/next";
import { User } from "@supabase/supabase-js";
import { ProductCard } from "@/features/products";
import ProductCardSkeleton from "@/features/products/components/ProductCardSkeleton";

export const FetchWishlistQuery = gql(/* GraphQL */ `
  query FetchWishlistQuery($userId: UUID) {
    wishlistCollection(filter: { user_id: { eq: $userId } }) {
      edges {
        node {
          product_id
          product: products {
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
        }
      }
    }
  }
`);

type WishlistSectionProps = { user: User };

function WishlistSection({ user }: WishlistSectionProps) {
  const [{ data, fetching, error }] = useQuery({
    query: FetchWishlistQuery,
    variables: {
      userId: user.id,
    },
  });

  if (fetching) {
    return <LoadingWishlistSection />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data || !data.wishlistCollection) {
    return <EmptyWishlistSection />;
  }

  const wishlistItems = data.wishlistCollection.edges;

  if (wishlistItems.length === 0) {
    return <EmptyWishlistSection />;
  }

  return (
    <div className="container grid grid-cols-2 lg:grid-cols-4 gap-x-8">
      {wishlistItems.map(({ node }) => (
        <ProductCard key={node.product_id} product={node.product} />
      ))}
    </div>
  );
}

export default WishlistSection;

const LoadingWishlistSection = () => (
  <div className="container grid grid-cols-2 lg:grid-cols-4 gap-x-8">
    {[...Array(4)].map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

const EmptyWishlistSection = () => (
  <div className="container flex flex-col items-center justify-center py-16">
    <p className="text-xl text-muted-foreground mb-4">Your wishlist is empty</p>
    <p className="text-sm text-muted-foreground">
      Start adding products you love to your wishlist!
    </p>
  </div>
);
