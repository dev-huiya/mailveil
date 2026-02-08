"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  LayoutDashboard,
  Mail,
  Plus,
  Inbox,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", labelKey: "nav.dashboard" as TranslationKey, icon: LayoutDashboard },
  { href: "/rules", labelKey: "nav.rules" as TranslationKey, icon: Mail },
  { href: "/rules/new", labelKey: "nav.newRule" as TranslationKey, icon: Plus },
  { href: "/destinations", labelKey: "nav.destinations" as TranslationKey, icon: Inbox },
  { href: "/settings", labelKey: "nav.settings" as TranslationKey, icon: Settings },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 mx-4 mb-2 rounded-2xl glass md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span>{t(item.labelKey)}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
