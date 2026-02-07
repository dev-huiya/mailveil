import { GeneratorForm } from "@/components/email-generator/generator-form";

export default function NewRulePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create New Rule</h1>
      <GeneratorForm />
    </div>
  );
}
