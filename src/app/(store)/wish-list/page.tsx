import { Shell } from "@/components/layouts/Shell";
import { WishlistSectionWrapper } from "@/features/wishlists";
import Link from "next/link";
import React, { Suspense } from "react";
import ProductCardSkeleton from "@/features/products/components/ProductCardSkeleton";

type Props = {};

function WishListPage({}: Props) {
  return (
    <Shell>
      <section className="flex justify-between items-center py-8">
        <h1 className="text-3xl">Your Wishlist</h1>
        <Link href="/shop">Continue shopping</Link>
      </section>

      <Suspense
        fallback={
          <div className="container grid grid-cols-2 lg:grid-cols-4 gap-x-8">
            {[...Array(4)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <WishlistSectionWrapper />
      </Suspense>
    </Shell>
  );
}

export default WishListPage;
