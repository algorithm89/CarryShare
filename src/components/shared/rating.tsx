import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function Rating({ value, reviewCount, size = "sm", className }: RatingProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium text-foreground",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      <Star
        className={cn(
          "fill-amber-400 text-amber-400",
          size === "sm" ? "size-3.5" : "size-4"
        )}
      />
      {value.toFixed(1)}
      {typeof reviewCount === "number" && (
        <span className="font-normal text-muted-foreground">
          ({reviewCount})
        </span>
      )}
    </span>
  );
}
