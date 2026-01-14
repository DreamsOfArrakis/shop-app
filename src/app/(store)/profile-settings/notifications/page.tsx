"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);

  const handleSave = () => {
    // In a real app, this would save to the database
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications and updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose what email notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-all">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive all email notifications
              </p>
            </div>
            <Switch
              id="email-all"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-updates">Order updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about your order status and shipping updates
              </p>
            </div>
            <Switch
              id="order-updates"
              checked={orderUpdates}
              onCheckedChange={setOrderUpdates}
              disabled={!emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="product-updates">Product updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about products you&apos;re interested in
              </p>
            </div>
            <Switch
              id="product-updates"
              checked={productUpdates}
              onCheckedChange={setProductUpdates}
              disabled={!emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="promotional">Promotional emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new products, special offers, and sales
              </p>
            </div>
            <Switch
              id="promotional"
              checked={promotionalEmails}
              onCheckedChange={setPromotionalEmails}
              disabled={!emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletter">Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Subscribe to our monthly newsletter with tips and updates
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={newsletter}
              onCheckedChange={setNewsletter}
              disabled={!emailNotifications}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

