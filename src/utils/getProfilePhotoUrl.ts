import type { Profile }  from "@/types/user"

export function getProfilePhotoUrl(profile: Profile): string | undefined {
  if (profile?.profilePictureOptimizedUrl) {
    if (profile?.profilePictureOptimizedUrl?.startsWith("http")) {
      return profile.profilePictureOptimizedUrl;
    }
    return `${import.meta.env.VITE_API_BASE_URL}${profile.profilePictureOptimizedUrl}`;
  }
  return undefined;
}