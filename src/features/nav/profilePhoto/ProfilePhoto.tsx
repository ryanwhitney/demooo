import { tokens } from "@/styles/tokens";
import type { Profile } from "@/types/user";
import { getProfilePhotoUrl } from "@/utils/getProfilePhotoUrl";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useMemo } from "react";
import * as style from "./ProfilePhoto.css";

const DEFAULT_SIZE = 34;

const ProfilePhoto = ({
  profile,
  height = DEFAULT_SIZE,
  width = DEFAULT_SIZE,
  borderRadius = tokens.radii.full,
  ariaHidden,
}: {
  profile: Profile;
  height?: number | string;
  width?: number | string;
  borderRadius?: string;
  ariaHidden?: boolean;
}) => {
  // Generate a consistent gradient color based on the user's ID or name
  function generateGradient() {
    const seed = profile.id || "default";
    //  hash function to generate a number from a string
    const hash = seed
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const hue1 = hash % 360;
    const hue2 = (hash * 13) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 60%))`;
  }

  // Helper function to convert height/width to CSS value
  function toCssValue(value: number | string): string {
    return typeof value === "number" ? `${value}px` : value;
  }

  const profilePhotoUrl = useMemo(() => getProfilePhotoUrl(profile), [profile]);

  const cssVars = assignInlineVars({
    [style.widthVar]: toCssValue(width),
    [style.heightVar]: toCssValue(height),
    [style.borderRadiusVar]: borderRadius,
    [style.backgroundVar]: generateGradient(),
  });

  return !profilePhotoUrl ? (
    <div
      className={style.profilePhotoContainer}
      style={cssVars}
      aria-hidden={ariaHidden}
    />
  ) : (
    <img
      className={style.profilePhotoImage}
      style={cssVars}
      src={profilePhotoUrl}
      alt="profile photo"
      aria-hidden={ariaHidden}
    />
  );
};

export default ProfilePhoto;
