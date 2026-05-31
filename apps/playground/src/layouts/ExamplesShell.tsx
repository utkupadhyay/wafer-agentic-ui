import { Outlet } from "@tanstack/react-router";
import { DemoBanner } from "../components/DemoBanner";
import { NavBar } from "../components/NavBar";

export function ExamplesShell() {
  return (
    <div>
      <NavBar />
      <DemoBanner />
      <Outlet />
    </div>
  );
}
