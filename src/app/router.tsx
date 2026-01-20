import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../app/AppShell";

import { DmList } from "../pages/DmList";
import { DmChat } from "../pages/DmChat";
import { RoomsList } from "../pages/RoomsList";
import { RoomChat } from "../pages/RoomChat";
import { Explore } from "../pages/Explore";
import { Profile } from "../pages/Profile";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Navigate to="/rooms" replace /> },

      { path: "/dm", element: <DmList /> },
      { path: "/dm/:id", element: <DmChat /> },

      { path: "/rooms", element: <RoomsList /> },
      { path: "/rooms/:id", element: <RoomChat /> },

      { path: "/explore", element: <Explore /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
]);
