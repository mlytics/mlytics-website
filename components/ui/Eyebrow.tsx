import { cn } from '@/lib/utils';

type EyebrowProps = {
  children: React.ReactNode;
  color?: string;
  dark?: boolean;
  className?: string;
};

export function Eyebrow({
  children,
  color,
  dark = false,
  className,
}: EyebrowProps) {
  return (
    <span
      className={cn(
        'label-eyebrow',
        !color && (dark ? 'text-on-dark' : 'text-primary'),
        className,
      )}
      style={color ? { color } : undefined}
    >
      {children}
    </span>
  );
}
