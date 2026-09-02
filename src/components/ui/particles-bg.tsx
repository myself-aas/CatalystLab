"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

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

    // Clean light palette from uploaded color swatch
    const colors = {
      particles: '#f9a825', // Warm amber from swatch
      lines: '#c4c4c4',     // Clean silver grey from swatch
      accent: '#c62828',    // Crimson red from swatch
    };

    // @ts-ignore
    if (!window.particlesJS) return;

    // @ts-ignore
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 70, density: { enable: true, value_area: 900 } },
        color: { value: [colors.particles, colors.accent, '#b4b4b4'] },
        shape: { type: "circle", stroke: { width: 0 } },
        opacity: {
          value: 0.25,
          random: true,
          anim: { enable: true, speed: 0.8, opacity_min: 0.08 },
        },
        size: {
          value: 2.5,
          random: true,
          anim: { enable: true, speed: 1.5, size_min: 1 },
        },
        line_linked: {
          enable: true,
          distance: 140,
          color: colors.lines,
          opacity: 0.2,
          width: 0.8,
        },
        move: { enable: true, speed: 0.9, random: true, out_mode: "bounce" },
      },
      interactivity: {
        detect_on: "window",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 180, line_linked: { opacity: 0.4 } },
          push: { particles_nb: 2 },
          repulse: { distance: 160, duration: 0.4 },
        },
      },
      retina_detect: true,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadParticles = () => {
      setOpacity(0);
      setTimeout(() => {
        initParticles(false);
        setOpacity(0.8);
      }, 300);
    };

    // @ts-ignore
    if (window.particlesJS) {
      loadParticles();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => loadParticles();
    }
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
      className="fixed inset-0 w-full h-full z-0 pointer-events-auto bg-background opacity-90 transition-opacity duration-700"
    />
  );
}
