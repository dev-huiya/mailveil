"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { CatchAllRule, Destination, EmailRoutingSettings } from "@/types/cloudflare";

export default function SettingsPage() {
  const [settings, setSettings] = useState<EmailRoutingSettings | null>(null);
  const [catchAll, setCatchAll] = useState<CatchAllRule | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [catchAllEnabled, setCatchAllEnabled] = useState(false);
  const [catchAllAction, setCatchAllAction] = useState<"forward" | "drop">("drop");
  const [catchAllDest, setCatchAllDest] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, catchAllRes, destRes] = await Promise.all([
        fetch("/api/cloudflare/settings"),
        fetch("/api/cloudflare/catch-all"),
        fetch("/api/cloudflare/destinations"),
      ]);

      const settingsData = await settingsRes.json();
      const catchAllData = await catchAllRes.json();
      const destData = await destRes.json();

      setSettings(settingsData.result || null);
      setCatchAll(catchAllData.result || null);
      setDestinations(destData.result || []);

      if (catchAllData.result) {
        setCatchAllEnabled(catchAllData.result.enabled);
        const action = catchAllData.result.actions?.[0];
        setCatchAllAction(action?.type || "drop");
        setCatchAllDest(action?.value?.[0] || "");
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleRouting = async (enabled: boolean) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/cloudflare/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) throw new Error();

      setSettings((prev) => (prev ? { ...prev, enabled } : null));
      toast.success(`Email routing ${enabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update email routing");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCatchAll = async () => {
    setUpdating(true);
    try {
      const actions =
        catchAllAction === "forward" && catchAllDest
          ? [{ type: "forward" as const, value: [catchAllDest] }]
          : [{ type: "drop" as const }];

      const res = await fetch("/api/cloudflare/catch-all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: catchAllEnabled,
          matchers: [{ type: "all" }],
          actions,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Catch-all rule updated");
    } catch {
      toast.error("Failed to update catch-all rule");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Email Routing</CardTitle>
          <CardDescription>
            Enable or disable email routing for your domain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Routing</Label>
              <p className="text-sm text-muted-foreground">
                Status: {settings?.status || "Unknown"}
              </p>
            </div>
            <Switch
              checked={settings?.enabled ?? false}
              onCheckedChange={handleToggleRouting}
              disabled={updating}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catch-All Rule</CardTitle>
          <CardDescription>
            Handle emails that don&apos;t match any specific rule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Enable Catch-All</Label>
            <Switch
              checked={catchAllEnabled}
              onCheckedChange={setCatchAllEnabled}
              disabled={updating}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={catchAllAction}
                onValueChange={(v) => setCatchAllAction(v as "forward" | "drop")}
                disabled={updating || !catchAllEnabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forward">Forward</SelectItem>
                  <SelectItem value="drop">Drop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {catchAllAction === "forward" && (
              <div className="space-y-2">
                <Label>Forward To</Label>
                <Select
                  value={catchAllDest}
                  onValueChange={setCatchAllDest}
                  disabled={updating || !catchAllEnabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations
                      .filter((d) => d.verified)
                      .map((d) => (
                        <SelectItem key={d.id} value={d.email}>
                          {d.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            onClick={handleSaveCatchAll}
            disabled={
              updating ||
              (catchAllAction === "forward" && !catchAllDest && catchAllEnabled)
            }
          >
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
