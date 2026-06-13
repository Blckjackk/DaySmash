import React, { useState, useEffect } from "react";
import { Player, Match, Recommendation } from "@/lib/types";
import { generateRecommendations } from "@/lib/matchmaker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Sparkles, Play, Plus, RefreshCw, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

interface MatchControlPanelProps {
  players: Player[];
  matches: Match[];
  currentMatchId: number;
  targetMatches: number;
  onAddMatch: (match: Match) => void;
  onSetTargetMatches: (target: number) => void;
}

export default function MatchControlPanel({
  players,
  matches,
  currentMatchId,
  targetMatches,
  onAddMatch,
  onSetTargetMatches,
}: MatchControlPanelProps) {
  const [manualA1, setManualA1] = useState<string>("");
  const [manualA2, setManualA2] = useState<string>("");
  const [manualB1, setManualB1] = useState<string>("");
  const [manualB2, setManualB2] = useState<string>("");

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  // Active players list
  const activePlayers = players.filter((p) => p.active);

  // Clear selections when match ID changes
  useEffect(() => {
    setManualA1("");
    setManualA2("");
    setManualB1("");
    setManualB2("");
    setRecommendations([]);
    setWarnings([]);
    setIsManualOverride(false);
  }, [currentMatchId]);

  // Determine if it's the manual phase (Matches 1, 2, 3)
  const isManualPhase = currentMatchId <= 3;

  // Generate recommendations
  const handleGenerate = () => {
    const { recommendations: recs, warnings: warns } = generateRecommendations(
      players,
      matches,
      currentMatchId,
      targetMatches
    );
    setRecommendations(recs);
    setWarnings(warns);

    if (recs.length === 0 && warns.length > 0) {
      toast.error(warns[0]);
    } else {
      toast.success(`${recs.length} rekomendasi berhasil dihitung.`);
    }
  };

  // Apply a selected recommendation
  const handleSelectRecommendation = (rec: Recommendation) => {
    onAddMatch({
      id: currentMatchId,
      teamA: rec.teamA,
      teamB: rec.teamB,
      isManual: false,
    });
    toast.success(`Pertandingan M${currentMatchId} berhasil ditambahkan!`);
  };

  // Handle manual match submission
  const handleSaveManual = () => {
    if (!manualA1 || !manualA2 || !manualB1 || !manualB2) {
      toast.error("Harap pilih 4 pemain untuk pertandingan ganda.");
      return;
    }

    const uniqueSelected = new Set([manualA1, manualA2, manualB1, manualB2]);
    if (uniqueSelected.size !== 4) {
      toast.error("Pemain tidak boleh sama dalam satu pertandingan.");
      return;
    }

    onAddMatch({
      id: currentMatchId,
      teamA: [manualA1, manualA2],
      teamB: [manualB1, manualB2],
      isManual: true,
    });
    toast.success(`Pertandingan M${currentMatchId} manual berhasil disimpan!`);
  };

  // Helper to get player name by ID
  const getPlayerName = (id: string) => {
    const p = players.find((pl) => pl.id === id);
    return p ? `${p.name} (Lvl ${p.level || "-"})` : "Pemain";
  };

  // Available players for select boxes (excluding already selected ones in other boxes)
  const getAvailablePlayersForSelect = (currentSelectVal: string) => {
    const selected = [manualA1, manualA2, manualB1, manualB2].filter(
      (id) => id && id !== currentSelectVal
    );
    return activePlayers.filter((p) => !selected.includes(p.id));
  };

  const isManualFormValid = manualA1 && manualA2 && manualB1 && manualB2;

  return (
    <Card className="border-emerald-800/20 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
      <CardHeader className="border-b border-slate-800 bg-slate-900/40 py-4 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold tracking-wide text-emerald-400">
              Match Control Panel
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-1">
              {isManualPhase
                ? "Fase awal: Input manual pertandingan M1 s.d M3 berdasarkan kedatangan."
                : `Fase rekomendasi: Generate pertandingan M${currentMatchId} secara otomatis.`}
            </CardDescription>
          </div>
          {/* Target matches selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Target Match:</span>
            <div className="flex bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
              <Button
                variant={targetMatches === 9 ? "default" : "ghost"}
                size="sm"
                onClick={() => onSetTargetMatches(9)}
                className={`h-7 px-2.5 text-xs font-semibold rounded-md ${
                  targetMatches === 9
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                9 Match
              </Button>
              <Button
                variant={targetMatches === 10 ? "default" : "ghost"}
                size="sm"
                onClick={() => onSetTargetMatches(10)}
                className={`h-7 px-2.5 text-xs font-semibold rounded-md ${
                  targetMatches === 10
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                10 Match (Tambahan)
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Warning Alerts */}
        {warnings.length > 0 && (
          <Alert className="bg-amber-950/20 border-amber-800/30 text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider text-amber-400">Pemberitahuan Algoritma</AlertTitle>
            <AlertDescription className="text-xs space-y-1 mt-1 font-medium">
              {warnings.map((w, i) => (
                <div key={i}>• {w}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {currentMatchId > targetMatches ? (
          <div className="text-center py-10 space-y-4">
            <Trophy className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-100">Sesi Mabar Selesai!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Seluruh target pertandingan telah dijadwalkan. Anda dapat melihat statistik akhir pemain di tab Dashboard, mengedit hasil match sebelumnya, atau memulai sesi mabar baru.
            </p>
          </div>
        ) : isManualPhase || isManualOverride ? (
          // MANUAL MATCH UI
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Input Manual Match M{currentMatchId}
              </h3>
              {!isManualPhase && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsManualOverride(false)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 p-0 h-auto"
                >
                  Kembali ke Rekomendasi
                </Button>
              )}
            </div>

            {/* Team Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Team A */}
              <div className="bg-slate-950/35 border border-slate-800/60 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold tracking-wider text-emerald-500 uppercase">TIM A</h4>
                <div className="space-y-2">
                  <Select value={manualA1} onValueChange={setManualA1}>
                    <SelectTrigger className="w-full bg-slate-900 border-slate-800 h-9 text-xs">
                      <SelectValue placeholder="Pilih Pemain 1" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {getAvailablePlayersForSelect(manualA1).map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name} (Lvl {p.level || "-"}) {p.isJoker ? "[Admin]" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={manualA2} onValueChange={setManualA2}>
                    <SelectTrigger className="w-full bg-slate-900 border-slate-800 h-9 text-xs">
                      <SelectValue placeholder="Pilih Pemain 2" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {getAvailablePlayersForSelect(manualA2).map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name} (Lvl {p.level || "-"}) {p.isJoker ? "[Admin]" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Team B */}
              <div className="bg-slate-950/35 border border-slate-800/60 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold tracking-wider text-red-400 uppercase">TIM B</h4>
                <div className="space-y-2">
                  <Select value={manualB1} onValueChange={setManualB1}>
                    <SelectTrigger className="w-full bg-slate-900 border-slate-800 h-9 text-xs">
                      <SelectValue placeholder="Pilih Pemain 1" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {getAvailablePlayersForSelect(manualB1).map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name} (Lvl {p.level || "-"}) {p.isJoker ? "[Admin]" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={manualB2} onValueChange={setManualB2}>
                    <SelectTrigger className="w-full bg-slate-900 border-slate-800 h-9 text-xs">
                      <SelectValue placeholder="Pilih Pemain 2" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {getAvailablePlayersForSelect(manualB2).map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name} (Lvl {p.level || "-"}) {p.isJoker ? "[Admin]" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveManual}
              disabled={!isManualFormValid}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 tracking-wide text-xs"
            >
              <Plus className="w-4 h-4 mr-2" />
              Simpan Pertandingan M{currentMatchId}
            </Button>
          </div>
        ) : (
          // AUTOMATIC RECOMMENDATIONS UI
          <div className="space-y-6">
            {recommendations.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl space-y-4">
                <Sparkles className="w-8 h-8 text-emerald-400/60 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-200">Rekomendasi Belum Dibuat</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {currentMatchId === targetMatches
                      ? "Match berikutnya adalah babak FINAL. Admin akan bermain secara otomatis dengan top performer."
                      : `Tekan tombol di bawah untuk membuat 3 rekomendasi pertandingan M${currentMatchId}.`}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-2 px-6">
                  <Button
                    onClick={handleGenerate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin-slow" />
                    Generate Match M{currentMatchId}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsManualOverride(true)}
                    className="text-xs text-slate-400 hover:text-slate-200 h-9"
                  >
                    Input Manual Saja
                  </Button>
                </div>
              </div>
            ) : (
              // RECOMMENDATIONS LIST
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    3 Rekomendasi Pertandingan Terbaik
                  </h4>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsManualOverride(true)}
                    className="text-xs text-slate-400 hover:text-slate-300 p-0 h-auto"
                  >
                    Override Manual
                  </Button>
                </div>

                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <Card
                      key={rec.id}
                      className="bg-slate-950/45 hover:bg-slate-900/60 border border-slate-800/80 transition-colors duration-150 rounded-xl overflow-hidden group"
                    >
                      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-2 flex-1 w-full">
                          {/* Badge Score */}
                          <div className="flex items-center justify-between md:justify-start gap-3">
                            <Badge className={`text-[10px] font-bold tracking-wider h-5 ${
                              i === 0 
                                ? "bg-emerald-500 hover:bg-emerald-500 text-slate-950" 
                                : i === 1 
                                ? "bg-cyan-500 hover:bg-cyan-500 text-slate-950"
                                : "bg-slate-700 hover:bg-slate-700 text-slate-200"
                            }`}>
                              Rekomendasi {i + 1}
                            </Badge>
                            <span className="text-xs font-bold text-emerald-400 group-hover:scale-105 transition-transform">
                              Skor: {rec.score}
                            </span>
                          </div>

                          {/* Matchup Description */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                            {/* Team A */}
                            <div className="bg-emerald-950/20 border border-emerald-800/20 px-3 py-2 rounded-lg flex-1">
                              <span className="block text-[10px] text-emerald-400 font-bold uppercase mb-1">TIM A</span>
                              <span className="text-slate-100 font-semibold">{getPlayerName(rec.teamA[0])}</span>
                              <span className="text-slate-400 mx-1.5">&</span>
                              <span className="text-slate-100 font-semibold">{getPlayerName(rec.teamA[1])}</span>
                            </div>
                            
                            <span className="text-slate-500 font-bold text-center self-center uppercase text-[10px]">VS</span>

                            {/* Team B */}
                            <div className="bg-slate-900/40 border border-slate-850 px-3 py-2 rounded-lg flex-1">
                              <span className="block text-[10px] text-red-400 font-bold uppercase mb-1">TIM B</span>
                              <span className="text-slate-100 font-semibold">{getPlayerName(rec.teamB[0])}</span>
                              <span className="text-slate-400 mx-1.5">&</span>
                              <span className="text-slate-100 font-semibold">{getPlayerName(rec.teamB[1])}</span>
                            </div>
                          </div>

                          {/* Explanation */}
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 italic font-medium">
                            {rec.explanation}
                          </p>
                        </div>

                        {/* Apply Button */}
                        <Button
                          onClick={() => handleSelectRecommendation(rec)}
                          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-slate-950 group-hover:bg-emerald-500 font-bold px-4 h-9 text-xs transition-all duration-150 whitespace-nowrap self-stretch md:self-center flex items-center justify-center rounded-lg"
                        >
                          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                          Gunakan
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecommendations([])}
                  className="w-full bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300 text-xs h-9"
                >
                  Reset & Hitung Ulang Rekomendasi
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
