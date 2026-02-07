"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Star, StarOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard, formatDate } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useI18n } from "@/hooks/use-i18n";
import type { Destination } from "@/types/cloudflare";

export default function DestinationsPage() {
  const { t } = useI18n();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [defaultDestination, setDefaultDestination] = useState<string>("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const saved = localStorage.getItem("mailveil-default-destination");
    if (saved) setDefaultDestination(saved);
  }, []);

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await fetch("/api/cloudflare/destinations");
      const data = await res.json();
      setDestinations(data.result || []);
    } catch {
      toast.error(t("destinations.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const handleAdd = async () => {
    if (!newEmail) return;
    setAdding(true);

    try {
      const res = await fetch("/api/cloudflare/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!res.ok) throw new Error();

      toast.success(t("destinations.verificationSent"));
      setNewEmail("");
      setAddOpen(false);
      fetchDestinations();
    } catch {
      toast.error(t("destinations.addError"));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(
        `/api/cloudflare/destinations/${deleteTarget.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      setDestinations((prev) =>
        prev.filter((d) => d.id !== deleteTarget.id)
      );
      if (defaultDestination === deleteTarget.email) {
        setDefaultDestination("");
        localStorage.removeItem("mailveil-default-destination");
      }
      toast.success(t("destinations.deleted"));
    } catch {
      toast.error(t("destinations.deleteError"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSetDefault = (email: string) => {
    if (defaultDestination === email) {
      setDefaultDestination("");
      localStorage.removeItem("mailveil-default-destination");
      toast.success(t("destinations.defaultCleared"));
    } else {
      setDefaultDestination(email);
      localStorage.setItem("mailveil-default-destination", email);
      toast.success(t("destinations.defaultSet", { email }));
    }
  };

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success(t("common.copied"));
    else toast.error(t("common.copyFailed"));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("destinations.title")}</h1>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("destinations.title")}</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t("common.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("destinations.addTitle")}</DialogTitle>
              <DialogDescription>
                {t("destinations.addDescription")}
              </DialogDescription>
            </DialogHeader>
            <Input
              type="email"
              placeholder={t("destinations.emailPlaceholder")}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddOpen(false)}
                disabled={adding}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleAdd} disabled={adding || !newEmail}>
                {adding ? t("common.adding") : t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {destinations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">{t("destinations.noDestinations")}</p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("destinations.addFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {destinations.map((dest) => (
            <Card key={dest.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {dest.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleCopy(dest.email)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Badge
                    variant={dest.verified ? "default" : "secondary"}
                  >
                    {dest.verified ? t("common.verified") : t("common.pending")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(dest.created)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSetDefault(dest.email)}
                      title={
                        defaultDestination === dest.email
                          ? t("destinations.removeDefault")
                          : t("destinations.setDefault")
                      }
                    >
                      {defaultDestination === dest.email ? (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteTarget(dest)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("destinations.emailDestinations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("destinations.email")}</TableHead>
                  <TableHead>{t("destinations.statusCol")}</TableHead>
                  <TableHead>{t("destinations.added")}</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {destinations.map((dest) => (
                  <TableRow key={dest.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {defaultDestination === dest.email && (
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 shrink-0" />
                        )}
                        <span className="font-medium">{dest.email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(dest.email)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={dest.verified ? "default" : "secondary"}
                      >
                        {dest.verified ? t("common.verified") : t("common.pending")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(dest.created)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSetDefault(dest.email)}
                          title={
                            defaultDestination === dest.email
                              ? t("destinations.removeDefault")
                              : t("destinations.setDefault")
                          }
                        >
                          {defaultDestination === dest.email ? (
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteTarget(dest)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("destinations.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("destinations.deleteDescription", { email: deleteTarget?.email || "" })}
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
