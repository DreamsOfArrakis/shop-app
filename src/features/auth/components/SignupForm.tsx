"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Mail } from "lucide-react";

import { Icons } from "@/components/layouts/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useToast } from "@/components/ui/use-toast";
import { PasswordInput } from "./PasswordInput";
import { signupSchema } from "../validations";
import { getURL } from "@/lib/utils";

type FormData = z.infer<typeof signupSchema>;

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      password: searchParams.get("password") || "",
    },
  });

  async function onSubmit({ email, password, name }: FormData) {
    setIsLoading(true);

    // Get the site URL and construct the auth callback URL
    const siteUrl = getURL();
    const redirectTo = `${siteUrl}auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: redirectTo,
      },
    });

    const unknownError = "Something went wrong, please try again.";

    if (error) {
      toast({
        title: "Error",
        description: error?.message || unknownError,
      });
      setIsLoading(false);
      return;
    }

    if (data) {
      // Check if email confirmation is required
      // When email confirmation is enabled, data.session will be null
      if (data.user && !data.session) {
        // Email confirmation is required
        setUserEmail(email);
        setShowVerificationDialog(true);
        setIsLoading(false);
        // Reset form
        form.reset();
      } else {
        // User is immediately authenticated (email confirmation disabled)
        const from = searchParams?.get("from");
        router.push(from ? from : "/");
      }
    }
  }

  function handleDialogClose() {
    setShowVerificationDialog(false);
    // Navigate to sign-in page after closing dialog
    const from = searchParams?.get("from");
    router.push(from ? `/sign-in?from=${encodeURIComponent(from)}` : "/sign-in");
  }

  return (
    <>
      <Form {...form}>
        <form
          className="grid gap-4"
          onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="How should we call you?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@domain.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="**********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Continue
            <span className="sr-only">Continue to email verification page</span>
          </Button>
        </form>
      </Form>

      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Check your email
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              We&apos;ve sent a verification link to{" "}
              <span className="font-semibold text-foreground">{userEmail}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 text-sm text-muted-foreground">
            <p>
              Please check your email and click the verification link to activate your account.
            </p>
            <p>
              Once verified, you&apos;ll be able to sign in and start shopping.
            </p>
            <p className="text-xs pt-2">
              Didn&apos;t receive the email? Check your spam folder or contact support if the issue persists.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose} className="w-full">
              Go to Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SignUpForm;
