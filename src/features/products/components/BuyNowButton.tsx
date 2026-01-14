"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui/spinner";
import useWishlistStore from "@/features/wishlists/useWishlistStore";

type BuyNowButtonProps = {
  productId: string;
  quantity?: number;
};

function BuyNowButton({ productId, quantity = 1 }: BuyNowButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const removeWishlistItems = useWishlistStore((s) => s.removeItems);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);

    try {
      // Create order with single product
      const orderProducts = {
        [productId]: { quantity },
      };

      const res = await fetch("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ orderProducts, guest: false }),
      });

      if (!res.ok) {
        toast({ title: "An error occurred" });
        setIsLoading(false);
        return;
      }

      const { orderId, purchasedProductIds } = await res.json();

      // Remove purchased items from wishlist store
      if (purchasedProductIds && purchasedProductIds.length > 0) {
        removeWishlistItems(purchasedProductIds);
      }

      // Show success toast
      toast({ title: "Order purchased" });

      // Small delay to ensure database transaction is committed
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to orders page with cache busting
      router.push(`/orders?t=${Date.now()}`);
      router.refresh();
    } catch (err) {
      toast({ title: "An error occurred" });
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleBuyNow} disabled={isLoading}>
      {isLoading ? (
        <>
          <Spinner className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Buy Now"
      )}
    </Button>
  );
}

export default BuyNowButton;
