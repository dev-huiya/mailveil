"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmailPreviewProps {
  email: string;
  categoryEmoji: string;
  categoryName: string;
  onRefresh: () => void;
}

export function EmailPreview({
  email,
  categoryEmoji,
  categoryName,
  onRefresh,
}: EmailPreviewProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const handleCopy = async () => {
    const ok = await copyToClipboard(email);
    if (ok) toast.success(t("common.copied"));
    else toast.error(t("common.copyFailed"));
  };

  if (isMobile) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 space-y-4">
          <div className="text-center">
            <span className="text-3xl">{categoryEmoji}</span>
          </div>
          <code className="block text-center text-base font-bold break-all leading-relaxed">
            {email}
          </code>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              {t("common.refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              {t("common.copy")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="text-2xl shrink-0">{categoryEmoji}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground mb-1">{categoryName}</p>
          <code className="text-sm font-semibold break-all">{email}</code>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
