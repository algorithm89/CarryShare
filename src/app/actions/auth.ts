"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Partial<Record<"firstName" | "lastName" | "email" | "password" | "confirmPassword", string>>;
  /** Echoed back so the form keeps what the user typed (never the password). */
  values?: { firstName?: string; lastName?: string; email?: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only allow same-site relative paths, so `?next=` can't redirect off-site. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function register(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const values = { firstName, lastName, email };

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!firstName) fieldErrors.firstName = "Enter your first name.";
  if (!lastName) fieldErrors.lastName = "Enter your last name.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < 8) fieldErrors.password = "Use at least 8 characters.";
  else if (password.length > 200) fieldErrors.password = "Use at most 200 characters.";
  if (password !== confirmPassword) fieldErrors.confirmPassword = "Passwords don't match.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const passwordHash = await hashPassword(password);

  let accountId: string;
  try {
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO accounts (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email, passwordHash, firstName, lastName]
    );
    accountId = rows[0].id;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { fieldErrors: { email: "An account with this email already exists." }, values };
    }
    console.error("[register] failed", error);
    return { error: "Something went wrong. Please try again.", values };
  }

  await createSession(accountId);
  redirect(safeNext(formData.get("next")));
}

export async function login(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!email || !password) {
    return { error: "Enter your email and password.", values };
  }

  let account: { id: string; password_hash: string } | undefined;
  try {
    const { rows } = await db.query<{ id: string; password_hash: string }>(
      "SELECT id, password_hash FROM accounts WHERE lower(email) = $1",
      [email]
    );
    account = rows[0];
  } catch (error) {
    console.error("[login] failed", error);
    return { error: "Something went wrong. Please try again.", values };
  }

  // Same message either way, so the form doesn't reveal which emails exist.
  if (!account || !(await verifyPassword(password, account.password_hash))) {
    return { error: "Incorrect email or password.", values };
  }

  await createSession(account.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
