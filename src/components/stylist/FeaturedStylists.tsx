"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { StylistCard } from "@/components/stylist/StylistCard";
import type { Stylist } from "@/types/stylist";

interface FeaturedStylistsProps {
  stylists: Stylist[];
}

export function FeaturedStylists({ stylists }: FeaturedStylistsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate active page based on item width (approx 300px per card)
    const itemWidth = 300;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIndex(Math.min(index, stylists.length - 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [stylists.length]);

  const scrollTo = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    const cardWidth = 300;
    const offset = direction === "next" ? cardWidth : -cardWidth;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 300;
    scrollRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
  };

  if (!stylists || stylists.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Header with Title and Pagination Controls */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
            Featured Stylists
          </h2>
          <p className="text-[11px] text-on-surface-variant">
            Top-rated and curated hair stylists across London
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Arrow Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollTo("prev")}
              disabled={!canScrollLeft}
              aria-label="Previous featured stylist"
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/60 transition-all ${
                !canScrollLeft
                  ? "opacity-30 cursor-not-allowed bg-surface-container-low text-outline"
                  : "bg-surface-container-lowest text-primary hover:bg-secondary-fixed/40 active:scale-95 shadow-xs"
              }`}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={() => scrollTo("next")}
              disabled={!canScrollRight}
              aria-label="Next featured stylist"
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/60 transition-all ${
                !canScrollRight
                  ? "opacity-30 cursor-not-allowed bg-surface-container-low text-outline"
                  : "bg-surface-container-lowest text-primary hover:bg-secondary-fixed/40 active:scale-95 shadow-xs"
              }`}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <Link
            href="/stylists"
            className="text-xs font-semibold uppercase tracking-caps text-secondary hover:text-primary ml-1"
          >
            See All
          </Link>
        </div>
      </div>

      {/* Paginated / Smooth Snap Slider */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stylists.map((stylist) => (
          <div key={stylist.id} className="snap-start shrink-0">
            <StylistCard stylist={stylist} variant="featured" />
          </div>
        ))}
      </div>

      {/* Pagination Indicator Dots */}
      {stylists.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {stylists.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-outline-variant hover:bg-outline"
              }`}
            />
          ))}
        </div>
      )}

      {/* Credit & Media Disclaimer */}
      <p className="mt-2.5 text-center text-[10px] text-outline tracking-wide">
        Artistry credited to respective specialists • Photos remain property of creators
      </p>
    </section>
  );
}
