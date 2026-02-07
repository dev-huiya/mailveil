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
import {
  generateEmailSuggestions,
  generateRuleName,
  type EmailSuggestion,
} from "@/lib/generator";
import { toast } from "sonner";
import { useI18n } from "@/hooks/use-i18n";
import { useRules, invalidateRulesCache } from "@/hooks/use-rules";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { Destination } from "@/types/cloudflare";
import { RefreshCw } from "lucide-react";

const EMAIL_DOMAIN = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "example.com";

export function GeneratorForm() {
  const router = useRouter();
  const { t } = useI18n();
  const { existingEmails } = useRules();
  const [category, setCategory] = useState("general");
  const [generated, setGenerated] = useState<{
    suggestions: EmailSuggestion[];
    category: { id: string; name: string; emoji: string; words: string[] };
  } | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
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

        const defaultDest = localStorage.getItem("mailveil-default-destination");
        if (defaultDest && dests.some((d) => d.email === defaultDest)) {
          setSelectedDest(defaultDest);
        } else if (dests.length > 0) {
          setSelectedDest(dests[0].email);
        }
      })
      .catch(() => toast.error(t("newRule.loadError")));
  }, [t]);

  const handleRefresh = useCallback((excludeSeeds?: Set<string>) => {
    const result = generateEmailSuggestions(category, EMAIL_DOMAIN, excludeSeeds, existingEmails);
    setGenerated(result);
    setSelectedEmail(result.suggestions[0]?.email ?? null);
    if (result.suggestions[0]) {
      const s = result.suggestions[0];
      setRuleName(generateRuleName(result.category.name, s.seed, s.suffix));
    }
  }, [category, existingEmails]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleCategoryChange = (id: string) => {
    setCategory(id);
  };

  const handleSelectEmail = (email: string) => {
    setSelectedEmail(email);
    if (generated) {
      const suggestion = generated.suggestions.find((s) => s.email === email);
      if (suggestion) {
        setRuleName(generateRuleName(generated.category.name, suggestion.seed, suggestion.suffix));
      }
    }
  };

  const emailAddress = manualMode
    ? `${manualEmail}@${EMAIL_DOMAIN}`
    : selectedEmail ?? "";

  const handleCreate = async () => {
    if (!selectedDest) {
      toast.error(t("newRule.selectDestError"));
      return;
    }
    if (manualMode && !manualEmail) {
      toast.error(t("newRule.enterEmailError"));
      return;
    }
    if (!manualMode && !selectedEmail) {
      toast.error(t("newRule.pickAddressError"));
      return;
    }
    if (existingEmails.has(emailAddress)) {
      toast.error(t("newRule.duplicateError"));
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

      invalidateRulesCache();
      toast.success(t("newRule.created"));
      router.push("/rules");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  // Shared form fields used in both layouts
  const manualToggle = (
    <div className="flex items-center gap-3">
      <Switch
        id="manual-mode"
        checked={manualMode}
        onCheckedChange={setManualMode}
      />
      <Label htmlFor="manual-mode">{t("newRule.manualInput")}</Label>
    </div>
  );

  const manualInput = manualMode && (
    <div className="space-y-2">
      <Label>{t("newRule.emailAddress")}</Label>
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
  );

  const ruleNameInput = (
    <div className="space-y-2">
      <Label>{t("newRule.ruleName")}</Label>
      <Input
        value={ruleName}
        onChange={(e) => setRuleName(e.target.value)}
        placeholder={t("newRule.ruleNamePlaceholder")}
      />
    </div>
  );

  const destinationSelect = (
    <div className="space-y-2">
      <Label>{t("newRule.forwardTo")}</Label>
      <Select value={selectedDest} onValueChange={setSelectedDest}>
        <SelectTrigger>
          <SelectValue placeholder={t("newRule.selectDestination")} />
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
          {t("newRule.noDestinations")}
        </p>
      )}
    </div>
  );

  const createButton = (
    <Button
      className="w-full"
      size="lg"
      onClick={handleCreate}
      disabled={
        creating ||
        !selectedDest ||
        (manualMode ? !manualEmail : !selectedEmail)
      }
    >
      {creating ? t("newRule.creating") : t("newRule.create")}
    </Button>
  );

  const suggestionsSection = !manualMode && generated && (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("newRule.generatedEmail")}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleRefresh(
              new Set(generated.suggestions.map((s) => s.seed.toLowerCase()))
            )
          }
          className="gap-1.5 shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t("newRule.refreshAll")}
        </Button>
      </div>
      <EmailPreview
        suggestions={generated.suggestions}
        selectedEmail={selectedEmail}
        onSelect={handleSelectEmail}
        categoryEmoji={generated.category.emoji}
        categoryName={t(`category.${generated.category.id}` as TranslationKey)}
      />
    </div>
  );

  return (
    <>
      {/* Mobile layout */}
      <div className="md:hidden space-y-5">
        {!manualMode && (
          <CategorySelector selected={category} onSelect={handleCategoryChange} />
        )}

        {suggestionsSection}

        {manualToggle}
        {manualInput}

        <Separator />

        {ruleNameInput}
        {destinationSelect}
        {createButton}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("newRule.category")}</h2>
          <CategorySelector selected={category} onSelect={handleCategoryChange} />
        </div>

        <Separator />

        {manualToggle}

        {manualMode ? (
          manualInput
        ) : (
          suggestionsSection
        )}

        <Separator />

        <div className="space-y-4">
          {ruleNameInput}
          {destinationSelect}
        </div>

        {createButton}
      </div>
    </>
  );
}
