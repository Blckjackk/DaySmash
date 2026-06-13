"use client";

import React, { useState, useEffect } from "react";
import { Player, Match } from "@/lib/types";
import PlayerSpreadsheet from "@/components/PlayerSpreadsheet";
import MatchControlPanel from "@/components/MatchControlPanel";
import MatchHistory from "@/components/MatchHistory";
import PlayerStats from "@/components/PlayerStats";
import MatchEditDialog from "@/components/MatchEditDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
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
} from "lucide-react";

// Default initial player list (11 players + 1 Admin Joker)
const DEFAULT_PLAYERS: Player[] = [
  { id: "p1", name: "Fadhil", level: 5, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p2", name: "Rohman", level: 3, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p3", name: "Alvin", level: null, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "Pemain Baru", isJoker: false },
  { id: "p4", name: "Budi", level: 3, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p5", name: "Candra", level: 4, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p6", name: "Dedi", level: 3, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p7", name: "Eko", level: 2, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p8", name: "Feri", level: 3, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p9", name: "Gani", level: 4, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p10", name: "Hadi", level: 3, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p11", name: "Indra", level: 2, active: true, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "", isJoker: false },
  { id: "p12", name: "Admin (Joker)", level: 3, active: false, paidAmount: 12000, paidStatus: false, kokCount: 0, notes: "Admin", isJoker: true },
];

const STORAGE_KEY = "daysmash_badminton_session_v1";

export default function Home() {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [title, setTitle] = useState<string>("");
  const [targetMatches, setTargetMatches] = useState<number>(9);
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Format default title on client side to prevent hydration mismatches and register service worker for PWA
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
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (e) {
      console.error("Failed to save local storage state:", e);
    }
  }, [players, matches, title, targetMatches, isLoaded]);

  // Determine current match ID to generate/input
  const currentMatchId = matches.length + 1;

  // Add/Schedule a new match
  const handleAddMatch = (newMatch: Match) => {
    setMatches((prev) => [...prev, newMatch]);
  };

  // Update player properties (inline editing in spreadsheet)
  const handleUpdatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
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
        // Remove and re-index matches afterwards if needed, but to keep history intact, we can just filter out
        const filtered = prev.filter((m) => m.id !== matchId);
        // Re-align IDs to match array positions so it is sequential
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
  };

  // Reset entire session
  const handleResetSession = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin memulai sesi baru? Semua data pertandingan aktif dan pembayaran akan disetel ulang."
      )
    ) {
      setMatches([]);
      setPlayers(DEFAULT_PLAYERS.map(p => ({
        ...p,
        paidStatus: false,
        kokCount: 0,
        notes: p.isJoker ? "Admin" : ""
      })));
      
      const today = new Date();
      const formattedDate = today.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setTitle(`Mabar ${formattedDate}`);
      toast.success("Sesi baru berhasil dimulai!");
    }
  };

  // Calculate session summary figures
  const totalPlayersActive = players.filter((p) => p.active).length;
  const totalRevenue = players
    .filter((p) => p.paidStatus)
    .reduce((sum, p) => sum + p.paidAmount, 0);
  const totalKoks = players.reduce((sum, p) => sum + p.kokCount, 0);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-white min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-emerald-400">Loading DaySmash...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 min-h-screen font-sans text-slate-100 flex flex-col p-4 sm:p-6 md:p-8 relative">
      
      {/* Background Court Accents */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full bg-emerald-950/5 blur-3xl pointer-events-none" />

      {/* Header Area */}
      <header className="max-w-7xl w-full mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 p-1.5 rounded-xl text-slate-950 shadow-md shadow-emerald-500/10">
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              DaySmash
            </h1>
            <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800/30 text-[10px] font-bold py-0.5 px-2">
              ASISTEN MABAR
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-7 w-48 sm:w-64 bg-transparent hover:bg-slate-900/30 border-transparent hover:border-slate-800 focus:bg-slate-950/80 focus:border-slate-800 text-xs text-slate-300 text-center md:text-left font-medium p-1 transition-all rounded-md"
              placeholder="Nama Sesi Mabar"
            />
          </div>
        </div>

        {/* Action Button: Start New Session */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetSession}
          className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold h-9 rounded-lg"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Mulai Sesi Baru
        </Button>
      </header>

      {/* Session Quick Metrics (Row cards) */}
      <section className="max-w-7xl w-full mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-sm shadow-md">
          <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Aktif (Hadir)</span>
            <span className="text-lg font-black text-slate-200">{totalPlayersActive} / 12</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-sm shadow-md">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Lari Match</span>
            <span className="text-lg font-black text-slate-200">
              {matches.length} / {targetMatches}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-sm shadow-md">
          <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Jumlah KOK</span>
            <span className="text-lg font-black text-slate-200">{totalKoks} Kok</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-sm shadow-md">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Uang Kas Masuk</span>
            <span className="text-lg font-black text-emerald-400">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </section>

      {/* Main Tab Dashboard */}
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col relative z-10">
        <Tabs defaultValue="spreadsheet" className="flex-1 flex flex-col gap-6">
          <div className="flex bg-slate-900/30 p-1 rounded-xl border border-slate-850 w-fit self-center sm:self-start">
            <TabsList className="bg-transparent border-0 gap-1 flex">
              <TabsTrigger
                value="spreadsheet"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 text-xs font-semibold py-1.5 px-3 rounded-lg"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                Spreadsheet
              </TabsTrigger>
              <TabsTrigger
                value="control"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 text-xs font-semibold py-1.5 px-3 rounded-lg"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                Jadwal & Rekomendasi
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 text-xs font-semibold py-1.5 px-3 rounded-lg"
              >
                <History className="w-3.5 h-3.5 mr-1.5" />
                Riwayat Match
                {matches.length > 0 && (
                  <Badge className="bg-slate-800 text-emerald-400 text-[9px] py-0 px-1 ml-1.5 shrink-0 font-bold border border-slate-750">
                    {matches.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 text-xs font-semibold py-1.5 px-3 rounded-lg"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Dashboard Statistik
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="spreadsheet" className="mt-0 flex-1 flex flex-col">
            <PlayerSpreadsheet
              players={players}
              matches={matches}
              onUpdatePlayer={handleUpdatePlayer}
              onImportState={handleImportState}
              title={title}
              onEditMatch={handleEditMatch}
            />
          </TabsContent>

          <TabsContent value="control" className="mt-0">
            <MatchControlPanel
              players={players}
              matches={matches}
              currentMatchId={currentMatchId}
              targetMatches={targetMatches}
              onAddMatch={handleAddMatch}
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

      {/* Footer copyright */}
      <footer className="max-w-7xl w-full mx-auto mt-8 text-center text-[10px] text-slate-600 relative z-10 flex items-center justify-center gap-2">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>DaySmash. Developed for Badminton Double Mabar communities. Client side only, secure & offline ready.</span>
      </footer>

      {/* Edit Match Lineups Modal Overlay */}
      <MatchEditDialog
        matchId={editingMatchId}
        players={players}
        matches={matches}
        onSave={handleSaveEditedMatch}
        onClose={() => setEditingMatchId(null)}
      />

      {/* Sonner Toaster component */}
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
