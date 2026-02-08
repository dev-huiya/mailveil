"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Moon, Sun, LogOut, Globe, Check } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { locales, localeNames, type Locale } from "@/lib/i18n/translations";
import { VisuallyHidden } from "radix-ui";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 border-b bg-card px-4 md:px-6 pt-safe" style={{ minHeight: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}>
      <div className="flex-1" />

      {/* Language — Desktop: DropdownMenu */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-4 w-4" />
              <span className="sr-only">Language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {locales.map((loc) => (
              <DropdownMenuItem
                key={loc}
                onClick={() => setLocale(loc as Locale)}
                className="justify-between"
              >
                {localeNames[loc]}
                <Check className={`h-4 w-4 text-primary ${locale === loc ? "opacity-100" : "opacity-0"}`} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Language — Mobile: Bottom Sheet */}
      <div className="md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setLangSheetOpen(true)}>
          <Globe className="h-4 w-4" />
          <span className="sr-only">Language</span>
        </Button>
        <Sheet open={langSheetOpen} onOpenChange={setLangSheetOpen}>
          <SheetContent side="bottom" showCloseButton={false} className="glass bg-transparent rounded-t-2xl border-t-0 pb-safe">
            <SheetHeader className="p-0">
              <VisuallyHidden.Root>
                <SheetTitle>Language</SheetTitle>
              </VisuallyHidden.Root>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4 pb-6">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { setLocale(loc as Locale); setLangSheetOpen(false); }}
                  className="sheet-item"
                >
                  {localeNames[loc]}
                  <Check className={`h-4 w-4 text-primary ${locale === loc ? "opacity-100" : "opacity-0"}`} />
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Theme — Desktop: DropdownMenu */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t("theme.toggle")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")} className="justify-between">
              {t("theme.light")}
              <Check className={`h-4 w-4 text-primary ${theme === "light" ? "opacity-100" : "opacity-0"}`} />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="justify-between">
              {t("theme.dark")}
              <Check className={`h-4 w-4 text-primary ${theme === "dark" ? "opacity-100" : "opacity-0"}`} />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="justify-between">
              {t("theme.system")}
              <Check className={`h-4 w-4 text-primary ${theme === "system" ? "opacity-100" : "opacity-0"}`} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Theme — Mobile: Bottom Sheet */}
      <div className="md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setThemeSheetOpen(true)}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("theme.toggle")}</span>
        </Button>
        <Sheet open={themeSheetOpen} onOpenChange={setThemeSheetOpen}>
          <SheetContent side="bottom" showCloseButton={false} className="glass bg-transparent rounded-t-2xl border-t-0 pb-safe">
            <SheetHeader className="p-0">
              <VisuallyHidden.Root>
                <SheetTitle>{t("theme.toggle")}</SheetTitle>
              </VisuallyHidden.Root>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4 pb-6">
              <button
                onClick={() => { setTheme("light"); setThemeSheetOpen(false); }}
                className="sheet-item"
              >
                {t("theme.light")}
                <Check className={`h-4 w-4 text-primary ${theme === "light" ? "opacity-100" : "opacity-0"}`} />
              </button>
              <button
                onClick={() => { setTheme("dark"); setThemeSheetOpen(false); }}
                className="sheet-item"
              >
                {t("theme.dark")}
                <Check className={`h-4 w-4 text-primary ${theme === "dark" ? "opacity-100" : "opacity-0"}`} />
              </button>
              <button
                onClick={() => { setTheme("system"); setThemeSheetOpen(false); }}
                className="sheet-item"
              >
                {t("theme.system")}
                <Check className={`h-4 w-4 text-primary ${theme === "system" ? "opacity-100" : "opacity-0"}`} />
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        <span className="sr-only">{t("auth.logout")}</span>
      </Button>
    </header>
  );
}
