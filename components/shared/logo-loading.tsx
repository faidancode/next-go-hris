import Image from "next/image";

type LogoLoadingProps = {
  width?: number;
  height?: number;
};

export function LogoLoading({ width = 60, height = 100 }: LogoLoadingProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "GoHRIS";

  return (
    // Wrapper utama yang menjamin posisi tepat di tengah layar
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-9999">
      <div className="flex flex-col items-center gap-6">
        {/* Container Logo dengan Efek Glow */}
        <div className="relative group">
          {/* Efek Cahaya Amber di Belakang (Glow) */}
          <div className="absolute -inset-4 bg-secondary/20 rounded-full blur-xl animate-pulse" />

          <div className="relative animate-[float_3s_ease-in-out_infinite]">
            <Image
              src="/logo.svg"
              alt="Loading..."
              width={width}
              height={height}
              className="drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Text & Loading Bar */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tighter text-primary">
            {appName}
          </h1>

          {/* Loading Bar yang elegan */}
          <div className="relative w-40 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-secondary rounded-full animate-[loading-slide_2s_infinite_ease-in-out]"
              style={{ width: "40%" }}
            />
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">
            Initializing System
          </p>
        </div>
      </div>
    </div>
  );
}
