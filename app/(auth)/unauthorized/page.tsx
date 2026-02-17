"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-7 w-7 text-red-600" />
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Access Denied
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          You don’t have permission to access this page. This area is restricted
          to authorized administrators only.
        </p>

        <div className="flex flex-col gap-3">
          <Button variant="default" onClick={() => router.replace("/login")}>
            Back to Login
          </Button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
