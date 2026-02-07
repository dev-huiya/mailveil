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
import { useI18n } from "@/hooks/use-i18n";
import type { CatchAllRule, Destination, EmailRoutingSettings } from "@/types/cloudflare";

export default function SettingsPage() {
  const { t } = useI18n();
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
      toast.error(t("settings.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      toast.success(enabled ? t("settings.routingEnabled") : t("settings.routingDisabled"));
    } catch {
      toast.error(t("settings.updateRoutingError"));
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

      toast.success(t("settings.catchAllUpdated"));
    } catch {
      toast.error(t("settings.updateCatchAllError"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.emailRouting")}</CardTitle>
          <CardDescription>
            {t("settings.emailRoutingDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settings.emailRouting")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.status", { status: settings?.status || "Unknown" })}
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
          <CardTitle>{t("settings.catchAll")}</CardTitle>
          <CardDescription>
            {t("settings.catchAllDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>{t("settings.enableCatchAll")}</Label>
            <Switch
              checked={catchAllEnabled}
              onCheckedChange={setCatchAllEnabled}
              disabled={updating}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.action")}</Label>
              <Select
                value={catchAllAction}
                onValueChange={(v) => setCatchAllAction(v as "forward" | "drop")}
                disabled={updating || !catchAllEnabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forward">{t("settings.forward")}</SelectItem>
                  <SelectItem value="drop">{t("settings.drop")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {catchAllAction === "forward" && (
              <div className="space-y-2">
                <Label>{t("settings.forwardTo")}</Label>
                <Select
                  value={catchAllDest}
                  onValueChange={setCatchAllDest}
                  disabled={updating || !catchAllEnabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.selectDestination")} />
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
            {updating ? t("common.saving") : t("common.save")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
