"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  FormDescription,
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
import { getURL } from "@/lib/utils";

const resetPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

type FormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit({ email }: FormData) {
    setIsLoading(true);

    // Get the site URL and construct the password reset callback URL
    const siteUrl = getURL();
    const redirectTo = `${siteUrl}auth/callback?type=recovery&next=/sign-in`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    // Success - show dialog
    setUserEmail(email);
    setShowSuccessDialog(true);
    setIsLoading(false);
    form.reset();
  }

  function handleDialogClose() {
    setShowSuccessDialog(false);
    router.push("/sign-in");
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@domain.com" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </FormDescription>
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
            Send reset link
            <span className="sr-only">Send password reset link</span>
          </Button>
        </form>
      </Form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
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
              We&apos;ve sent a password reset link to{" "}
              <span className="font-semibold text-foreground">{userEmail}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 text-sm text-muted-foreground">
            <p>
              Please check your email and click the link to reset your password.
            </p>
            <p>
              The link will expire in 1 hour. If you don&apos;t receive an
              email, check your spam folder.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose} className="w-full">
              Back to Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ResetPasswordForm;
