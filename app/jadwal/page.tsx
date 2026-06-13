"use client";

import React, { useState, useEffect } from "react";
import { Player, Match } from "@/lib/types";
import PlayerSpreadsheet from "@/components/PlayerSpreadsheet";
import MatchControlPanel from "@/components/MatchControlPanel";
import MatchHistory from "@/components/MatchHistory";
import PlayerStats from "@/components/PlayerStats";
import MatchEditDialog from "@/components/MatchEditDialog";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Trophy,
  Users,
  Layers,
  FileSpreadsheet,
  History,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Plus,
} from "lucide-react";

const STORAGE_KEY = "daysmash_badminton_session_v1";

// Helper to generate empty players array for setup
const createInitialSetupPlayers = (): { name: string; level: string }[] => {
  return Array.from({ length: 11 }, () => ({ name: "", level: "null" }));
};

export default function JadwalPage() {
  const [setupPlayers, setSetupPlayers] = useState<{ name: string; level: string }[]>(createInitialSetupPlayers());
  const [jokerActive, setJokerActive] = useState<boolean>(false);
  const [jokerLevel, setJokerLevel] = useState<string>("3");
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [title, setTitle] = useState<string>("");
  const [targetMatches, setTargetMatches] = useState<number>(9);
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Set default title on client mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setTitle(`Mabar ${formattedDate}`);

    // Register PWA service worker
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("DaySmash PWA ServiceWorker registered. Scope: ", reg.scope))
          .catch((err) => console.log("DaySmash PWA ServiceWorker registration failed: ", err));
      });
    }
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.players && Array.isArray(parsed.players)) {
          setPlayers(parsed.players);
        }
        if (parsed.matches && Array.isArray(parsed.matches)) {
          setMatches(parsed.matches);
        }
        if (parsed.title) {
          setTitle(parsed.title);
        }
        if (parsed.targetMatches) {
          setTargetMatches(parsed.targetMatches);
        }
        if (parsed.isSetupComplete !== undefined) {
          setIsSetupComplete(parsed.isSetupComplete);
        }
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage when values change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToStore = {
        players,
        matches,
        title,
        targetMatches,
        isSetupComplete,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (e) {
      console.error("Failed to save local storage state:", e);
    }
  }, [players, matches, title, targetMatches, isSetupComplete, isLoaded]);

  // Handle player update during setup form
  const handleSetupPlayerChange = (idx: number, field: "name" | "level", val: string) => {
    setSetupPlayers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  // Submit setup and build players list
  const handleStartMabar = () => {
    const filledPlayers = setupPlayers.filter((p) => p.name.trim() !== "");
    
    if (filledPlayers.length < 4) {
      toast.error("Harap masukkan minimal 4 nama pemain aktif untuk memulai pertandingan.");
      return;
    }

    // Build standard list
    const playerList: Player[] = setupPlayers.map((p, idx) => {
      const name = p.name.trim();
      return {
        id: `p${idx + 1}`,
        name: name || `Pemain ${idx + 1}`,
        level: p.level === "null" ? null : parseInt(p.level, 10),
        active: name !== "", // Active only if a name is input
        paidAmount: 12000,
        paidStatus: false,
        kokCount: 0,
        notes: name === "" ? "Kosong" : "",
        isJoker: false,
      };
    });

    // Add Admin Joker player
    playerList.push({
      id: "p12",
      name: "Admin (Joker)",
      level: jokerLevel === "null" ? null : parseInt(jokerLevel, 10),
      active: jokerActive,
      paidAmount: 12000,
      paidStatus: false,
      kokCount: 0,
      notes: "Admin",
      isJoker: true,
    });

    setPlayers(playerList);
    setIsSetupComplete(true);
    toast.success("Sesi Mabar berhasil disetup!");
  };

  // Schedule a new match
  const handleAddMatch = (newMatch: Match) => {
    setMatches((prev) => [...prev, { ...newMatch, kokCount: newMatch.kokCount ?? 0 }]);
  };

  // Schedule multiple matches at once (generate-all)
  const handleAddMultipleMatches = (newMatches: Match[]) => {
    setMatches((prev) => {
      const startId = prev.length + 1;
      const renumbered = newMatches.map((m, i) => ({ ...m, id: startId + i, kokCount: m.kokCount ?? 0 }));
      return [...prev, ...renumbered];
    });
  };

  // Update kok count for a specific match (shared across all 4 players in that match)
  const handleUpdateMatchKok = (matchId: number, kokCount: number) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, kokCount } : m))
    );
  };

  // Update player properties (inline editing in spreadsheet)
  const handleUpdatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Delete player from listing (only standard players who haven't played)
  const handleDeletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  // Update match score in history
  const handleUpdateMatchScore = (matchId: number, scoreA: number, scoreB: number) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, scoreA, scoreB } : m))
    );
  };

  // Delete a match from history
  const handleDeleteMatch = (matchId: number) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Match M${matchId}?`)) {
      setMatches((prev) => {
        const filtered = prev.filter((m) => m.id !== matchId);
        return filtered.map((m, idx) => ({ ...m, id: idx + 1 }));
      });
      toast.info(`Match M${matchId} dihapus. Riwayat diatur ulang.`);
    }
  };

  // Edit match lineup
  const handleEditMatch = (matchId: number) => {
    setEditingMatchId(matchId);
  };

  // Save changes from edit dialog
  const handleSaveEditedMatch = (matchId: number, teamA: string[], teamB: string[]) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, teamA, teamB } : m))
    );
  };

  // Import full state (from JSON import)
  const handleImportState = (imported: { players: Player[]; matches: Match[]; title: string }) => {
    setPlayers(imported.players);
    setMatches(imported.matches);
    setTitle(imported.title);
    setIsSetupComplete(true);
  };

  // Reset entire session
  const handleResetSession = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin memulai sesi baru? Semua data pertandingan aktif dan daftar nama akan disetel ulang."
      )
    ) {
      // Explicitly clear localStorage so stale data doesn't reload on refresh
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      
      setMatches([]);
      setPlayers([]);
      setSetupPlayers(createInitialSetupPlayers());
      setJokerActive(false);
      setJokerLevel("3");
      setIsSetupComplete(false);
      
      const today = new Date();
      const formattedDate = today.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setTitle(`Mabar ${formattedDate}`);
      toast.success("Sesi disetel ulang ke tahap setup awal!");
    }
  };

  // Add late-joining player
  const handleAddLatePlayer = (name: string, level: number | null) => {
    const activeStandardPlayers = players.filter((p) => !p.isJoker);
    const nextIdx = activeStandardPlayers.length + 1;
    const newId = `p_late_${Date.now()}`;
    const newPlayer: Player = {
      id: newId,
      name: name.trim() || `Pemain ${nextIdx}`,
      level: level,
      active: true,
      paidAmount: 12000,
      paidStatus: false,
      kokCount: 0,
      notes: "Late Joiner",
      isJoker: false,
    };

    // Insert before the Admin Joker
    setPlayers((prev) => {
      const standard = prev.filter((p) => !p.isJoker);
      const joker = prev.filter((p) => p.isJoker);
      return [...standard, newPlayer, ...joker];
    });
    toast.success(`${newPlayer.name} berhasil ditambahkan!`);
  };

  const handleImportStateData = (imported: { players: Player[]; matches: Match[]; title: string }) => {
    handleImportState(imported);
  };

  const currentMatchId = matches.length + 1;
  const totalPlayersActive = players.filter((p) => p.active).length;
  // Total kok = sum of all match kokCounts (each match uses some shuttlecocks)
  const totalKoks = matches.reduce((sum, m) => sum + (m.kokCount ?? 0), 0);
  // Total revenue = sum of all players' paidAmount + their share of kok cost
  const totalRevenue = players
    .filter((p) => p.paidStatus)
    .reduce((sum, p) => {
      const playerKok = matches
        .filter((m) => m.teamA.includes(p.id) || m.teamB.includes(p.id))
        .reduce((ks, m) => ks + (m.kokCount ?? 0), 0);
      return sum + p.paidAmount + playerKok * 2000;
    }, 0);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-primary">Loading DaySmash...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen font-sans text-foreground flex flex-col p-4 sm:p-6 md:p-8 relative">
      {/* Top court green ambient stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 pointer-events-none" />
      <div className="absolute top-1 left-0 right-0 h-[200px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      {/* Top Global Navigation Bar */}
      <nav className="max-w-4xl w-full mx-auto mb-6 bg-card border border-border p-2 rounded-2xl flex items-center justify-between shadow-sm relative z-20">
        <div className="flex items-center gap-2.5 pl-2">
          <div className="bg-muted p-0.5 rounded-xl border border-border flex items-center justify-center overflow-hidden w-8 h-8 shadow-sm">
            <img src="/daysmash.webp" alt="DaySmash" className="w-full h-full object-contain rounded-lg" />
          </div>
          <span className="text-base font-serif font-light text-foreground tracking-tight">DaySmash</span>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
          <Link
            href="/jadwal"
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white shadow-sm font-bold"
          >
            Penjadwalan
          </Link>
          <Link
            href="/"
            className="px-4 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-foreground transition-all"
          >
            Profil Komunitas
          </Link>
        </div>
      </nav>

      {!isSetupComplete ? (
        // SETUP SCREEN (INPUT PLAYERS FROM SCRATCH)
        <main className="max-w-4xl w-full mx-auto my-auto py-8 space-y-8 relative z-10">
          <div className="text-center space-y-3">
            <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit mx-auto text-primary text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
              <img src="/daysmash.webp" alt="DaySmash" className="w-4.5 h-4.5 object-contain rounded-full" />
              DaySmash Scheduler
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight font-light">
              Setup Sesi Mabar
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Mulai mabar dengan memasukkan nama pemain reguler terlebih dahulu. Tingkat level dapat disesuaikan kapan saja.
            </p>
          </div>

          {/* Quick Tutorial Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary m-0">
                Panduan Penggunaan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs text-muted-foreground grid grid-cols-1 md:grid-cols-3 gap-4 font-medium">
              <div className="space-y-1">
                <span className="text-primary font-bold block text-sm">1. Input Nama</span>
                <p>Ketik nama 11 pemain reguler. Kosongkan baris jika belum datang. Kosongkan tingkat level jika belum diketahui.</p>
              </div>
              <div className="space-y-1">
                <span className="text-primary font-bold block text-sm">2. Tentukan 3 Awal</span>
                <p>Input manual susunan Match M1, M2, dan M3 di tab <em>Jadwal</em> berdasarkan antrean kedatangan di lapangan.</p>
              </div>
              <div className="space-y-1">
                <span className="text-primary font-bold block text-sm">3. Generate Otomatis</span>
                <p>Untuk Match M4–M9/M10, sistem merekomendasikan kombinasi match seimbang (level A+B ≈ C+D). Admin bermain di match akhir.</p>
              </div>
            </CardContent>
          </Card>

          {/* Input Grid Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="py-4 px-6 border-b border-border">
              <CardTitle className="text-sm font-bold tracking-wide text-foreground uppercase">
                Daftar Nama Pemain Reguler (11 Orang)
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Minimal masukkan 4 nama pemain aktif untuk memulai.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {setupPlayers.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-muted/60 p-2.5 rounded-xl border border-border focus-within:border-primary/40 transition-colors"
                  >
                    <span className="text-muted-foreground text-xs font-bold w-5 text-right">
                      #{idx + 1}
                    </span>
                    <Input
                      value={p.name}
                      onChange={(e) => handleSetupPlayerChange(idx, "name", e.target.value)}
                      placeholder={`Nama Pemain`}
                      className="h-8 bg-transparent border-0 text-xs text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 px-1 py-1 placeholder:text-muted-foreground/50"
                    />
                    <Select
                      value={p.level}
                      onValueChange={(val) => handleSetupPlayerChange(idx, "level", val)}
                    >
                      <SelectTrigger className="w-16 h-7 bg-background border-border text-[10px] text-foreground">
                        <SelectValue placeholder="Lvl" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="null" className="text-[10px]">Lvl -</SelectItem>
                        <SelectItem value="1" className="text-[10px]">Lvl 1</SelectItem>
                        <SelectItem value="2" className="text-[10px]">Lvl 2</SelectItem>
                        <SelectItem value="3" className="text-[10px]">Lvl 3</SelectItem>
                        <SelectItem value="4" className="text-[10px]">Lvl 4</SelectItem>
                        <SelectItem value="5" className="text-[10px]">Lvl 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <Separator className="bg-border" />

              {/* Joker / Admin Activation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5 border border-primary/15 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="joker-toggle"
                    checked={jokerActive}
                    onCheckedChange={(checked) => setJokerActive(!!checked)}
                    className="border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div>
                    <label
                      htmlFor="joker-toggle"
                      className="text-xs font-bold text-foreground cursor-pointer block"
                    >
                      Aktifkan Pemain Admin / Joker (Pemain ke-12)
                    </label>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Admin hanya akan dijadwalkan di pertandingan terakhir mabar bersama top performer.
                    </span>
                  </div>
                </div>
                {jokerActive && (
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs text-muted-foreground font-medium">Level Admin:</span>
                    <Select value={jokerLevel} onValueChange={setJokerLevel}>
                      <SelectTrigger className="w-16 h-7 bg-background border-border text-[10px]">
                        <SelectValue placeholder="Lvl" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="1" className="text-[10px]">Lvl 1</SelectItem>
                        <SelectItem value="2" className="text-[10px]">Lvl 2</SelectItem>
                        <SelectItem value="3" className="text-[10px]">Lvl 3</SelectItem>
                        <SelectItem value="4" className="text-[10px]">Lvl 4</SelectItem>
                        <SelectItem value="5" className="text-[10px]">Lvl 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartMabar}
                className="w-full bg-primary hover:bg-[#15803D] text-white font-bold h-11 rounded-xl text-xs tracking-wider uppercase group"
              >
                Mulai Mabar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </main>
      ) : (
        // DASHBOARD WORKSPACE (SETUP COMPLETE)
        <>
          {/* Header Area */}
          <header className="max-w-7xl w-full mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
              <div className="flex items-center gap-2.5">
                <div className="bg-muted p-0.5 rounded-xl border border-border flex items-center justify-center overflow-hidden w-9 h-9 shadow-sm">
                  <img src="/daysmash.webp" alt="DaySmash" className="w-full h-full object-contain rounded-lg" />
                </div>
                <h1 className="text-2xl font-serif text-foreground tracking-tight font-light">
                  DaySmash
                </h1>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold py-0.5 px-2">
                  DASHBOARD
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-7 w-48 sm:w-64 bg-transparent hover:bg-muted/60 border-transparent hover:border-border focus:bg-card focus:border-border text-xs text-foreground text-center md:text-left font-medium p-1 transition-all rounded-md"
                  placeholder="Nama Sesi Mabar"
                />
              </div>
            </div>

            {/* Reset / New Session Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSession}
              className="bg-card border-border hover:bg-muted text-muted-foreground text-xs font-semibold h-9 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Mulai Sesi Baru
            </Button>
          </header>

          {/* Quick Metrics Row */}
          <section className="max-w-7xl w-full mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {[
              { icon: <Users className="w-5 h-5" />, color: "bg-blue-500/10 text-blue-600", label: "Pemain Aktif", value: `${totalPlayersActive} Orang` },
              { icon: <TrendingUp className="w-5 h-5" />, color: "bg-primary/10 text-primary", label: "Progress Match", value: `${matches.length} / ${targetMatches}` },
              { icon: <Sparkles className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-600", label: "Kok Digunakan", value: `${totalKoks} Kok` },
              { icon: <DollarSign className="w-5 h-5" />, color: "bg-primary/10 text-primary", label: "Uang Kas", value: `Rp ${totalRevenue.toLocaleString("id-ID")}` },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className={`${item.color} p-2.5 rounded-xl`}>{item.icon}</div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">{item.label}</span>
                  <span className="text-base font-bold text-foreground">{item.value}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Main Tab Area */}
          <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col relative z-10">
            <Tabs defaultValue="spreadsheet" className="flex-1 flex flex-col gap-6">
              <div className="flex bg-muted/80 p-1 rounded-xl border border-border w-fit self-center sm:self-start">
                <TabsList className="bg-transparent border-0 gap-0.5 flex">
                  <TabsTrigger
                    value="spreadsheet"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground text-xs font-bold py-1.5 px-3 rounded-lg"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                    Spreadsheet
                  </TabsTrigger>
                  <TabsTrigger
                    value="control"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground text-xs font-bold py-1.5 px-3 rounded-lg"
                  >
                    <Layers className="w-3.5 h-3.5 mr-1.5" />
                    Jadwal &amp; Rekomendasi
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground text-xs font-bold py-1.5 px-3 rounded-lg"
                  >
                    <History className="w-3.5 h-3.5 mr-1.5" />
                    Riwayat Match
                    {matches.length > 0 && (
                      <Badge className="bg-primary/15 text-primary text-[9px] py-0 px-1 ml-1.5 font-bold border-0">
                        {matches.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground text-xs font-bold py-1.5 px-3 rounded-lg"
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Statistik &amp; Rotasi
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Contents */}
              <TabsContent value="spreadsheet" className="mt-0 flex-1 flex flex-col gap-4">
                {/* Late Join Player form block */}
                <Card className="border-border bg-card shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-xs font-bold block text-foreground">Ada pemain terlambat datang?</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Tambahkan pemain baru kapan saja ke daftar antrean.</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const name = prompt("Masukkan nama pemain baru:");
                      if (name && name.trim()) {
                        const lvlStr = prompt("Masukkan level pemain (1-5, atau biarkan kosong):");
                        const level = lvlStr ? parseInt(lvlStr, 10) || null : null;
                        handleAddLatePlayer(name, level);
                      }
                    }}
                    size="sm"
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold"
                  >
                    Tambah Pemain Baru
                  </Button>
                </Card>

                <PlayerSpreadsheet
                  players={players}
                  matches={matches}
                  onUpdatePlayer={handleUpdatePlayer}
                  onUpdateMatchKok={handleUpdateMatchKok}
                  onImportState={handleImportStateData}
                  title={title}
                  onEditMatch={handleEditMatch}
                  onDeletePlayer={handleDeletePlayer}
                />
              </TabsContent>

              <TabsContent value="control" className="mt-0">
                <MatchControlPanel
                  players={players}
                  matches={matches}
                  currentMatchId={currentMatchId}
                  targetMatches={targetMatches}
                  onAddMatch={handleAddMatch}
                  onAddMultipleMatches={handleAddMultipleMatches}
                  onSetTargetMatches={setTargetMatches}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <MatchHistory
                  players={players}
                  matches={matches}
                  onUpdateMatchScore={handleUpdateMatchScore}
                  onDeleteMatch={handleDeleteMatch}
                  onEditMatch={handleEditMatch}
                />
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <PlayerStats players={players} matches={matches} currentMatchId={currentMatchId} />
              </TabsContent>
            </Tabs>
          </main>
        </>
      )}

      {/* Footer copyright */}
      <footer className="max-w-7xl w-full mx-auto mt-8 text-center text-[10px] text-muted-foreground/50 relative z-10 flex items-center justify-center gap-2">
        <CheckCircle2 className="w-3 h-3 text-primary/50" />
        <span>DaySmash. Developed for Badminton Double Mabar communities. Client side only, secure &amp; offline ready.</span>
      </footer>

      {/* Edit Match Lineup Modal */}
      <MatchEditDialog
        matchId={editingMatchId}
        players={players}
        matches={matches}
        onSave={handleSaveEditedMatch}
        onClose={() => setEditingMatchId(null)}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
