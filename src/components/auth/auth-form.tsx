"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, register, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  mode: "login" | "register";
  next?: string;
}

function Field({
  id,
  label,
  error,
  ...inputProps
}: { id: string; label: string; error?: string } & React.ComponentProps<"input">) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10"
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthForm({ mode, next }: AuthFormProps) {
  const isRegister = mode === "register";
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    isRegister ? register : login,
    undefined
  );
  const fe = state?.fieldErrors ?? {};
  const v = state?.values ?? {};
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRegister
            ? "Join CarryShare to message travelers and coordinate shared luggage."
            : "Log in to see your messages and trips."}
        </p>

        <form action={action} className="mt-6 space-y-4" noValidate>
          {next && <input type="hidden" name="next" value={next} />}

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="firstName"
                label="First name"
                autoComplete="given-name"
                defaultValue={v.firstName}
                error={fe.firstName}
                required
              />
              <Field
                id="lastName"
                label="Last name"
                autoComplete="family-name"
                defaultValue={v.lastName}
                error={fe.lastName}
                required
              />
            </div>
          )}

          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            defaultValue={v.email}
            error={fe.email}
            required
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            error={fe.password}
            required
            minLength={isRegister ? 8 : undefined}
          />
          {isRegister && (
            <Field
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={fe.confirmPassword}
              required
            />
          )}

          {state?.error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button type="submit" className="h-10 w-full" disabled={pending}>
            {pending
              ? isRegister
                ? "Creating account…"
                : "Logging in…"
              : isRegister
                ? "Create account"
                : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account? " : "New to CarryShare? "}
          <Link
            href={`${isRegister ? "/login" : "/register"}${nextQuery}`}
            className="font-medium text-primary hover:underline"
          >
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
