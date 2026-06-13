"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Layers,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  DollarSign,
  MessageCircle,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Apakah pemula boleh bergabung?",
    answer: "Tentu saja! Komunitas kami terbuka untuk semua level, dari Level 1 (pemula) hingga Level 5 (berpengalaman). Asisten penjadwalan pintar kami akan memastikan semua pemain mendapatkan lawan dan rekan tim yang seimbang.",
  },
  {
    question: "Berapa biaya per kedatangan?",
    answer: "Iuran mabar reguler adalah Rp 12.000 flat untuk sewa lapangan, ditambah Rp 2.000 untuk setiap shuttlecock (kok) yang Anda gunakan selama pertandingan. Biaya ini akan dihitung otomatis oleh sistem kasir kami.",
  },
  {
    question: "Bagaimana sistem rotasi bermainnya?",
    answer: "Kami menggunakan aplikasi penjadwalan cerdas DaySmash yang memprioritaskan pemain yang sudah mengantre, membatasi bermain berturut-turut demi stamina, serta memasangkan tim berdasarkan tingkat level agar permainan tetap seru dan kompetitif.",
  },
  {
    question: "Di mana lokasi lapangan mabar?",
    answer: "Kami menyewa lapangan vinyl premium di Smash Arena (Lap. 1, 2 & 3) setiap Jumat malam pukul 19:00 - 22:00 WIB. Lapangan sudah berkarpet vinyl standar turnamen dengan penerangan optimal.",
  },
];

const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.331a9.927 9.927 0 004.93 1.302h.004c5.507 0 9.99-4.478 9.99-9.985a9.97 9.97 0 00-9.989-9.986zm0 18.29h-.003a8.263 8.263 0 01-4.218-1.157l-.303-.18-3.136.822.837-3.058-.197-.314a8.271 8.271 0 01-1.267-4.43c.002-4.562 3.715-8.272 8.287-8.272 2.214.001 4.293.864 5.86 2.43 1.565 1.566 2.427 3.646 2.426 5.86-.003 4.563-3.717 8.273-8.287 8.273zm4.542-6.196c-.249-.125-1.472-.725-1.7-.808-.228-.083-.393-.125-.559.125-.166.249-.643.808-.788.975-.145.166-.29.187-.539.062a7.613 7.613 0 01-3.116-1.922 8.397 8.397 0 01-2.155-2.684c-.249-.427-.027-.658.185-.869.191-.19.427-.497.643-.746.217-.25.29-.415.434-.69.146-.276.073-.518-.036-.742-.109-.224-.959-2.311-1.312-3.16-.343-.824-.693-.711-.958-.724-.249-.013-.534-.014-.82-.014-.285 0-.751.107-1.14.53-.39.425-1.488 1.454-1.488 3.541s1.525 4.102 1.737 4.394c.213.293 3.001 4.58 7.272 6.422 1.016.439 1.808.701 2.426.897 1.02.324 1.948.278 2.682.168.817-.121 2.505-1.023 2.857-2.012.352-.99.352-1.838.246-2.012-.107-.175-.29-.276-.539-.401z"/>
  </svg>
);

interface CompanyProfileProps {
  onStartScheduler: () => void;
}

export default function CompanyProfile({ onStartScheduler }: CompanyProfileProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="max-w-5xl w-full mx-auto space-y-12 pb-16 relative z-10">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
        
        <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Badminton Community Hub
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white leading-none font-light tracking-tight">
            Mabar Seru <br />
            <span className="text-primary font-serif font-bold italic">Jumat Malam</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
            Selamat datang di komunitas mabar DaySmash! Kami berkumpul setiap Jumat malam untuk bermain badminton ganda secara suportif, teratur, dan seimbang bagi semua tingkat keahlian.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <a
              href="https://chat.whatsapp.com/ExampleDaySmashGroup"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold h-11 px-6 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-900/20"
            >
              <WhatsAppIcon className="w-4.5 h-4.5" />
              Gabung Grup WhatsApp
            </a>
            <button
              onClick={onStartScheduler}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#15803D] text-white font-bold h-11 px-6 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/10"
            >
              Mulai Penjadwalan Sesi
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual badminton court graphic */}
        <div className="flex-1 w-full max-w-xs md:max-w-none flex justify-center relative z-10">
          <div className="relative border-4 border-emerald-500/40 rounded-2xl w-full max-w-[340px] aspect-[4/6] bg-emerald-950/60 backdrop-blur-sm shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
            {/* Badminton court lines */}
            <div className="absolute inset-0 border-b-2 border-emerald-500/20 top-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/40 -translate-y-1/2 flex items-center justify-center">
              <span className="bg-emerald-600 px-2 py-0.5 rounded text-[8px] text-white font-bold uppercase tracking-wider shadow-sm">NET</span>
            </div>
            
            {/* Left/Right service lines */}
            <div className="absolute inset-y-0 left-1/2 border-l-2 border-emerald-500/20" />
            <div className="absolute top-[20%] left-0 right-0 border-t-2 border-emerald-500/20" />
            <div className="absolute bottom-[20%] left-0 right-0 border-b-2 border-emerald-500/20" />
            
            {/* Tim A players visual */}
            <div className="flex justify-around items-center pt-8 relative z-20">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-extrabold shadow-lg border-2 border-white/20">A1</div>
                <span className="text-[10px] text-emerald-300 font-bold bg-slate-900/60 px-1.5 py-0.5 rounded-full">Lvl 4</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-extrabold shadow-lg border-2 border-white/20">A2</div>
                <span className="text-[10px] text-emerald-300 font-bold bg-slate-900/60 px-1.5 py-0.5 rounded-full">Lvl 3</span>
              </div>
            </div>

            <div className="text-center font-serif text-[11px] text-emerald-400 font-semibold tracking-wider uppercase opacity-45 my-2">VERSUS</div>

            {/* Tim B players visual */}
            <div className="flex justify-around items-center pb-8 relative z-20">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-emerald-300 font-bold bg-slate-900/60 px-1.5 py-0.5 rounded-full">Lvl 5</span>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold shadow-lg border-2 border-white/20">B1</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-emerald-300 font-bold bg-slate-900/60 px-1.5 py-0.5 rounded-full">Lvl 2</span>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold shadow-lg border-2 border-white/20">B2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SESSION HIGHLIGHTS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-primary/10 text-primary p-3 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Jadwal Mabar</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Setiap hari <strong>Jumat Malam</strong>.<br />
              Waktu: <strong>19:00 - 22:00 WIB</strong> (3 Jam Penuh).
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-primary/10 text-primary p-3 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Lokasi Lapangan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              <strong>Smash Arena Badminton Court</strong><br />
              Jl. Badminton Raya No. 45 (Lap. 1, 2, & 3 Vinyl Premium).
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-primary/10 text-primary p-3 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Sistem Iuran Kas</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Iuran sewa lapangan: <strong>Rp 12.000 / orang</strong>.<br />
              Biaya pemakaian kok: <strong>Rp 2.000 / kok</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* COMMUNITY LEVEL SYSTEM & COURT GUIDELINES */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Level Standards Card */}
        <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif text-foreground font-light tracking-tight">Standar Level Pemain</h2>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Untuk menjaga agar setiap pertandingan berjalan seimbang dan seru, kami mengelompokkan kemampuan pemain dari skala 1 hingga 5:
          </p>
          
          <div className="space-y-4">
            {[
              { lvl: "Lvl 5", desc: "Expert / Advanced", detail: "Menguasai seluruh jenis pukulan (smash silang, dropshot tipis, netting tipis), stamina prima, dan paham posisi rotasi ganda taktis.", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
              { lvl: "Lvl 4", desc: "Semi-Advanced", detail: "Smash kencang & konsisten, pertahanan kuat, mampu melakukan netting, dan memahami penempatan bola ganda.", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
              { lvl: "Lvl 3", desc: "Intermediate (Menengah)", detail: "Bisa melakukan pukulan dasar dengan terarah, pertahanan cukup stabil, dan paham rotasi dasar ganda.", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
              { lvl: "Lvl 2", desc: "Beginner Plus", detail: "Memahami cara memukul bola dengan baik, namun pukulan overhead/backhand belum konsisten.", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
              { lvl: "Lvl 1", desc: "Pure Beginner", detail: "Baru memulai badminton, masih sering luput memukul shuttlecock, melatih pukulan servis dan lob dasar.", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start p-3 hover:bg-muted/40 rounded-xl transition-colors">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.color} whitespace-nowrap`}>
                  {item.lvl}
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">{item.desc}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Mabar With Us Card */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif text-foreground font-light tracking-tight">Etika & Aturan Lapangan</h2>
            </div>
            
            <ul className="space-y-3.5 text-xs text-muted-foreground font-medium">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <p><strong>Sportivitas Utama:</strong> Utamakan fun, persahabatan, dan keselamatan. Hindari amarah berlebih di lapangan.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <p><strong>Hadir Tepat Waktu:</strong> Sesi mabar dimulai jam 19.00 WIB. Disarankan datang 10 menit lebih awal untuk pemanasan.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <p><strong>Pakaian Olahraga:</strong> Wajib menggunakan kaos olahraga, celana olahraga, dan sepatu khusus badminton non-marking sole.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <p><strong>Adil Berbagi Lapangan:</strong> Asisten penjadwalan DaySmash akan mengatur giliran bermain secara otomatis agar tidak ada yang menunggu terlalu lama.</p>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-emerald-500/5 border border-primary/20 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Teknologi Penjadwalan</h3>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-snug">
              Bebas Pilih Rekomendasi Match Cerdas
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Sistem kami secara cerdas menganalisis tingkat keahlian (level), riwayat pertandingan terakhir Anda, rekan partner sebelumnya, lawan bermain, hingga durasi menunggu agar pembagian giliran main merata dan kompetitif.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-serif text-foreground font-light tracking-tight">Tanya Jawab (FAQ)</h2>
        </div>
        
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between text-left py-2 hover:text-primary transition-colors text-xs font-bold text-foreground"
              >
                <span>{item.question}</span>
                {openFaqIndex === i ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {openFaqIndex === i && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-medium pl-1">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* JOIN GROUP CALL-TO-ACTION CARD */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-md mx-auto space-y-4 relative z-10">
          <MessageCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-light tracking-tight">
            Gabung Grup Mabar Kami!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
            Ingin ikut keseruan tepok bulu Jumat ini? Hubungi kami langsung atau ketuk tombol di bawah untuk bergabung ke grup koordinasi WhatsApp kami.
          </p>
          <div className="pt-2">
            <a
              href="https://chat.whatsapp.com/ExampleDaySmashGroup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold h-11 px-8 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-950/20"
            >
              <WhatsAppIcon className="w-4.5 h-4.5" />
              Gabung Grup WhatsApp Sekarang
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
