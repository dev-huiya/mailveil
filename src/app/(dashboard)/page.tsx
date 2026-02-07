"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MailCheck, MailX, ShieldCheck, Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import type { EmailRoutingRule, CatchAllRule } from "@/types/cloudflare";

interface DashboardData {
  rules: EmailRoutingRule[];
  catchAll: CatchAllRule | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    rules: [],
    catchAll: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [rulesRes, catchAllRes] = await Promise.all([
          fetch("/api/cloudflare/rules"),
          fetch("/api/cloudflare/catch-all"),
        ]);

        const rulesData = await rulesRes.json();
        const catchAllData = await catchAllRes.json();

        setData({
          rules: rulesData.result || [],
          catchAll: catchAllData.result || null,
        });
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalRules = data.rules.length;
  const activeRules = data.rules.filter((r) => r.enabled).length;
  const inactiveRules = totalRules - activeRules;
  const catchAllEnabled = data.catchAll?.enabled ?? false;

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success("Copied to clipboard");
    else toast.error("Failed to copy");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/rules/new">
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <MailCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <MailX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveRules}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Catch-All</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={catchAllEnabled ? "default" : "secondary"}>
              {catchAllEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {data.rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rules yet.{" "}
              <Link href="/rules/new" className="text-primary hover:underline">
                Create your first rule
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {data.rules.slice(0, 5).map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{rule.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-muted-foreground truncate">
                        {rule.matchers[0]?.value}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={() => handleCopy(rule.matchers[0]?.value || "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant={rule.enabled ? "default" : "secondary"}>
                    {rule.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
              {data.rules.length > 5 && (
                <Button variant="link" asChild className="px-0">
                  <Link href="/rules">View all {totalRules} rules</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
