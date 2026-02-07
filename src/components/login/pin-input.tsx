"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete: (pin: string) => void;
  disabled?: boolean;
}

export function PinInput({
  length,
  value,
  onChange,
  onComplete,
  disabled,
}: PinInputProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key >= "0" && e.key <= "9") {
        const newValue = value + e.key;
        if (newValue.length <= length) {
          onChange(newValue);
          if (newValue.length === length) {
            onComplete(newValue);
          }
        }
      } else if (e.key === "Backspace") {
        onChange(value.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, length, onChange, onComplete, disabled]);

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all",
            i === value.length
              ? "border-primary ring-2 ring-primary/20"
              : value[i]
                ? "border-primary/50 bg-primary/5"
                : "border-muted-foreground/20",
            disabled && "opacity-50"
          )}
        >
          {value[i] ? (
            <span className="w-3 h-3 rounded-full bg-primary" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
