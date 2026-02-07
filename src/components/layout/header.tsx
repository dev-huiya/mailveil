"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, LogOut, Menu, Globe, Check } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { useState } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { locales, localeNames, type Locale } from "@/lib/i18n/translations";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

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

      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        <span className="sr-only">{t("auth.logout")}</span>
      </Button>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </header>
  );
}
