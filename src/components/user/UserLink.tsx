import { useUiStore, type PublicProfile } from "../../stores/uiStore";

export function UserLink({
  profile,
  showAvatar = true,
  showName = true,
  className = "",
}: {
  profile: PublicProfile;
  showAvatar?: boolean;
  showName?: boolean;
  className?: string;
}) {
  const openProfile = useUiStore((s) => s.openProfile);

  return (
    <button
      type="button"
      onClick={() => openProfile(profile)}
      className={[
        "inline-flex items-center gap-2 text-left",
        "hover:opacity-90 active:opacity-80 transition",
        className,
      ].join(" ")}
    >
      {showAvatar && (
        <img
          src={
            profile.avatarUrl ||
            "https://api.dicebear.com/9.x/thumbs/svg?seed=User"
          }
          alt={profile.name}
          className="h-9 w-9 rounded-full border object-cover"
        />
      )}
      {showName && (
        <span className="font-medium underline-offset-4 hover:underline">
          {profile.name}
        </span>
      )}
    </button>
  );
}
