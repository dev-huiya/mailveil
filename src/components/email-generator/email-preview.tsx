"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

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

  const handleCopy = async () => {
    const ok = await copyToClipboard(email);
    if (ok) toast.success(t("common.copied"));
    else toast.error(t("common.copyFailed"));
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Badge variant="outline" className="text-lg px-3 py-1 shrink-0">
          {categoryEmoji}
        </Badge>
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
