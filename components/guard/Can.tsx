"use client";

import { can } from "@/lib/rbac/can";
import { ReactNode, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type CanProps = {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  timeoutMs?: number;
};

export function Can({
  resource,
  action,
  children,
  fallback = null,
  loadingFallback,
  timeoutMs = 3500,
}: CanProps) {
  const [state, setState] = useState<"loading" | "allowed" | "denied" | "timeout">("loading");

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(() => {
      if (mounted) setState((prev) => (prev === "loading" ? "timeout" : prev));
    }, timeoutMs);

    can(resource, action)
      .then((allowed) => {
        if (!mounted) return;
        setState(allowed ? "allowed" : "denied");
      })
      .catch(() => {
        if (!mounted) return;
        setState("denied");
      });

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [resource, action, timeoutMs]);

  if (state === "allowed") return <>{children}</>;
  if (state === "loading") {
    return (
      <>
        {loadingFallback ?? <Skeleton className="h-9 w-32" />}
      </>
    );
  }

  if (state === "timeout") {
    return (
      <>
        {fallback}
      </>
    );
  }

  return <>{fallback}</>;
}
