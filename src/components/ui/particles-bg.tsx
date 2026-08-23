"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function ParticlesComponent() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [opacity, setOpacity] = useState(0);

  const getCssVar = (name: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  };

  const initParticles = useCallback((isDark: boolean) => {
    // cleanup old canvas
    const oldCanvas = document.querySelector("#particles-js canvas");
    if (oldCanvas) oldCanvas.remove();

    // @ts-ignore
    if (window.pJSDom?.length > 0) {
      // @ts-ignore
      window.pJSDom.forEach((p) => p.pJS.fn.vendors.destroypJS());
      // @ts-ignore
      window.pJSDom = [];
    }

    // Dynamically extract colors from Tailwind config for light/dark themes
    const colors = isDark
      ? {
          particles: getCssVar('--color-accent-cyan', '#38bdf8'),
          lines: getCssVar('--color-brand-slate', '#415a77'),
          accent: getCssVar('--color-accent-cyan', '#38bdf8'),
        }
      : {
          particles: getCssVar('--color-brand-slate-light', '#52718e'),
          lines: getCssVar('--color-brand-periwinkle', '#c5d3e8'),
          accent: getCssVar('--color-brand-slate-hover', '#33475e'),
        };

    // @ts-ignore
    if (!window.particlesJS) return;

    // @ts-ignore
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 140, density: { enable: true, value_area: 800 } },
        color: { value: colors.particles },
        shape: { type: "circle", stroke: { width: 0.5, color: colors.accent } },
        opacity: {
          value: 0.4,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.1 },
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: true, speed: 2, size_min: 1 },
        },
        line_linked: {
          enable: true,
          distance: 160,
          color: colors.lines,
          opacity: 0.3,
          width: 1.2,
        },
        move: { enable: true, speed: 1.5, random: true, out_mode: "bounce" },
      },
      interactivity: {
        detect_on: "window",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "repulse" },
          resize: true,
        },
        modes: {
          grab: { distance: 200, line_linked: { opacity: 0.6 } },
          push: { particles_nb: 3 },
          repulse: { distance: 180, duration: 0.4 },
        },
      },
      retina_detect: true,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const detectDark = () => 
      html.classList.contains("dark") || html.getAttribute("data-theme") === "dark";

    let currentDark = detectDark();
    setIsDarkTheme(currentDark);

    const loadParticles = (dark: boolean) => {
      // Fade out
      setOpacity(0);
      
      // Re-initialize after fade out completes
      setTimeout(() => {
        initParticles(dark);
        setOpacity(1); // Fade back in
      }, 500); 
    };

    // @ts-ignore
    if (window.particlesJS) {
      loadParticles(currentDark);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => loadParticles(detectDark());
    }

    // Observer to watch for theme changes globally
    const observer = new MutationObserver(() => {
      const dark = detectDark();
      if (dark !== currentDark) {
        currentDark = dark;
        setIsDarkTheme(dark);
        loadParticles(dark);
      }
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, [initParticles]);

  // Parallax setup for 3D depth effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const x = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const y = useTransform(smoothMouseY, [-1, 1], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity, scale: 1.05 }}
      style={{ x, y }}
      transition={{ opacity: { duration: 0.5, ease: "easeInOut" } }}
      id="particles-js"
      className={`particles-color-shift fixed inset-0 w-full h-full z-0 pointer-events-auto transition-colors duration-1000 ${
        isDarkTheme ? 'bg-brand-navy' : 'bg-brand-ghost'
      }`}
    />
  );
}
