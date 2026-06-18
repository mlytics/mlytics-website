import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  dark?: boolean;
  className?: string;
};

export function SectionHeading({
  children,
  as: Tag = 'h2',
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        'section-heading',
        dark ? 'text-white' : 'text-ink',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
