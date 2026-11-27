import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Log in – CarryShare" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  if (await getSessionUser()) redirect(nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/");
  return <AuthForm mode="login" next={nextPath} />;
}
