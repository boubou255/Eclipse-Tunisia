import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="login">
      <div className="login-card">
        <h1 className="display">Eclipse Tunisia</h1>
        <p className="muted">Sign in to manage tours and bookings.</p>
        <LoginForm />
      </div>
    </main>
  );
}
