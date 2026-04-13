import { cn } from "@/lib/utils";

type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
