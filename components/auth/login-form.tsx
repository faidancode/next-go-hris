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
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Label } from "../ui/label";
import { Logo } from "../shared/logo";

type LoginFormProps = React.ComponentProps<"div"> & {
  onLoginSuccess?: () => void;
};

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const isJustRegistered = searchParams.get("registered") === "true";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      const loginPayload = await apiClient.post<Record<string, unknown>>(
        "/auth/login",
        {
          email,
          password,
        },
      );

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

      const mePayload =
        await apiClient.get<Record<string, unknown>>("/auth/me");
      const meUser = normalizeSessionUser(mePayload);

      if (!meUser) {
        throw new Error("Failed to load user profile.");
      }

      const meTokens = extractTokens(mePayload);
      const existing = getSession();

      setSession({
        accessToken:
          meTokens.accessToken ??
          existing?.accessToken ??
          loginTokens.accessToken,
        refreshToken:
          meTokens.refreshToken ??
          existing?.refreshToken ??
          loginTokens.refreshToken,
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
    <div
      className={cn(
        "w-full max-w-lg mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700",
        className,
      )}
      {...props}
    >
      <Card className="border-border/40 shadow-2xl overflow-hidden backdrop-blur-md bg-card/90">
        {/* Decorative Accent Line - Matching Register Form */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-secondary via-amber-500 to-amber-700" />

        <CardHeader className="space-y-2 pb-8 pt-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <Logo />
            </div>
          </div>
          <CardTitle className="text-3xl font-display font-bold tracking-tight text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base font-medium text-muted-foreground/80">
            Enter your GoHRIS credentials to access your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Notification after Register */}
          {isJustRegistered && !loginError && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-500 animate-in zoom-in-95 duration-300">
              <Logo />
              <p className="font-medium">
                Registration complete! You can now sign in with your new
                account.
              </p>
            </div>
          )}

          {loginError && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-shake">
              <Logo />
              <p className="font-medium">{loginError}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold ml-1">
                Work Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-12 bg-background/50 border-border/60 focus:ring-primary/20 rounded-lg transition-all"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" title="text-sm font-semibold">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10 h-12 bg-background/50 border-border/60 focus:ring-primary/20 rounded-lg font-mono transition-all"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-4 rounded-lg  text-white text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-muted-foreground font-medium">
          Don&apos;t have a company account?{" "}
          <button
            onClick={() => router.push("/register-company")}
            className="text-primary font-bold hover:text-primary/80 transition-colors underline-offset-4 hover:cursor-pointer hover:underline"
          >
            Create Organization
          </button>
        </p>
      </div>
    </div>
  );
}
