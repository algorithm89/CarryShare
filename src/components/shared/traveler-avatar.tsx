import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { avatarPalette, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface TravelerAvatarProps {
  user: User;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function TravelerAvatar({
  user,
  size = "default",
  className,
}: TravelerAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback
        className={cn("font-semibold", avatarPalette(user.id))}
      >
        {initials(user)}
      </AvatarFallback>
    </Avatar>
  );
}
