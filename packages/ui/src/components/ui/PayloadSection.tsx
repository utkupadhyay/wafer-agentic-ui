import { cardLabelClass, codeBlockClass } from "../theme";

interface PayloadSectionProps {
  label: string;
  content: string;
  error?: boolean;
}

export function PayloadSection({ label, content, error = false }: PayloadSectionProps) {
  return (
    <section className="grid gap-1.5">
      <p className={cardLabelClass}>{label}</p>
      <pre className={error ? `${codeBlockClass} text-rose-600` : codeBlockClass}>{content}</pre>
    </section>
  );
}
