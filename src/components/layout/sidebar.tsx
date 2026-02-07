"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import type { TranslationKey } from "@/lib/i18n/translations";
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

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-6">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-semibold text-lg">{t("common.appName")}</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          {process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "example.com"}
        </p>
      </div>
    </aside>
  );
}
