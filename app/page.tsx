"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import anime from "animejs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Layers,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
  ChevronRight,
  Star,
  Camera,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Target,
  User,
  Heart,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast, Toaster } from "sonner";

// Custom WhatsApp Icon SVG
const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.331a9.927 9.927 0 004.93 1.302h.004c5.507 0 9.99-4.478 9.99-9.985a9.97 9.97 0 00-9.989-9.986zm0 18.29h-.003a8.263 8.263 0 01-4.218-1.157l-.303-.18-3.136.822.837-3.058-.197-.314a8.271 8.271 0 01-1.267-4.43c.002-4.562 3.715-8.272 8.287-8.272 2.214.001 4.293.864 5.86 2.43 1.565 1.566 2.427 3.646 2.426 5.86-.003 4.563-3.717 8.273-8.287 8.273zm4.542-6.196c-.249-.125-1.472-.725-1.7-.808-.228-.083-.393-.125-.559.125-.166.249-.643.808-.788.975-.145.166-.29.187-.539.062a7.613 7.613 0 01-3.116-1.922 8.397 8.397 0 01-2.155-2.684c-.249-.427-.027-.658.185-.869.191-.19.427-.497.643-.746.217-.25.29-.415.434-.69.146-.276.073-.518-.036-.742-.109-.224-.959-2.311-1.312-3.16-.343-.824-.693-.711-.958-.724-.249-.013-.534-.014-.82-.014-.285 0-.751.107-1.14.53-.39.425-1.488 1.454-1.488 3.541s1.525 4.102 1.737 4.394c.213.293 3.001 4.58 7.272 6.422 1.016.439 1.808.701 2.426.897 1.02.324 1.948.278 2.682.168.817-.121 2.505-1.023 2.857-2.012.352-.99.352-1.838.246-2.012-.107-.175-.29-.276-.539-.401z" />
  </svg>
);

interface ScheduleCard {
  id: string;
  day: string;
  time: string;
  location: string;
  totalSlots: number;
  filledSlots: number;
  status: "available" | "limited" | "full";
  badgeText: string;
}

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Refs for animations
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const shuttlecockRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);
  const counterMemberRef = useRef<HTMLSpanElement>(null);
  const counterTourneyRef = useRef<HTMLSpanElement>(null);
  const schedulesRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Weekly mabar schedule data (Updated: Sunday night only)
  const [schedules, setSchedules] = useState<ScheduleCard[]>([
    {
      id: "sch-1",
      day: "Minggu Malam",
      time: "19:00 - 22:00 WIB",
      location: "Gor Abadi Cilimus - Lapangan 3",
      totalSlots: 12,
      filledSlots: 8,
      status: "available",
      badgeText: "Tersedia",
    },
  ]);

  useEffect(() => {
    // 1. Hero Animations
    if (heroHeadlineRef.current) {
      const text = heroHeadlineRef.current.innerText;
      heroHeadlineRef.current.innerHTML = text
        .split(" ")
        .map((word) => `<span class="inline-block">${word}</span>`)
        .join(" ");

      anime({
        targets: heroHeadlineRef.current.querySelectorAll("span"),
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: "easeOutExpo",
      });
    }

    if (heroCtaRef.current) {
      anime({
        targets: heroCtaRef.current,
        scale: [0.8, 1],
        opacity: [0, 1],
        delay: 500,
        duration: 1000,
        easing: "easeOutExpo",
      });
    }

    if (shuttlecockRef.current) {
      anime({
        targets: shuttlecockRef.current,
        translateY: [-10, 10],
        direction: "alternate",
        loop: true,
        duration: 2500,
        easing: "easeInOutSine",
      });
    }

    // Intersection Observer for viewport triggers
    const observerOptions = {
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 2. Counter Animations
          if (entry.target === statsSectionRef.current) {
            const memberObj = { val: 0 };
            anime({
              targets: memberObj,
              val: 150,
              round: 1,
              easing: "easeOutExpo",
              duration: 2000,
              update: () => {
                if (counterMemberRef.current)
                  counterMemberRef.current.innerHTML = memberObj.val.toString();
              },
            });

            const tourneyObj = { val: 0 };
            anime({
              targets: tourneyObj,
              val: 8,
              round: 1,
              easing: "easeOutExpo",
              duration: 2000,
              update: () => {
                if (counterTourneyRef.current)
                  counterTourneyRef.current.innerHTML =
                    tourneyObj.val.toString();
              },
            });
          }

          // 3 & 4. Schedule Cards & Progress Bars
          if (entry.target === schedulesRef.current) {
            anime({
              targets: ".schedule-card",
              translateY: [30, 0],
              opacity: [0, 1],
              delay: anime.stagger(100),
              duration: 800,
              easing: "easeOutExpo",
            });

            anime({
              targets: ".progress-bar-fill",
              width: (el: HTMLElement) => el.getAttribute("data-width") + "%",
              duration: 1000,
              easing: "easeInOutQuad",
            });
          }

          // 6. Gallery Grid
          if (entry.target === galleryRef.current) {
            anime({
              targets: ".gallery-item",
              scale: [0.9, 1],
              opacity: [0, 1],
              delay: anime.stagger(100),
              duration: 800,
              easing: "easeOutExpo",
            });
          }

          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (statsSectionRef.current) observer.observe(statsSectionRef.current);
    if (schedulesRef.current) observer.observe(schedulesRef.current);
    if (galleryRef.current) observer.observe(galleryRef.current);

    return () => observer.disconnect();
  }, []);

  // Handle schedule registration click
  const handleRegisterSchedule = (sch: ScheduleCard) => {
    if (sch.status === "full") {
      toast.error(`Maaf, slot untuk sesi ${sch.day} sudah penuh.`);
      return;
    }

    // Simulate booking action
    toast.success(
      `🎉 Berhasil mendaftar! Hubungi admin untuk konfirmasi pembayaran sewa lapangan.`,
    );
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === sch.id
          ? {
              ...s,
              filledSlots: s.filledSlots + 1,
              status: s.filledSlots + 1 >= s.totalSlots ? "full" : s.status,
            }
          : s,
      ),
    );
  };

  // Toggle FAQ item collapse
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "available":
        return "bg-primary/10 text-primary border-primary/20";
      case "limited":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-muted/20";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground relative font-sans overflow-x-hidden">
      {/* Decorative floating grids / glowing blur orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-150px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. STICKY NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-muted p-0.5 rounded-xl border border-border flex items-center justify-center overflow-hidden w-9 h-9 shadow-sm">
              <img
                src="/daysmash.webp"
                alt="DaySmash"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <span className="text-xl font-serif font-light text-foreground tracking-tight">
              DaySmash
            </span>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <a href="#beranda" className="hover:text-primary transition-colors">
              Beranda
            </a>
            <a href="#jadwal" className="hover:text-primary transition-colors">
              Jadwal Main
            </a>
            <a href="#galeri" className="hover:text-primary transition-colors">
              Galeri
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com/KhGiyMDg79J2LHsOwpfEsj"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-active text-white font-bold h-9 px-4 rounded-xl text-xs transition-colors shadow-lg shadow-primary/20"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Gabung Grup
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        id="beranda"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 min-h-[calc(100vh-64px)] justify-center"
      >
        <div className="flex-1 space-y-6 text-center lg:text-left relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full text-primary text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Official Badminton Mabar Hub
          </div>
          <h1
            ref={heroHeadlineRef}
            className="text-4xl sm:text-5xl md:text-6xl font-serif text-foreground leading-tight font-extralight tracking-tight max-w-2xl"
          >
            Main, Kompetisi & Temui <br />
            <span className="text-primary font-serif font-bold italic">
              Pecinta Badminton
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed font-medium">
            Komunitas mabar badminton DaySmash menyelenggarakan sesi latihan
            teratur, turnamen internal, dan pembagian level berimbang. Mari
            bergabung untuk meningkatkan performa tepok bulu Anda!
          </p>

          <div
            ref={heroCtaRef}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <a
              href="https://chat.whatsapp.com/KhGiyMDg79J2LHsOwpfEsj"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-active text-white font-bold h-11 px-8 rounded-xl text-xs transition-colors shadow-lg shadow-primary/25"
            >
              Gabung Sekarang (WhatsApp)
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>

          {/* Metrics Row (Counter Section) */}
          <div
            ref={statsSectionRef}
            className="pt-8 grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0 border-t border-border"
          ></div>
        </div>

        {/* Hero visual court card overlay */}
        <div className="flex-1 w-full max-w-sm lg:max-w-none flex justify-center relative z-10">
          <div
            ref={shuttlecockRef}
            className="relative border-4 border-primary/20 rounded-2xl w-full max-w-[340px] aspect-[4/6] bg-card backdrop-blur-sm shadow-2xl p-4 flex flex-col justify-between overflow-hidden"
          >
            {/* Badminton court lines */}
            <div className="absolute inset-0 border-b border-primary/10 top-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -translate-y-1/2 flex items-center justify-center">
              <span className="bg-primary/80 px-2 py-0.5 rounded text-[8px] text-white font-bold uppercase tracking-wider shadow-sm">
                NET
              </span>
            </div>

            {/* Left/Right service lines */}
            <div className="absolute inset-y-0 left-1/2 border-l border-primary/10" />
            <div className="absolute top-[20%] left-0 right-0 border-t border-primary/10" />
            <div className="absolute bottom-[20%] left-0 right-0 border-b border-primary/10" />

            {/* Tim A players visual */}
            <div className="flex justify-around items-center pt-8 relative z-20">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-extrabold shadow-lg border-2 border-white/20">
                  A1
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-extrabold shadow-lg border-2 border-white/20">
                  A2
                </div>
              </div>
            </div>

            <div className="text-center font-serif text-[10px] text-primary/50 font-bold tracking-wider uppercase my-2">
              VERSUS
            </div>

            {/* Tim B players visual */}
            <div className="flex justify-around items-center pb-8 relative z-20">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-extrabold shadow-lg border-2 border-white/20">
                  B1
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-extrabold shadow-lg border-2 border-white/20">
                  B2
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION "JADWAL MAIN MINGGUAN" */}
      <section
        id="jadwal"
        className="bg-secondary/40 border-y border-border py-20 relative"
      >
        <div
          ref={schedulesRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif text-foreground font-light tracking-tight">
              Jadwal Main Mingguan
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto font-medium">
              Sesi rutin kumpul dan latihan komunitas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            {schedules.map((sch) => (
              <Card
                key={sch.id}
                className="schedule-card bg-card border-border p-6 rounded-2xl shadow-sm opacity-0 hover:scale-[1.03] hover:rotate-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getBadgeStyle(sch.status)}>
                    {sch.badgeText}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    {sch.filledSlots} / {sch.totalSlots} Slot
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {sch.day}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sch.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      {sch.location}
                    </div>
                  </div>

                  {/* Progress Bar Slot */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Keterisian Slot</span>
                      <span>
                        {Math.round((sch.filledSlots / sch.totalSlots) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="progress-bar-fill h-full bg-primary rounded-full w-0"
                        data-width={(sch.filledSlots / sch.totalSlots) * 100}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRegisterSchedule(sch)}
                    className="w-full bg-primary hover:bg-primary-active text-white text-xs font-bold h-9 rounded-xl"
                  >
                    Ikut Sesi Ini
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION "GALERI KOMUNITAS" */}
      <section id="galeri" className="py-20 relative">
        <div
          ref={galleryRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif text-foreground font-light tracking-tight">
              Galeri Komunitas
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto font-medium">
              Dokumentasi antusiasme dan kebersamaan di lapangan setiap sesi
              mabar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: "/foto/IMG_0413.webp", alt: "Sesi Latihan 1" },
              { src: "/foto/IMG_0483.webp", alt: "Sesi Latihan 2" },
              { src: "/foto/image.png", alt: "Sesi Latihan 3" },
            ].map((img, i) => (
              <div
                key={i}
                className="gallery-item opacity-0 group relative overflow-hidden bg-card border border-border rounded-2xl aspect-[4/3] cursor-pointer hover:border-primary/20 transition-all shadow-sm"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION "TESTIMONI" */}
      <section className="bg-secondary/40 border-t border-border py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif text-foreground font-light tracking-tight">
              Testimoni Member
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto font-medium">
              Apa yang mereka katakan mengenai pengalaman bergabung di komunitas
              DaySmash.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                text: "Seruu eyy mabar di DaySmash, makin sukses terus dakss!!, letsgo minggu depan main deui atuh!",
                author: "Abdul",
              },
              {
                text: "Ternyata ada mabar murah pisan ey wkwk, masuk budget mahasiswa, tempatnya juga enakeun buat latihan, semoga makin rame dan makin banyak yang gabung yaa!",
                author: "Itis",
              },
            ].map((t, idx) => (
              <Card
                key={idx}
                className="bg-card border-border p-6 sm:p-8 rounded-2xl flex flex-col justify-between shadow-sm relative"
              >
                <div className="absolute top-4 right-6 text-primary/10 text-7xl font-serif leading-none pointer-events-none font-bold">
                  “
                </div>
                <div className="space-y-4">
                  <div className="flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium relative z-10">
                    "{t.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-border mt-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {t.author[0]}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {t.author}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      {t.role}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SECTION CTA PENUTUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-primary via-primary-active to-primary-active border border-primary/20 rounded-3xl p-8 sm:p-16 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-lg mx-auto space-y-6 relative z-10">
            <Heart className="w-12 h-12 text-white mx-auto animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-light tracking-tight">
              Siap Ambil Raketmu Minggu Ini?
            </h2>
            <p className="text-primary-foreground/80 text-xs sm:text-sm leading-relaxed font-medium">
              Kami menyambut hangat kedatangan pemain dari segala tingkat level
              permainan. Gabung ke grup WhatsApp koordinasi kami dan mulailah
              mabar seru bersama kami!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="https://chat.whatsapp.com/KhGiyMDg79J2LHsOwpfEsj"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-background text-primary hover:bg-secondary font-bold h-11 px-8 rounded-xl text-xs transition-colors shadow-lg"
              >
                <WhatsAppIcon className="w-4.5 h-4.5" />
                Gabung WhatsApp Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-background border-t border-border mt-auto py-12 text-xs text-muted-foreground font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-0.5 rounded-xl border border-border flex items-center justify-center overflow-hidden w-8 h-8 shadow-sm">
                <img
                  src="/daysmash.webp"
                  alt="DaySmash"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="text-base font-serif font-light text-foreground tracking-tight">
                DaySmash
              </span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Komunitas mabar badminton doubes yang mengedepankan rotasi bermain
              adil, seimbang berdasarkan level, dan pembukuan uang kas kasir
              mabar yang transparan.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-foreground text-xs font-bold uppercase tracking-wider">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2.5 text-[11px]">
              <li>
                <a
                  href="#beranda"
                  className="hover:text-primary transition-colors"
                >
                  Home / Beranda
                </a>
              </li>
              <li>
                <a
                  href="#jadwal"
                  className="hover:text-primary transition-colors"
                >
                  Jadwal Mabar Mingguan
                </a>
              </li>
              <li>
                <a
                  href="#galeri"
                  className="hover:text-primary transition-colors"
                >
                  Galeri
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-foreground text-xs font-bold uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Punya pertanyaan mengenai cara bergabung, lokasi lapangan, atau
              ingin latihan partner mabar? Hubungi kami langsung di saluran
              media sosial:
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] font-bold">
              <a
                href="https://instagram.com/ExampleDaySmash"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors border border-border rounded-xl py-1.5 px-3 bg-secondary"
              >
                Instagram
              </a>
              <a
                href="https://chat.whatsapp.com/KhGiyMDg79J2LHsOwpfEsj"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors border border-border rounded-xl py-1.5 px-3 bg-secondary flex items-center gap-1.5"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#22C55E]" />
                WhatsApp Group
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border mt-10 pt-6 text-center text-[10px] text-muted-foreground/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            &copy; {new Date().getFullYear()} DaySmash Badminton Community. Hak
            Cipta Dilindungi.
          </span>
          <span>
            Offline PWA Ready &amp; Secure. Developed for Mabar Enthusiasts.
          </span>
        </div>
      </footer>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
