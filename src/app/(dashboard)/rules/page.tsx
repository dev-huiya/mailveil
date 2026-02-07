"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Copy,
  Trash2,
  Download,
  ArrowRight,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { useRules } from "@/hooks/use-rules";
import type { EmailRoutingRule } from "@/types/cloudflare";

export default function RulesPage() {
  const { t } = useI18n();
  const { rules, setRules, loading } = useRules();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<EmailRoutingRule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleToggle = async (rule: EmailRoutingRule) => {
    try {
      const res = await fetch(`/api/cloudflare/rules/${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rule.name,
          enabled: !rule.enabled,
          matchers: rule.matchers,
          actions: rule.actions,
        }),
      });

      if (!res.ok) throw new Error();

      setRules((prev) =>
        prev.map((r) =>
          r.id === rule.id ? { ...r, enabled: !r.enabled } : r
        )
      );
      toast.success(!rule.enabled ? t("rules.enabled") : t("rules.disabled_toast"));
    } catch {
      toast.error(t("rules.updateError"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/cloudflare/rules/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success(t("rules.deleted"));
    } catch {
      toast.error(t("rules.deleteError"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success(t("common.copied"));
    else toast.error(t("common.copyFailed"));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mailveil-rules-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("rules.exported"));
  };

  const startEditing = (rule: EmailRoutingRule) => {
    setEditingRule(rule.id);
    setEditName(rule.name);
  };

  const cancelEditing = () => {
    setEditingRule(null);
    setEditName("");
  };

  const handleRename = async (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule || !editName.trim() || editName.trim() === rule.name) {
      cancelEditing();
      return;
    }

    try {
      const res = await fetch(`/api/cloudflare/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          enabled: rule.enabled,
          matchers: rule.matchers,
          actions: rule.actions,
        }),
      });

      if (!res.ok) throw new Error();

      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId ? { ...r, name: editName.trim() } : r
        )
      );
      toast.success(t("rules.nameUpdated"));
    } catch {
      toast.error(t("rules.updateError"));
    } finally {
      cancelEditing();
    }
  };

  const filteredRules = rules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      rule.matchers[0]?.value?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("rules.title")}</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("rules.title")}</h1>
        <div className="flex gap-2">
          {rules.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t("common.export")}
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/rules/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("rules.newRule")}
            </Link>
          </Button>
        </div>
      </div>

      {rules.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("rules.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {filteredRules.length === 0 && rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">{t("rules.noRules")}</p>
            <Button asChild>
              <Link href="/rules/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("rules.createFirst")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile layout */}
          <div className="md:hidden space-y-3">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="py-0 gap-0">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    {editingRule === rule.id ? (
                      <div className="flex items-center gap-1 flex-1 mr-2">
                        <Input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(rule.id);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="h-7 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => handleRename(rule.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={cancelEditing}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-1 mr-2 min-w-0">
                        <span className="font-medium text-sm truncate">
                          {rule.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => startEditing(rule)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggle(rule)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-muted-foreground truncate">
                      {rule.matchers[0]?.value}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleCopy(rule.matchers[0]?.value || "")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {rule.actions[0]?.type === "forward"
                        ? rule.actions[0]?.value?.[0]
                        : t("rules.drop")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={rule.enabled ? "default" : "secondary"}>
                      {rule.enabled ? t("common.active") : t("common.inactive")}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteTarget(rule)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop layout */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("rules.name")}</TableHead>
                  <TableHead>{t("rules.from")}</TableHead>
                  <TableHead className="w-[40px]" />
                  <TableHead>{t("rules.to")}</TableHead>
                  <TableHead className="w-[100px]">{t("rules.status")}</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {editingRule === rule.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            ref={editInputRef}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(rule.id);
                              if (e.key === "Escape") cancelEditing();
                            }}
                            className="h-7 text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleRename(rule.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={cancelEditing}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span>{rule.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => startEditing(rule)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="text-xs">{rule.matchers[0]?.value}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleCopy(rule.matchers[0]?.value || "")
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="px-0">
                      <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {rule.actions[0]?.type === "forward"
                        ? rule.actions[0]?.value?.[0]
                        : t("rules.drop")}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggle(rule)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteTarget(rule)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rules.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("rules.deleteDescription", { name: deleteTarget?.name || "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
