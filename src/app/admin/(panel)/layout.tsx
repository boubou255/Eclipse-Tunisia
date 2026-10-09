import Link from "next/link";
import { requireAdmin, endSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import NavLink from "./NavLink";

async function logout() {
  "use server";
  await endSession();
  redirect("/admin/login");
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="panel">
      <aside className="sidebar">
        <Link href="/admin" className="sidebar-brand display">Eclipse Tunisia</Link>
        <nav>
          <NavLink href="/admin" exact>Overview</NavLink>
          <NavLink href="/admin/tours">Tours</NavLink>
          <NavLink href="/admin/bookings">Bookings</NavLink>
        </nav>
        <div className="sidebar-foot">
          <a href="/" target="_blank" rel="noreferrer">View website</a>
          <form action={logout}>
            <button className="linkish">Sign out</button>
          </form>
        </div>
      </aside>
      <div className="panel-main">{children}</div>
    </div>
  );
}
