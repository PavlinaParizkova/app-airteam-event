"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SlideNav from "./components/SlideNav";
import SlideDrawer from "./components/SlideDrawer";
import ScrollToTop from "./components/ScrollToTop";
import SlideCover from "./components/slides/SlideCover";
import SlideWhatWePresent from "./components/slides/SlideWhatWePresent";
import SlideTeam from "./components/slides/SlideTeam";
import SlideDays from "./components/slides/SlideDays";
import SlideTransport from "./components/slides/SlideTransport";
import SlideMarketingKit from "./components/slides/SlideMarketingKit";
import SlideGifts from "./components/slides/SlideGifts";
import SlideGiftsBudget from "./components/slides/SlideGiftsBudget";
import SlideDressCode from "./components/slides/SlideDressCode";
import SlideBoothGallery from "./components/slides/SlideBoothGallery";
import SlidePilotStyleStand from "./components/slides/SlidePilotStyleStand";
import SlideBoothBudget from "./components/slides/SlideBoothBudget";
import SlideAccommodation from "./components/slides/SlideAccommodation";
import SlideAccommodation2 from "./components/slides/SlideAccommodation2";
import SlideDressCodeBudget from "./components/slides/SlideDressCodeBudget";
import SlideTotalCosts from "./components/slides/SlideTotalCosts";
import SlideCalendar from "./components/slides/SlideCalendar";
import SlideSales from "./components/slides/SlideSales";
import SlideChecklistTransport from "./components/slides/SlideChecklistTransport";
import SlideChecklistAttendance from "./components/slides/SlideChecklistAttendance";
import SlideChecklistDressCode from "./components/slides/SlideChecklistDressCode";
import SlidePostSummary from "./components/slides/SlidePostSummary";
import SlidePostMeetings from "./components/slides/SlidePostMeetings";
import SlidePostDeals from "./components/slides/SlidePostDeals";
import SlidePostFinance from "./components/slides/SlidePostFinance";
import SlidePostKPI from "./components/slides/SlidePostKPI";
import SlidePostLinkedIn from "./components/slides/SlidePostLinkedIn";
import SlidePostActionItems from "./components/slides/SlidePostActionItems";

export const SLIDES = [
  { component: <SlideCover />,                  label: "Úvod",              section: "Úvod" },
  { component: <SlideWhatWePresent />,           label: "Prezentace",        section: "Obsah" },
  { component: <SlideTeam />,                    label: "Tým",               section: "Tým" },
  { component: <SlideDays />,                    label: "Harmonogram",       section: "Tým" },
  { component: <SlideTransport />,               label: "Doprava",           section: "Logistika" },
  { component: <SlideChecklistTransport />,      label: "Checklist · Doprava", section: "Logistika", updated: true },
  { component: <SlideAccommodation />,           label: "Ubytování 1",       section: "Logistika" },
  { component: <SlideAccommodation2 />,          label: "Ubytování 2",       section: "Logistika" },
  { component: <SlideCalendar />,                label: "Schůzky GCal",      section: "Logistika",     updated: true },
  { component: <SlideChecklistAttendance />,   label: "Checklist · Účast", section: "Logistika", updated: true },
  { component: <SlideMarketingKit />,            label: "Marketingové materiály", section: "Marketingové materiály", updated: true },
  { component: <SlideSales />,                   label: "Sales & KPIs",      section: "Sales",         updated: true },
  { component: <SlideDressCode />,               label: "Dress Code",        section: "Dress Code",    updated: true },
  { component: <SlideChecklistDressCode />,      label: "Checklist · Oblečení", section: "Dress Code", updated: true },
  { component: <SlideDressCodeBudget />,         label: "Rozpočet oblečení", section: "Dress Code" },
  { component: <SlideGifts />,                   label: "Dárky",             section: "Dárky" },
  { component: <SlideGiftsBudget />,             label: "Rozpočet dárků",    section: "Dárky" },
  { component: <SlideBoothGallery />,             label: "Grafika stánku",    section: "Stánek",        updated: true },
  { component: <SlidePilotStyleStand />,         label: "Stojan PilotStyle", section: "Stánek",        updated: true },
  { component: <SlideBoothBudget />,             label: "Stánek MLT",        section: "Stánek" },
  { component: <SlideTotalCosts />,              label: "Celkové náklady",   section: "Souhrn" },
  { component: <SlidePostSummary />,             label: "Shrnutí účasti",    section: "Vyhodnocení",   updated: true },
  { component: <SlidePostMeetings />,            label: "Schůzky",           section: "Vyhodnocení",   updated: true },
  { component: <SlidePostDeals />,               label: "Top 5 jednání",     section: "Vyhodnocení",   updated: true },
  { component: <SlidePostFinance />,             label: "Finance",           section: "Vyhodnocení",   updated: true },
  { component: <SlidePostKPI />,                 label: "KPI plán vs. realita", section: "Vyhodnocení", updated: true },
  { component: <SlidePostLinkedIn />,            label: "LinkedIn",          section: "Vyhodnocení",   updated: true },
  { component: <SlidePostActionItems />,         label: "Action Items & 2027", section: "Vyhodnocení", updated: true },
];

export const SECTIONS = [
  { label: "Úvod",          slideIndex: 0 },
  { label: "Obsah",         slideIndex: 1 },
  { label: "Tým",           slideIndex: 2 },
  { label: "Logistika",     slideIndex: 4 },
  { label: "Marketingové materiály", slideIndex: 10 },
  { label: "Sales",         slideIndex: 11 },
  { label: "Dress Code",    slideIndex: 12 },
  { label: "Dárky",         slideIndex: 15 },
  { label: "Stánek",        slideIndex: 17 },
  { label: "Souhrn",        slideIndex: 20 },
  { label: "Vyhodnocení",   slideIndex: 21 },
].map((sec, i, arr) => {
  const end = arr[i + 1]?.slideIndex ?? SLIDES.length;
  const hasUpdate = SLIDES.slice(sec.slideIndex, end).some((s) => s.updated);
  return { ...sec, hasUpdate };
});

type Direction = "forward" | "backward" | null;

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<Direction>(null);
  const [animating, setAnimating] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const goTo = useCallback(
    (index: number) => {
      if (index === current || animating) return;
      const dir: Direction = index > current ? "forward" : "backward";
      setDirection(dir);
      setAnimating(true);

      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
        setDirection(null);
        // Scroll to top when changing slides
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 260);
    },
    [current, animating]
  );

  const next = useCallback(() => goTo(Math.min(current + 1, SLIDES.length - 1)), [current, goTo]);
  const prev = useCallback(() => goTo(Math.max(current - 1, 0)), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (drawerOpen) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(SLIDES.length - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, goTo, drawerOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) next();
        else prev();
      }
    },
    [next, prev]
  );

  const exitStyle: React.CSSProperties = animating
    ? {
        opacity: 0,
        transform: direction === "forward" ? "translateX(-24px)" : "translateX(24px)",
        transition: "opacity 260ms ease, transform 260ms ease",
        pointerEvents: "none",
      }
    : {};

  return (
    <div
      className="w-full min-w-0"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--color-at-blue-v1)" }}
    >
      {/* Sticky nav */}
      <SlideNav
        current={current}
        total={SLIDES.length}
        sections={SECTIONS}
        onPrev={prev}
        onNext={next}
        onGoTo={goTo}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Slide content – scrollable */}
      <main
        className="min-w-0 w-full flex-1"
        style={{ flex: 1 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="w-full min-w-0 self-stretch"
          style={{ minHeight: "calc(100vh - 52px)", display: "flex", flexDirection: "column", paddingBottom: 48, ...exitStyle }}
        >
          {SLIDES[current].component}
        </div>

        {/* Slide counter strip at bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingBottom: 16,
          }}
        >
          {/* Dots – visible on sm+ */}
          <div className="hidden sm:flex" style={{ gap: 6 }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Přejít na slide ${i + 1}`}
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === current ? "var(--color-at-red)" : "var(--color-at-blue-v2)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "width 250ms ease, background 200ms",
                }}
              />
            ))}
          </div>

          {/* Text counter – visible on mobile */}
          <span className="sm:hidden text-xs font-mono" style={{ color: "var(--color-at-blue-v4)" }}>
            {String(current + 1).padStart(2, "0")}
            {" "}<span style={{ color: "var(--color-at-blue-v2)" }}>/</span>{" "}
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </main>

      {/* Scroll to top */}
      <ScrollToTop />

      {/* Slide drawer */}
      <SlideDrawer
        open={drawerOpen}
        current={current}
        slides={SLIDES.map((s) => ({ label: s.label, section: s.section, updated: s.updated }))}
        sections={SECTIONS}
        onGoTo={(i) => { goTo(i); setDrawerOpen(false); }}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
