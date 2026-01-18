import { type Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { ResetPasswordForm } from "@/features/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export default function ResetPasswordPage() {
  return (
    <section>
      <Card className="border-0 shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Suspense
            fallback={
              <div className="bg-zinc-400 animate-pulse max-w-xl w-full h-[360px]" />
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
        <CardFooter className="grid gap-4">
          <div className="text-sm text-muted-foreground text-center">
            Remember your password?{" "}
            <Link
              aria-label="Sign in"
              href="/sign-in"
              className="text-primary underline-offset-4 transition-colors hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}

