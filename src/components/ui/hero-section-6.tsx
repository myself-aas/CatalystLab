"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "motion/react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Sparkles, Terminal, ArrowRight, ShieldCheck } from "lucide-react";

interface Iphone15ProProps extends React.SVGProps<SVGSVGElement> {
  width?: string | number;
  height?: string | number;
  src?: string;
  alt?: string;
}

const Iphone15Pro: React.FC<Iphone15ProProps> = ({
  width = "100%",
  height = "auto",
  src,
  alt = "iPhone screen content",
  className,
  ...props
}) => {
  return (
    <div className={cn("relative", className)}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 433 882"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-500 ease-in-out"
        {...props}
      >
        {/* Outer frame */}
        <path
          d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />
        {/* Side buttons */}
        <path
          d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />
        <path
          d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />
        <path
          d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />
        <path
          d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />

        {/* Inner body */}
        <path
          d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z"
          className="fill-[#262626] dark:fill-black"
        />

        {/* Top speaker grille */}
        <path
          opacity="0.5"
          d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z"
          className="dark:fill-[#DADADA] fill-[#404040]"
        />

        {/* Screen area */}
        <path
          d="M21.25 75C21.25 44.2101 46.2101 19.25 77 19.25H355C385.79 19.25 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 21.25 837.79 21.25 807V75Z"
          className="fill-[#111] dark:fill-[#F5F5F5]"
        />

        {/* Screen Content Area */}
        {src && (
          <foreignObject
            x="21.25"
            y="19.25"
            width="389.5"
            height="843.5"
            clipPath="url(#roundedCorners)"
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "55.75px",
                overflow: "hidden",
                position: "relative",
                backgroundColor: "#111",
              }}
              className="dark:bg-[#F5F5F5]"
            >
              <img
                src={src}
                alt={alt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="eager"
              />
            </div>
          </foreignObject>
        )}

        {/* Notch area */}
        <path
          d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z"
          className="fill-[#262626] dark:fill-[#F0F0F0]"
        />
        {/* Inner Notch Elements */}
        <path
          d="M249 48.5C249 42.701 253.701 38 259.5 38C265.299 38 270 42.701 270 48.5C270 54.299 265.299 59 259.5 59C253.701 59 249 54.299 249 48.5Z"
          className="fill-[#111] dark:fill-[#D1D1D1]"
        />
        <path
          d="M254 48.5C254 45.4624 256.462 43 259.5 43C262.538 43 265 45.4624 265 48.5C265 51.5376 262.538 54 259.5 54C256.462 54 254 51.5376 254 48.5Z"
          className="fill-white/30 dark:fill-black"
        />

        <defs>
          <clipPath id="roundedCorners">
            <rect
              x="21.25"
              y="19.25"
              width="389.5"
              height="843.5"
              rx="55.75"
              ry="55.75"
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

const navItems = [
  { name: "Products", href: "/products" },
  { name: "Master Audit", href: "/master-audit" },
  { name: "Engines", href: "/engines" },
  { name: "Pricing", href: "/pricing" },
  { name: "Docs", href: "/docs" },
];

export default function HeroSection6() {
  const textVariants: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 1,
      },
    },
  };

  return (
    <div className="relative w-full min-h-screen [--color-primary:#003AF9] overflow-hidden bg-primary text-primary-foreground">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(125%_125%_at_50%_10%,#020617_40%,var(--color-primary)_100%)] opacity-90" />

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center py-4 px-4 sm:px-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 font-bold text-base tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-primary-foreground font-mono text-xs">
            CL
          </div>
          <span>CatalystLab</span>
        </div>

        <div className="items-center gap-6 hidden md:flex">
          {navItems.map((item) => (
            <a href={item.href} key={item.name} className="text-sm text-neutral-300 hover:text-primary-foreground transition-colors">
              {item.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="/login" className="px-3.5 py-1.5 text-xs font-medium border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition-colors rounded-lg">
            Log in
          </a>
          <a href="/signup" className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 text-primary-foreground hover:bg-blue-500 transition-colors rounded-lg shadow-sm">
            Sign Up
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex flex-col items-center justify-start text-center pt-16 md:pt-14 px-4 pb-12 max-w-7xl mx-auto z-10 relative">
        <AnimatedGroup
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            },
            item: textVariants,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-mono text-blue-400 mb-6 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SYNCHRONOUS TELEMETRY • AUTONOMOUS AGENTS</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-primary-foreground mb-6 leading-[1.08] px-4 md:px-0">
            Precision Telemetry &amp;
            <br />
            Autonomous Web Auditing
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Execute 8 synchronous diagnostic engines across 42 global Anycast PoPs. Audit Core Web Vitals, OWASP zero-trust transport, and LLM RAG discoverability in under 2 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16 mx-auto">
            <a
              href="/master-audit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-primary-foreground w-full sm:w-auto shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Launch Master Audit</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 w-full sm:w-auto transition-colors cursor-pointer"
            >
              <Terminal className="h-4 w-4 text-blue-400" />
              <span>Explore Products</span>
            </a>
          </div>
        </AnimatedGroup>

        {/* Hero Images Section */}
        <div className="relative w-full mx-auto z-20 max-w-5xl">
          <div className="relative">
            {/* Desktop Screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="relative w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900"
            >
              <img
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="CatalystLab Telemetry Dashboard"
                className="object-cover object-top w-full h-[320px] sm:h-[440px] md:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            </motion.div>

            {/* iPhone Frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] md:-translate-y-[40%] lg:-translate-y-[45%] w-[160px] sm:w-[220px] md:w-[260px] lg:w-[300px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
              >
                <Iphone15Pro
                  src="https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1"
                  className="w-full h-[260px] md:h-[380px] lg:h-[440px]"
                />
              </motion.div>
            </div>
          </div>

          {/* Fade Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="absolute -bottom-2 left-0 right-0 h-40 md:h-52 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-30 pointer-events-none rounded-md"
          />
        </div>
      </div>
    </div>
  );
}

export { HeroSection6 };
