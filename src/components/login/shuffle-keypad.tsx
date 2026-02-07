"use client";

import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Delete, Shuffle } from "lucide-react";

interface ShuffleKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function ShuffleKeypad({
  onDigit,
  onBackspace,
  disabled,
}: ShuffleKeypadProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const digits = useMemo(() => shuffleArray(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]), [disabled]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (!disabled) onDigit(digit);
    },
    [disabled, onDigit]
  );

  // 10 digits -> 4 cols x 3 rows: row1(4) + row2(4) + row3(backspace, digit, digit, shuffle-icon)
  const row1 = digits.slice(0, 4);
  const row2 = digits.slice(4, 8);
  const row3 = digits.slice(8, 10);

  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {row1.map((digit) => (
        <Button
          key={`r1-${digit}`}
          variant="outline"
          className="h-14 text-xl font-semibold"
          onClick={() => handleDigit(digit)}
          disabled={disabled}
        >
          {digit}
        </Button>
      ))}
      {row2.map((digit) => (
        <Button
          key={`r2-${digit}`}
          variant="outline"
          className="h-14 text-xl font-semibold"
          onClick={() => handleDigit(digit)}
          disabled={disabled}
        >
          {digit}
        </Button>
      ))}
      <Button
        variant="ghost"
        className="h-14"
        onClick={onBackspace}
        disabled={disabled}
      >
        <Delete className="h-6 w-6" />
      </Button>
      {row3.map((digit) => (
        <Button
          key={`r3-${digit}`}
          variant="outline"
          className="h-14 text-xl font-semibold"
          onClick={() => handleDigit(digit)}
          disabled={disabled}
        >
          {digit}
        </Button>
      ))}
      <div className="flex items-center justify-center text-muted-foreground">
        <Shuffle className="h-4 w-4" />
      </div>
    </div>
  );
}
