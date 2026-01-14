"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });

      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Privacy</h3>
        <p className="text-sm text-muted-foreground">
          Manage your privacy settings and data preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Control how your data is used and stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <p className="text-sm text-muted-foreground">
              Your profile information is private and only visible to you. We
              never share your personal information with third parties.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Data Collection</Label>
            <p className="text-sm text-muted-foreground">
              We collect only the information necessary to provide our services.
              This includes your name, email, and order history.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cookies</Label>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your experience, remember your
              preferences, and analyze site usage. You can manage cookie
              preferences in your browser settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Deletion</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. This will
              permanently delete your account, orders, wishlist, and all
              associated data.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Deleting your account will permanently remove:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your profile and account information</li>
                      <li>Your order history</li>
                      <li>Your wishlist and saved items</li>
                      <li>All associated data</li>
                    </ul>
                    <p className="mt-2">If you&apos;re sure you want to proceed, click &quot;Delete Account&quot; below.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

