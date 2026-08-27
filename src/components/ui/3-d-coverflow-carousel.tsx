"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export interface CarouselItem {
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

export const defaultDishes: CarouselItem[] = [
  {
    tag: "#Signature",
    titleLine1: "BUTTER CHICKEN",
    titleLine2: "– DELHI HERITAGE",
    desc: "Velvety roasted tomato and fenugreek gravy with tender charred chicken",
    img: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80",
    ctaText: "View Menu",
    ctaUrl: "#",
  },
  {
    tag: "#ChefSpecial",
    titleLine1: "TANDOORI CHOPS",
    titleLine2: "– SMOKED SPICE",
    desc: "Grass-fed lamb chops charred in live charcoal tandoor with Kashmiri spices",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    ctaText: "View Menu",
    ctaUrl: "#",
  },
  {
    tag: "#Vegetarian",
    titleLine1: "PANEER TIKKA",
    titleLine2: "– CLAY ROASTED",
    desc: "Artisan cottage cheese marinated in spiced yogurt, bell peppers & saffron",
    img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
    ctaText: "View Menu",
    ctaUrl: "#",
  },
  {
    tag: "#CoastalCatch",
    titleLine1: "MALABAR PRAWNS",
    titleLine2: "– COCONUT GRAVY",
    desc: "Jumbo wild tiger prawns simmered in fragrant curry leaves and coconut milk",
    img: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80",
    ctaText: "View Menu",
    ctaUrl: "#",
  },
  {
    tag: "#ArtisanBake",
    titleLine1: "TRUFFLE NAAN",
    titleLine2: "– CHARCOAL OVEN",
    desc: "Crispy puffed leavened bread brushed with pure ghee and black winter truffle",
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    ctaText: "View Menu",
    ctaUrl: "#",
  },
];

export function CoverFlowCarousel({
  items = defaultDishes,
  sectionLabel = "BEST SELLERS",
  autoplay = true,
  autoplayDelay = 5000,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      className={`relative w-full min-h-[760px] flex items-center justify-center overflow-hidden py-12 select-none ${className}`}
      style={{
        backgroundColor: "#0c0a09",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={items[currentIndex]?.img}
          alt="ambience background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.22) blur(32px)",
            transform: "scale(1.15)",
            transition: "opacity 1000ms ease, filter 1000ms ease",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(12,10,9,0.3) 0%, rgba(12,10,9,0.92) 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* Eyebrow */}
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-8">
            <span style={{ width: "36px", height: "1px", background: "linear-gradient(90deg, transparent, #c5a880)" }} />
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#c5a880",
                margin: 0,
              }}
            >
              {sectionLabel}
            </h3>
            <span style={{ width: "36px", height: "1px", background: "linear-gradient(90deg, #c5a880, transparent)" }} />
          </div>
        )}

        {/* 3D Coverflow Stage */}
        <div
          className="relative w-full h-[520px] flex justify-center items-center mb-8"
          style={{ perspective: "1400px" }}
        >
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;

            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4) blur(2px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              transform = "translateX(285px) scale(0.84) rotateY(-24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === 2) {
              transform = "translateX(510px) scale(0.68) rotateY(-38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === total - 1) {
              transform = "translateX(-285px) scale(0.84) rotateY(24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === total - 2) {
              transform = "translateX(-510px) scale(0.68) rotateY(38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={idx}
                onClick={() => !isCenter && goToSlide(idx)}
                style={{
                  position: "absolute",
                  width: "330px",
                  height: "500px",
                  borderRadius: "18px",
                  overflow: "hidden",
                  backgroundColor: "#171311",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: "all 800ms cubic-bezier(0.25, 1, 0.5, 1)",
                  boxShadow: isCenter
                    ? "0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(197,168,128,0.25)"
                    : "0 15px 35px rgba(0,0,0,0.5)",
                  cursor: isCenter ? "default" : "pointer",
                }}
              >
                {/* Photo */}
                <img
                  src={item.img}
                  alt={item.titleLine1}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.68) 60%, rgba(0,0,0,0.96) 100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {/* Content Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "20px 18px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {/* Tag */}
                  <div style={{ textAlign: "right", width: "100%", paddingRight: "4px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        color: "rgba(255,255,255,0.9)",
                        textShadow: "0 2px 6px rgba(0,0,0,0.8)",
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "3px",
                      marginTop: "auto",
                      paddingBottom: "4px",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "1.65rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#ffffff",
                        margin: 0,
                        lineHeight: 1.1,
                        textShadow: "0 3px 12px rgba(0,0,0,0.95)",
                      }}
                    >
                      {item.titleLine1}
                    </h2>

                    {item.titleLine2 && (
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#f3f0ea",
                          lineHeight: 1.2,
                          textShadow: "0 3px 10px rgba(0,0,0,0.9)",
                        }}
                      >
                        {item.titleLine2}
                      </span>
                    )}

                    <div
                      style={{
                        width: "34px",
                        height: "2px",
                        backgroundColor: "#c5a880",
                        borderRadius: "2px",
                        margin: "5px auto 4px",
                        boxShadow: "0 0 8px rgba(197,168,128,0.7)",
                      }}
                    />

                    {item.desc && (
                      <p
                        style={{
                          fontSize: "0.82rem",
                          fontStyle: "italic",
                          color: "rgba(255,255,255,0.9)",
                          maxWidth: "280px",
                          margin: "0 0 10px",
                          lineHeight: 1.3,
                          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                        }}
                      >
                        {item.desc}
                      </p>
                    )}

                    <a
                      href={item.ctaUrl || "#"}
                      onClick={(e) => {
                        if (onCtaClick) {
                          e.preventDefault();
                          onCtaClick(item);
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 18px",
                        borderRadius: "9999px",
                        background: "linear-gradient(135deg, #c5a880 0%, #a48256 100%)",
                        color: "#110d0c",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.4), 0 0 15px rgba(197,168,128,0.3)",
                        cursor: "pointer",
                        transition: "transform 200ms ease, box-shadow 200ms ease",
                      }}
                    >
                      <span>{item.ctaText || "View Menu"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous dish"
          style={{
            position: "absolute",
            left: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 40,
            transition: "all 200ms ease",
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next dish"
          style={{
            position: "absolute",
            right: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 40,
            transition: "all 200ms ease",
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", zIndex: 30 }}>
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: "8px",
                width: idx === currentIndex ? "28px" : "8px",
                borderRadius: "9999px",
                backgroundColor: idx === currentIndex ? "#c5a880" : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                boxShadow: idx === currentIndex ? "0 0 10px rgba(197,168,128,0.7)" : "none",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CoverFlowCarousel;
