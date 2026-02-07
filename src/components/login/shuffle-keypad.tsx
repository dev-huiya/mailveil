"use client";

import { useState, useCallback } from "react";
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
  const [digits, setDigits] = useState(() =>
    shuffleArray(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (!disabled) onDigit(digit);
    },
    [disabled, onDigit]
  );

  const handleShuffle = useCallback(() => {
    setDigits(shuffleArray(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]));
  }, []);

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
        className="h-14 text-muted-foreground"
        onClick={handleShuffle}
        disabled={disabled}
      >
        <Shuffle className="h-5 w-5" />
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
      <Button
        variant="ghost"
        className="h-14"
        onClick={onBackspace}
        disabled={disabled}
      >
        <Delete className="h-6 w-6" />
      </Button>
    </div>
  );
}
