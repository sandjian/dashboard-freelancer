import type React from "react";
import { cn } from "@/lib/utils";

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden transition-colors duration-500 border-0 ring-0 opacity-80",
        // Light mode: Clean soft zinc-50 background with crisp dark text | Dark mode: Deep obsidian black
        "bg-gradient-to-t from-neutral-900/80 via-neutral-500 to-neutral-900/80 text-white dark:bg-black dark:text-white",
        className
      )}
    >
      {/* 1. Base Radial gradient & cyber streaks */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(100% 100% at 0% 0%, rgb(40, 44, 46) 0%, rgb(5, 7, 10) 100%)",
            maskImage:
              "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.224) 88.2883%, rgba(0, 0, 0, 0) 100%)",
            WebkitMaskImage:
              "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.224) 88.2883%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          {/* Skewed fading teal-to-dark streaks */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(rgb(20, 184, 166) 0%, rgba(13, 148, 136, 0.4) 40%, rgba(0, 0, 0, 0) 100%)",
              maskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(rgb(13, 148, 136) 0%, rgba(15, 118, 110, 0.35) 50%, rgba(0, 0, 0, 0) 100%)",
              maskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background:
                "linear-gradient(rgb(45, 212, 191) 0%, rgba(19, 78, 74, 0.4) 45%, rgba(0, 0, 0, 0) 100%)",
              maskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background:
                "linear-gradient(rgb(20, 184, 166) 0%, rgba(13, 148, 136, 0.3) 50%, rgba(0, 0, 0, 0) 100%)",
              maskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background:
                "linear-gradient(rgb(45, 212, 191) 0%, rgba(15, 118, 110, 0.5) 40%, rgba(0, 0, 0, 0) 100%)",
              maskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 27%, rgb(0, 0, 0) 42%, rgba(0, 0, 0, 0) 48%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 74%, rgb(0, 0, 0) 82%, rgba(0, 0, 0, 0.47) 88%, rgba(0, 0, 0, 0) 97%)",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 27%, rgb(0, 0, 0) 42%, rgba(0, 0, 0, 0) 48%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 74%, rgb(0, 0, 0) 82%, rgba(0, 0, 0, 0.47) 88%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
        </div>
      </div>

      {/* 2. Textured subtle noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] bg-repeat"
        style={{
          backgroundImage:
            'url("https://cdn.21st.dev/assets/mirror/f5/f55dfc553c100e6da0ad95258a042b4100f0ff4bb03a5313d1f541984275e262.png")',
          backgroundSize: "149.76px",
        }}
      />

      {/* 3. Subtle dot pattern overlay with teal tint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(20,184,166,0.5) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* 4. Subtle radial highlight: teal to black gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-teal-950/40 via-transparent to-transparent" />

      {/* 5. Actual Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
