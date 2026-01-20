import { NavLink } from "react-router-dom";
import { MessageCircle, Users, Compass, User } from "lucide-react";

const items = [
  { to: "/dm", label: "PM", Icon: MessageCircle },
  { to: "/rooms", label: "Rum", Icon: Users },
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/profile", label: "Profil", Icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-2">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs",
                isActive ? "text-foreground" : "text-muted-foreground",
              ].join(" ")
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
