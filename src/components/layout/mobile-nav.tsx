"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Mail,
  Inbox,
  Settings,
  Plus,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/", labelKey: "nav.dashboard" as TranslationKey, icon: LayoutDashboard },
  { href: "/rules", labelKey: "nav.rules" as TranslationKey, icon: Mail },
  { href: "/rules/new", labelKey: "nav.newRule" as TranslationKey, icon: Plus },
  { href: "/destinations", labelKey: "nav.destinations" as TranslationKey, icon: Inbox },
  { href: "/settings", labelKey: "nav.settings" as TranslationKey, icon: Settings },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="flex h-14 flex-row items-center gap-2 border-b px-6">
          <Shield className="h-5 w-5 text-primary" />
          <SheetTitle className="text-lg">{t("common.appName")}</SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
