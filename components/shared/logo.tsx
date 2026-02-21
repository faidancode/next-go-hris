import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  width?: number;
  height?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Logo({ width, height, size = "md", className }: LogoProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "GoHRIS";

  const sizeMap = {
    sm: { logo: 24, text: "text-lg", gap: "gap-1.5" },
    md: { logo: 28, text: "text-2xl", gap: "gap-2" },
    lg: { logo: 48, text: "text-4xl", gap: "gap-3" },
  };

  const selectedSize = sizeMap[size];
  const finalWidth = width ?? selectedSize.logo;
  const finalHeight = height ?? (finalWidth * 50) / 28; // Keep aspect ratio

  return (
    <div className={cn("flex justify-center items-center font-bold text-primary", selectedSize.gap, selectedSize.text, className)}>
      <Image
        src="/logo.svg"
        alt={`${appName} Logo`}
        width={finalWidth}
        height={finalHeight}
      />
      <span className="font-display tracking-tight">{appName}</span>
    </div>
  );
}
