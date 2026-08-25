import { UserRound } from "lucide-react";

import type { AvatarId } from "../../types";
import "./AvatarDisplay.css";

const avatarImages = import.meta.glob(
  "/src/assets/images/avatars/*.png",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

interface AvatarDisplayProps {
  avatarId: AvatarId;
  className?: string;
}

export const AvatarDisplay = ({ avatarId, className = "" }: AvatarDisplayProps) => {
  const imagePath = `/src/assets/images/avatars/${avatarId}.png`;
  const imageSource = avatarImages[imagePath];

  return (
    <span className={`avatar-display ${className}`}>
      {imageSource ? (
        <img
          src={imageSource}
          alt={`Avatar ${avatarId.replace("avatar_", "")}`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling?.removeAttribute("hidden");
          }}
        />
      ) : null}
      <span className="avatar-display__fallback" hidden={Boolean(imageSource)}>
        <UserRound aria-hidden="true" />
      </span>
    </span>
  );
};