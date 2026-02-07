"use client";

import { GeneratorForm } from "@/components/email-generator/generator-form";
import { useI18n } from "@/hooks/use-i18n";

export default function NewRulePage() {
  const { t } = useI18n();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t("newRule.title")}</h1>
      <GeneratorForm />
    </div>
  );
}
