"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CategorySelector } from "./category-selector";
import { EmailPreview } from "./email-preview";
import { generateEmail, generateRuleName } from "@/lib/generator";
import { toast } from "sonner";
import type { Destination } from "@/types/cloudflare";

const EMAIL_DOMAIN = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "example.com";

export function GeneratorForm() {
  const router = useRouter();
  const [category, setCategory] = useState("general");
  const [generated, setGenerated] = useState(() =>
    generateEmail("general", EMAIL_DOMAIN)
  );
  const [manualMode, setManualMode] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/cloudflare/destinations")
      .then((res) => res.json())
      .then((data) => {
        const dests: Destination[] = (data.result || []).filter(
          (d: Destination) => d.verified
        );
        setDestinations(dests);

        // Auto-select default destination from localStorage
        const defaultDest = localStorage.getItem("mailveil-default-destination");
        if (defaultDest && dests.some((d) => d.email === defaultDest)) {
          setSelectedDest(defaultDest);
        } else if (dests.length > 0) {
          setSelectedDest(dests[0].email);
        }
      })
      .catch(() => toast.error("Failed to load destinations"));
  }, []);

  const handleRefresh = useCallback(() => {
    const result = generateEmail(category, EMAIL_DOMAIN);
    setGenerated(result);
    setRuleName(generateRuleName(result.category.name, result.word1, result.word2));
  }, [category]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleCategoryChange = (id: string) => {
    setCategory(id);
  };

  const emailAddress = manualMode
    ? `${manualEmail}@${EMAIL_DOMAIN}`
    : generated.email;

  const handleCreate = async () => {
    if (!selectedDest) {
      toast.error("Please select a destination");
      return;
    }
    if (manualMode && !manualEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/cloudflare/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ruleName || `Rule: ${emailAddress}`,
          enabled: true,
          matchers: [{ type: "literal", field: "to", value: emailAddress }],
          actions: [{ type: "forward", value: [selectedDest] }],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create rule");
      }

      toast.success("Rule created successfully");
      router.push("/rules");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3">Category</h2>
        <CategorySelector selected={category} onSelect={handleCategoryChange} />
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <Switch
          id="manual-mode"
          checked={manualMode}
          onCheckedChange={setManualMode}
        />
        <Label htmlFor="manual-mode">Manual input</Label>
      </div>

      {manualMode ? (
        <div className="space-y-2">
          <Label>Email address</Label>
          <div className="flex items-center gap-2">
            <Input
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              placeholder="custom.address"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              @{EMAIL_DOMAIN}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-3">Generated Email</h2>
          <EmailPreview
            email={generated.email}
            categoryEmoji={generated.category.emoji}
            categoryName={generated.category.name}
            onRefresh={handleRefresh}
          />
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Rule Name</Label>
          <Input
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            placeholder="Auto-generated rule name"
          />
        </div>

        <div className="space-y-2">
          <Label>Forward To</Label>
          <Select value={selectedDest} onValueChange={setSelectedDest}>
            <SelectTrigger>
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {destinations.map((d) => (
                <SelectItem key={d.id} value={d.email}>
                  {d.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {destinations.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No verified destinations. Add one in the Destinations page.
            </p>
          )}
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleCreate}
        disabled={creating || !selectedDest || (manualMode && !manualEmail)}
      >
        {creating ? "Creating..." : "Create Rule"}
      </Button>
    </div>
  );
}
