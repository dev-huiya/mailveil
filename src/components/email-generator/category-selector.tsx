"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/words";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { TranslationKey } from "@/lib/i18n/translations";

interface CategorySelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-sm font-medium border transition-all",
              selected === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground"
            )}
          >
            <span>{cat.emoji}</span>
            <span>{t(`category.${cat.id}` as TranslationKey)}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {categories.map((cat) => (
        <Card
          key={cat.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            selected === cat.id
              ? "ring-2 ring-primary border-primary"
              : "hover:border-primary/50"
          )}
          onClick={() => onSelect(cat.id)}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-sm font-medium">
              {t(`category.${cat.id}` as TranslationKey)}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
