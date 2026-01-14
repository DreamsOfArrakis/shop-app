"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const previousPathRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Track navigation start by intercepting link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      // Check if it's an internal Next.js link
      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.hasAttribute("download") &&
        link.getAttribute("target") !== "_blank"
      ) {
        const href = link.getAttribute("href");
        const currentPath = pathname + searchParams.toString();
        
        if (href && href !== currentPath && !isLoading) {
          setIsLoading(true);
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, searchParams, isLoading]);

  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() || "");

    // If pathname changed and we're loading, wait a bit then hide
    if (currentPath !== previousPathRef.current && isLoading) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Hide loader after page has had time to render
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        previousPathRef.current = currentPath;
      }, 200);
    } else if (currentPath !== previousPathRef.current) {
      // Update previous path even if we weren't loading
      previousPathRef.current = currentPath;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, searchParams, isLoading]);

  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm transition-opacity duration-200",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-label="Loading page"
      role="status"
    >
      <div className="flex flex-col items-center gap-6">
        {/* SpinKit Circle Loader */}
        <div
          className="sk-circle"
          style={
            {
              "--sk-size": "60px",
              "--sk-color": "hsl(var(--primary))",
            } as React.CSSProperties
          }
        >
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
          <div className="sk-circle-dot"></div>
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  );
}
