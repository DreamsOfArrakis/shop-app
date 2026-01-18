"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Icons } from "./icons";
import Branding from "./Branding";
import SocialMedias from "./SocialMedias";

export function SideMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="p-0">
          <Icons.menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full md:max-w-xl pr-[4rem]"
        closeButtonClassName="w-6 h-6 md:w-10 md:h-10"
      >
        <div className="grid py-8 gap-y-3 ml-12 md:ml-[96px] mt-[120px]">
          <Link href="/shop" className="text-xl md:text-3xl">
            Shop All
          </Link>
          <Link
            href="/collections/living-room-planning"
            className="text-xl md:text-3xl"
          >
            Living Room
          </Link>
          <Link href="/collections/bathroom" className="text-xl md:text-3xl">
            Bathroom
          </Link>
          <Link
            href="/collections/kitchen-planning"
            className="text-xl md:text-3xl"
          >
            Kitchen
          </Link>
          <Link
            href="/collections/Bedroom-planning"
            className="text-xl md:text-3xl"
          >
            Bedroom
          </Link>
        </div>

        <SheetFooter className="fixed grid bottom-[96px] ml-12 md:ml-[96px] space-x-0">
          <Branding className="text-xl md:text-4xl md:mb-3" />

          <div className="mb-8 text-muted-foreground">
            <p className="text-xs md:text-sm ml-0 whitespace-pre-line">
              {siteConfig.address}
            </p>
          </div>

          <SocialMedias />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
