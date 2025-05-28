import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicIconProps {
  name: string;
  className?: string;
  color?: string;
}

export function DynamicIcon({ name, className, color }: DynamicIconProps) {
  // Get the icon component from LucideIcons
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Gamepad2;

  // Check if color is a Tailwind class (starts with 'text-')
  const isTailwindColor = color?.startsWith("text-");

  // Combine classes
  const iconClassName = cn(
    className,
    // If color is a Tailwind class, use it directly
    // Otherwise, apply it as a style
    isTailwindColor ? color : undefined
  );

  // Apply color as style if it's not a Tailwind class
  const style = !isTailwindColor && color ? { color } : undefined;

  return <IconComponent className={iconClassName} style={style} />;
}
