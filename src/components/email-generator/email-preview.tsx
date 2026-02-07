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
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {categoryEmoji} {categoryName}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <code className="block text-sm font-semibold break-all">{email}</code>
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
