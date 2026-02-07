"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/words";

interface CategorySelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
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
            <span className="text-sm font-medium">{cat.name}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
