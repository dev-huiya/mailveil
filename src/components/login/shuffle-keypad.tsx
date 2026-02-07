"use client";

import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

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
  // Shuffle digits on every render (when PIN value changes, parent re-renders)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const digits = useMemo(() => shuffleArray(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]), [disabled]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (!disabled) onDigit(digit);
    },
    [disabled, onDigit]
  );

  return (
    <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
      {digits.slice(0, 9).map((digit) => (
        <Button
          key={digit}
          variant="outline"
          size="lg"
          className="h-14 text-xl font-semibold"
          onClick={() => handleDigit(digit)}
          disabled={disabled}
        >
          {digit}
        </Button>
      ))}
      <div />
      <Button
        variant="outline"
        size="lg"
        className="h-14 text-xl font-semibold"
        onClick={() => handleDigit(digits[9])}
        disabled={disabled}
      >
        {digits[9]}
      </Button>
      <Button
        variant="ghost"
        size="lg"
        className="h-14"
        onClick={onBackspace}
        disabled={disabled}
      >
        <Delete className="h-6 w-6" />
      </Button>
    </div>
  );
}
