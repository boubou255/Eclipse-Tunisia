"use server";

import { redirect } from "next/navigation";
import { checkPassword, startSession } from "@/lib/auth";

export async function login(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  // Small delay makes guessing passwords slower.
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(String(form.get("password") ?? ""))) {
    return { error: "That password is not correct." };
  }
  await startSession();
  redirect("/admin");
}
