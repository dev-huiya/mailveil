"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PinInput } from "@/components/login/pin-input";
import { ShuffleKeypad } from "@/components/login/shuffle-keypad";
import { useIsMobile } from "@/hooks/use-mobile";
import { useI18n } from "@/hooks/use-i18n";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { t } = useI18n();
  const [pin, setPin] = useState("");
  const [pinLength, setPinLength] = useState(6);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/pin-length")
      .then((res) => res.json())
      .then((data) => {
        setPinLength(data.length);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  const handleSubmit = useCallback(
    async (submittedPin: string) => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: submittedPin }),
        });

        if (res.ok) {
          router.push("/");
        } else {
          setError(t("auth.invalidPin"));
          setPin("");
        }
      } catch {
        setError(t("auth.connectionError"));
        setPin("");
      } finally {
        setLoading(false);
      }
    },
    [router, t]
  );

  const handleMobileDigit = useCallback(
    (digit: string) => {
      const newPin = pin + digit;
      if (newPin.length <= pinLength) {
        setPin(newPin);
        setError("");
        if (newPin.length === pinLength) {
          handleSubmit(newPin);
        }
      }
    },
    [pin, pinLength, handleSubmit]
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }, []);

  if (!ready) return null;

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-dvh bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t("auth.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.subtitle")}
            </p>
          </div>

          <PinInput
            length={pinLength}
            value={pin}
            onChange={setPin}
            onComplete={handleSubmit}
            disabled={loading}
          />

          {error && (
            <p className="text-center text-sm text-destructive mt-4">{error}</p>
          )}
        </div>

        <div className="px-4 pb-6 pt-2" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          <ShuffleKeypad
            onDigit={handleMobileDigit}
            onBackspace={handleBackspace}
            disabled={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("auth.title")}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {t("auth.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <PinInput
            length={pinLength}
            value={pin}
            onChange={setPin}
            onComplete={handleSubmit}
            disabled={loading}
          />

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {t("auth.keyboardHint")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
