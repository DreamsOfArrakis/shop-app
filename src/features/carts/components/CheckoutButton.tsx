"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import useCartStore from "../useCartStore";
import useWishlistStore from "@/features/wishlists/useWishlistStore";
import type { CartItems } from "@/features/carts";

type CheckoutButtonProps = React.ComponentProps<typeof Button> & {
  order: CartItems;
  guest: boolean;
};

function CheckoutButton({ order, guest, ...props }: CheckoutButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const removeAllProducts = useCartStore((s) => s.removeAllProducts);
  const removeWishlistItems = useWishlistStore((s) => s.removeItems);
  const [isLoading, setIsLoading] = useState(false);

  const onClickHandler = async () => {
    // Require authentication for checkout
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ orderProducts: order, guest: false }),
      });

      if (!res.ok) {
        toast({ title: "An error occurred" });
        setIsLoading(false);
        return;
      }

      const { orderId, purchasedProductIds } = await res.json();

      // Clear guest cart if it exists
      if (guest) {
        removeAllProducts();
      }

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
    <Button
      {...props}
      className={cn("w-full", props.className)}
      onClick={onClickHandler}
      disabled={isLoading}
    >
      {isLoading ? "Loading ...  " : "Check out"}
      {isLoading && (
        <Spinner className="ml-3 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
    </Button>
  );
}

export default CheckoutButton;
