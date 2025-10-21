"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import DottedMap from "dotted-map";
import Image from "next/image";
import { useTheme } from "next-themes";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for component to mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme for better theme detection, fallback to 'light' during SSR
  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  const svgMap = map.getSVG({
    radius: 0.22,
    color: isDark ? "#FFFFFF40" : "#00000040",
    shape: "circle",
    backgroundColor: isDark ? "black" : "white",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div
      className=" aspect-[2/1] dark:bg-black bg-white font-sans md:w-full md:h-auto md:rounded-lg w-screen h-screen rounded-none fixed inset-0 z-0"
    >
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="[mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none w-screen h-screen object-cover rounded-none"
        alt="world map"
        height={495}
        width={1056}
        draggable={false}
        unoptimized
      />

    </div>
  );
}
