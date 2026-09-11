"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileCode2,
} from "lucide-react";
import { SDLC_CATALYSTS_LIST } from "../../data/engines";

export interface CarouselItem {
  id?: string;
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  color?: string;
  phaseNumber?: number;
  ctaText?: string;
  ctaUrl?: string;
  shortCode?: string;
  category?: string;
  lifecycleFocus?: string;
  keyVectors?: string[];
  departmentReplaced?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

/**
 * Maps the 8 Autonomous Architectural Auditors from SDLC_CATALYSTS_LIST
 */
export const auditorsCarouselItems: CarouselItem[] = SDLC_CATALYSTS_LIST.map((engine) => ({
  id: engine.id,
  tag: `Phase 0${engine.sdlcPhaseNumber} • ${engine.category}`,
  titleLine1: engine.catalystName || engine.name,
  titleLine2: engine.catalystName && engine.name !== engine.catalystName ? `(${engine.name})` : undefined,
  desc: engine.description,
  img: engine.image || "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  color: engine.color,
  phaseNumber: engine.sdlcPhaseNumber,
  ctaText: `Launch ${engine.catalystName || engine.name}`,
  ctaUrl: engine.route || `/docs/${engine.id}`,
  shortCode: engine.shortCode,
  category: engine.category,
  lifecycleFocus: engine.lifecycleFocus,
  keyVectors: engine.keyVectors?.slice(0, 3) || [],
  departmentReplaced: engine.departmentReplaced,
}));

export const defaultCarouselItems: CarouselItem[] = auditorsCarouselItems;

interface CoverflowCardProps {
  item: CarouselItem;
  card: {
    x: number;
    scale: number;
    rotateY: number;
    opacity: number;
    zIndex: number;
    filter: string;
    boxShadow: string;
    isCenter: boolean;
  };
  isMobile: boolean;
  stageWidth: number;
  stageHeight: number;
  onCardClick: () => void;
  onCtaClick?: (item: CarouselItem) => void;
  onDragNext: () => void;
  onDragPrev: () => void;
}

function CoverflowCard({
  item,
  card,
  isMobile,
  stageWidth,
  stageHeight,
  onCardClick,
  onCtaClick,
  onDragNext,
  onDragPrev,
}: CoverflowCardProps) {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, normalizedX: 0, normalizedY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !card.isCenter) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = (x / rect.width - 0.5) * 2;
    const normalizedY = (y / rect.height - 0.5) * 2;
    setMousePos({ x, y, normalizedX, normalizedY });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => {
        setIsCardHovered(false);
        setMousePos({ x: 0, y: 0, normalizedX: 0, normalizedY: 0 });
      }}
      onClick={onCardClick}
      drag={card.isCenter ? "x" : false}
      dragDirectionLock={true}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.25}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 25 }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -30 || info.velocity.x < -180) onDragNext();
        else if (info.offset.x > 30 || info.velocity.x > 180) onDragPrev();
      }}
      animate={{
        x: card.x,
        scale: card.scale,
        rotateY: card.rotateY + (card.isCenter && isCardHovered ? mousePos.normalizedX * 5 : 0),
        rotateX: card.isCenter && isCardHovered ? -mousePos.normalizedY * 5 : 0,
        opacity: card.opacity,
        zIndex: card.zIndex,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        mass: 0.85,
      }}
      whileHover={card.isCenter ? { scale: 1.025 } : { scale: card.scale * 1.04 }}
      className="absolute rounded-3xl overflow-hidden bg-card border border-foreground/20 select-none group"
      style={{
        width: isMobile
          ? `${(2.5 / 3) * stageWidth}px`
          : `${Math.min((2.5 / 3) * stageWidth, (2.5 / 3) * stageHeight * 0.72)}px`,
        height: `${Math.max(0, (2.5 / 3) * stageHeight - (isMobile ? 48 : 72))}px`,
        maxHeight: `${Math.max(0, (2.5 / 3) * stageHeight - 40)}px`,
        boxShadow: card.boxShadow,
        transformOrigin: "center center",
        transformStyle: "preserve-3d",
        cursor: card.isCenter ? "grab" : "pointer",
      }}
    >
      {/* Photo Artwork with subtle interactive parallax response */}
      <motion.img
        src={item.img}
        alt={item.titleLine1}
        animate={{
          scale: card.isCenter && isCardHovered ? 1.08 : 1.02,
          x: card.isCenter && isCardHovered ? mousePos.normalizedX * -10 : 0,
          y: card.isCenter && isCardHovered ? mousePos.normalizedY * -10 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        loading="lazy"
        draggable={false}
      />

      {/* Floating Card CTA Bar: Clean, focused action controls without dense textual clutter */}
      <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-6 z-20 pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-background/75 backdrop-blur-xl border border-foreground/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Card Engine Identity */}
          <div className="flex items-center gap-2.5 text-left min-w-0">
            <span
              className="size-2.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: item.color || "#F0FAFF" }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                  {item.titleLine1}
                </h4>
                {item.shortCode && (
                  <span className="hidden xs:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/10 text-[#F0FAFF] border border-foreground/10">
                    [{item.shortCode}]
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-neutral-400 truncate">
                {item.tag || `Phase 0${item.phaseNumber || 1} • ${item.category || "Autonomous"}`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Primary Action Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => {
                e.stopPropagation();
                if (onCtaClick) {
                  onCtaClick(item);
                } else {
                  navigate(item.ctaUrl || "/audit");
                }
              }}
              aria-label={`Launch ${item.titleLine1}`}
              className="ds-btn ds-btn-primary flex-1 sm:flex-initial px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>{item.ctaText || `Launch ${item.titleLine1}`}</span>
              <ArrowRight className="size-4 shrink-0" />
            </motion.button>

            {/* Secondary Action: Architecture Spec / Docs */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.ctaUrl || `/docs/${item.id}`);
              }}
              aria-label={`View architecture docs for ${item.titleLine1}`}
              title="Architecture Spec"
              className="ds-btn ds-btn-secondary px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 bg-foreground/10 hover:bg-foreground/20 text-foreground border border-foreground/20 backdrop-blur-md cursor-pointer"
            >
              <FileCode2 className="size-4 shrink-0 text-[#F0FAFF]" />
              <span className="hidden md:inline">Docs</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CoverFlowCarousel({
  items = auditorsCarouselItems,
  autoplay = true,
  autoplayDelay = 4000,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const stageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const total = items.length;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateStageSize = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setWindowDimensions({ width, height });
        setIsMobile(width < 768);
      }
    };

    updateStageSize();
    const observer = new ResizeObserver(updateStageSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

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

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const getCardProps = (idx: number) => {
    const offset = (idx - currentIndex + total) % total;

    // Card width based on 2.5/3th (83.33%) coverage of responsive viewport
    const cardWidth = isMobile
      ? (2.5 / 3) * windowDimensions.width
      : Math.min((2.5 / 3) * windowDimensions.width, (2.5 / 3) * windowDimensions.height * 0.85);

    const step1 = isMobile
      ? cardWidth * 0.56
      : Math.min(cardWidth * 0.65, windowDimensions.width * 0.36);

    const step2 = isMobile
      ? cardWidth * 1.05
      : Math.min(cardWidth * 1.2, windowDimensions.width * 0.62);

    if (offset === 0) {
      return {
        x: 0,
        scale: 1,
        rotateY: 0,
        opacity: 1,
        zIndex: 30,
        filter: "brightness(1)",
        boxShadow: `0 35px 95px rgba(0,0,0,0.95), 0 0 60px ${currentItem?.color || "#F0FAFF"}55`,
        isCenter: true,
      };
    }
    if (offset === 1) {
      return {
        x: step1,
        scale: isMobile ? 0.84 : 0.86,
        rotateY: -24,
        opacity: 0.68,
        zIndex: 20,
        filter: "brightness(0.7)",
        boxShadow: "0 22px 50px rgba(0,0,0,0.7)",
        isCenter: false,
      };
    }
    if (offset === 2) {
      return {
        x: step2,
        scale: isMobile ? 0.7 : 0.72,
        rotateY: -36,
        opacity: 0.38,
        zIndex: 10,
        filter: "brightness(0.45) blur(1px)",
        boxShadow: "0 14px 35px rgba(0,0,0,0.55)",
        isCenter: false,
      };
    }
    if (offset === total - 1) {
      return {
        x: -step1,
        scale: isMobile ? 0.84 : 0.86,
        rotateY: 24,
        opacity: 0.68,
        zIndex: 20,
        filter: "brightness(0.7)",
        boxShadow: "0 22px 50px rgba(0,0,0,0.7)",
        isCenter: false,
      };
    }
    if (offset === total - 2) {
      return {
        x: -step2,
        scale: isMobile ? 0.7 : 0.72,
        rotateY: 36,
        opacity: 0.38,
        zIndex: 10,
        filter: "brightness(0.45) blur(1px)",
        boxShadow: "0 14px 35px rgba(0,0,0,0.55)",
        isCenter: false,
      };
    }

    return {
      x: offset > total / 2 ? -step2 * 1.4 : step2 * 1.4,
      scale: 0.45,
      rotateY: offset > total / 2 ? 45 : -45,
      opacity: 0,
      zIndex: 0,
      filter: "brightness(0.2) blur(4px)",
      boxShadow: "none",
      isCenter: false,
    };
  };

  const handleCardClick = (item: CarouselItem, isCenter: boolean, idx: number) => {
    if (!isCenter) {
      goToSlide(idx);
      return;
    }
    if (onCtaClick) {
      onCtaClick(item);
    } else if (item.ctaUrl) {
      navigate(item.ctaUrl);
    }
  };

  return (
    <section
      className={`relative w-full h-full min-h-0 flex items-center justify-center overflow-hidden select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Ambience with smooth image fade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentItem.img}
            src={currentItem.img}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full h-full object-cover filter blur-[50px] scale-110"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      <div className="relative w-full h-full min-h-0 flex justify-center items-center z-10">
        {/* Fullscreen 3D Coverflow Stage spanning full height underneath top-nav */}
        <div
          ref={stageRef}
          className="relative w-full h-full min-h-0 flex justify-center items-center"
          style={{ perspective: "1800px" }}
        >
          {items.map((item, idx) => {
            const card = getCardProps(idx);

            return (
              <CoverflowCard
                key={item.id || idx}
                item={item}
                card={card}
                isMobile={isMobile}
                stageWidth={windowDimensions.width}
                stageHeight={windowDimensions.height}
                onCardClick={() => handleCardClick(item, card.isCenter, idx)}
                onCtaClick={onCtaClick}
                onDragNext={nextSlide}
                onDragPrev={prevSlide}
              />
            );
          })}
        </div>

        {/* Floating Prev/Next Arrow Navigation Buttons */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          aria-label="Previous engine"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 size-10 sm:size-12 rounded-full bg-background/60 hover:bg-background/85 text-foreground/90 hover:text-foreground border border-foreground/20 backdrop-blur-xl flex items-center justify-center transition-all shadow-xl cursor-pointer"
        >
          <ChevronLeft className="size-5 sm:size-6" />
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          aria-label="Next engine"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 size-10 sm:size-12 rounded-full bg-background/60 hover:bg-background/85 text-foreground/90 hover:text-foreground border border-foreground/20 backdrop-blur-xl flex items-center justify-center transition-all shadow-xl cursor-pointer"
        >
          <ChevronRight className="size-5 sm:size-6" />
        </motion.button>
      </div>
    </section>
  );
}

export const CoverFlowCarouselDemo = CoverFlowCarousel;
export default CoverFlowCarousel;

