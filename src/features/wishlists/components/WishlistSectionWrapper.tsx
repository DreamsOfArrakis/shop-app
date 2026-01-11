"use client";
import { useAuth } from "@/providers/AuthProvider";
import WishlistSection from "./WishlistSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function WishlistSectionWrapper() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <p className="text-xl text-muted-foreground mb-4">
          Please sign in to view your wishlist
        </p>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return <WishlistSection user={user} />;
}

export default WishlistSectionWrapper;

