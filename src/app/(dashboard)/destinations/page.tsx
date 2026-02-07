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
import type { Destination } from "@/types/cloudflare";

export default function DestinationsPage() {
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
      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  }, []);

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

      toast.success("Verification email sent. Check your inbox.");
      setNewEmail("");
      setAddOpen(false);
      fetchDestinations();
    } catch {
      toast.error("Failed to add destination");
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
      toast.success("Destination deleted");
    } catch {
      toast.error("Failed to delete destination");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSetDefault = (email: string) => {
    if (defaultDestination === email) {
      setDefaultDestination("");
      localStorage.removeItem("mailveil-default-destination");
      toast.success("Default destination cleared");
    } else {
      setDefaultDestination(email);
      localStorage.setItem("mailveil-default-destination", email);
      toast.success(`Set ${email} as default destination`);
    }
  };

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success("Copied to clipboard");
    else toast.error("Failed to copy");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Destinations</h1>
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
        <h1 className="text-2xl font-bold">Destinations</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Destination</DialogTitle>
              <DialogDescription>
                A verification email will be sent to confirm the address.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="email"
              placeholder="email@example.com"
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
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={adding || !newEmail}>
                {adding ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {destinations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No destinations yet</p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first destination
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
                    {dest.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Added {formatDate(dest.created)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSetDefault(dest.email)}
                      title={
                        defaultDestination === dest.email
                          ? "Remove default"
                          : "Set as default"
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
            <CardTitle className="text-lg">Email Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
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
                        {dest.verified ? "Verified" : "Pending"}
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
                              ? "Remove default"
                              : "Set as default"
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
            <DialogTitle>Delete Destination</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.email}&quot;?
              Rules forwarding to this address will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
