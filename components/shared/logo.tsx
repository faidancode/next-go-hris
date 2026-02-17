import Image from "next/image";

type LogoProps = {
  width?: number;
  height?: number;
};

export function Logo({ width = 28, height = 50 }: LogoProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "GoHRIS";
  return (
    <div className="flex justify-center items-center gap-2 text-2xl">
      <Image
        src="/logo.svg"
        alt={`${appName} Logo`}
        width={width}
        height={height}
      />
      <span className="font-semibold">{appName}</span>
    </div>
  );
}
