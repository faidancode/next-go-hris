"use client";

import { useAuthStore } from "@/app/stores/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiClient, ValidationError } from "@/lib/api/client";
import {
  extractTokens,
  getSession,
  normalizeSessionUser,
  setSession,
} from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

type LoginFormProps = React.ComponentProps<"div"> & {
  onLoginSuccess?: () => void;
};

export function LoginForm({ className, onLoginSuccess, ...props }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      const loginPayload = await apiClient.post<Record<string, unknown>>("/auth/login", {
        email,
        password,
      });

      const loginTokens = extractTokens(loginPayload);
      if (loginTokens.accessToken || loginTokens.refreshToken) {
        setSession({
          accessToken: loginTokens.accessToken,
          refreshToken: loginTokens.refreshToken,
          user: {
            id: "pending",
            email,
            name: email,
          },
        });
      }

      const mePayload = await apiClient.get<Record<string, unknown>>("/auth/me");
      const meUser = normalizeSessionUser(mePayload);

      if (!meUser) {
        throw new Error("Failed to load user profile.");
      }

      const meTokens = extractTokens(mePayload);
      const existing = getSession();

      setSession({
        accessToken:
          meTokens.accessToken ?? existing?.accessToken ?? loginTokens.accessToken,
        refreshToken:
          meTokens.refreshToken ?? existing?.refreshToken ?? loginTokens.refreshToken,
        user: meUser,
      });

      login({
        id: meUser.id,
        company_id: meUser.company_id,
        employee_id: meUser.employee_id,
        email: meUser.email,
        name: meUser.name,
        role: meUser.role,
      });

      if (onLoginSuccess) {
        onLoginSuccess();
        return;
      }

      const next = searchParams.get("next");
      router.replace(next || "/dashboard");
    } catch (error) {
      if (error instanceof ValidationError) {
        setLoginError(error.message || "Invalid credentials");
      } else if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="my-3 flex justify-center">
            <Image src="/logo.svg" alt="logo" height={28} width={28} />
            <p className="ml-2 text-2xl font-bold text-primary">GoHRIS</p>
          </div>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Use your HRIS account credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <div className="my-2 flex items-center gap-2 rounded-sm border-l-4 border-red-600 bg-red-100 p-2 text-xs text-red-600">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              {loginError}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:cursor-pointer hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
