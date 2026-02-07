"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import type { EmailSuggestion } from "@/lib/generator";
import { cn } from "@/lib/utils";

interface EmailPreviewProps {
  suggestions: EmailSuggestion[];
  selectedEmail: string | null;
  onSelect: (email: string) => void;
  categoryEmoji: string;
  categoryName: string;
}

export function EmailPreview({
  suggestions,
  selectedEmail,
  onSelect,
  categoryEmoji,
  categoryName,
}: EmailPreviewProps) {
  const { t } = useI18n();

  const handleCopy = async (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const ok = await copyToClipboard(email);
    if (ok) toast.success(t("common.copied"));
    else toast.error(t("common.copyFailed"));
  };

  if (suggestions.length === 0) return null;

  return (
    <>
      {/* Mobile */}
      <Card className="md:hidden border-primary/30 bg-primary/5">
        <CardContent className="p-5 space-y-3">
          <div className="text-center">
            <span className="text-3xl">{categoryEmoji}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {t("newRule.pickAddress")}
          </p>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.email}
                onClick={() => onSelect(s.email)}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors",
                  selectedEmail === s.email
                    ? "border-primary ring-2 ring-primary/30 bg-primary/10"
                    : "hover:bg-muted/50"
                )}
              >
                <code className="text-sm font-medium break-all flex-1 min-w-0">
                  {s.email}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => handleCopy(e, s.email)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryEmoji}</span>
            <div>
              <p className="text-xs text-muted-foreground">{categoryName}</p>
              <p className="text-xs text-muted-foreground">
                {t("newRule.pickAddress")}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.email}
                onClick={() => onSelect(s.email)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  selectedEmail === s.email
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <code className="text-sm font-medium break-all flex-1 min-w-0">
                  {s.email}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => handleCopy(e, s.email)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
