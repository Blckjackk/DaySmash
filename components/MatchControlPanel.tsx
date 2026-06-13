"use client";
import React, { useState, useEffect } from "react";
import { Player, Match, Recommendation } from "@/lib/types";
import { generateRecommendations, generateAllRemainingMatches } from "@/lib/matchmaker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle, Sparkles, Play, Plus, RefreshCw,
  Trophy, Users, Zap, ChevronRight, ListChecks,
} from "lucide-react";
import { toast } from "sonner";

interface MatchControlPanelProps {
  players: Player[];
  matches: Match[];
  currentMatchId: number;
  targetMatches: number;
  onAddMatch: (match: Match) => void;
  onAddMultipleMatches: (matches: Match[]) => void;
  onSetTargetMatches: (target: number) => void;
}

export default function MatchControlPanel({
  players,
  matches,
  currentMatchId,
  targetMatches,
  onAddMatch,
  onAddMultipleMatches,
  onSetTargetMatches,
}: MatchControlPanelProps) {
  const [manualA1, setManualA1] = useState<string>("");
  const [manualA2, setManualA2] = useState<string>("");
  const [manualB1, setManualB1] = useState<string>("");
  const [manualB2, setManualB2] = useState<string>("");

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  // After generate-all, show result summary
  const [generatedSummary, setGeneratedSummary] = useState<Match[] | null>(null);

  const activePlayers = players.filter((p) => p.active);

  const prevMatch = matches[matches.length - 1];
  const prevPlayedIds = prevMatch
    ? new Set([...prevMatch.teamA, ...prevMatch.teamB])
    : new Set<string>();

  useEffect(() => {
    setManualA1("");
    setManualA2("");
    setManualB1("");
    setManualB2("");
    setIsManualOverride(false);
    setGeneratedSummary(null);

    if (currentMatchId > 3 && currentMatchId <= targetMatches) {
      const { recommendations: recs, warnings: warns } = generateRecommendations(
        players, matches, currentMatchId, targetMatches
      );
      setRecommendations(recs);
      setWarnings(warns);
    } else {
      setRecommendations([]);
      setWarnings([]);
    }
  }, [currentMatchId, players, matches, targetMatches]);

  const isManualPhase = currentMatchId <= 3;
  // How many matches remain from currentMatchId to end (inclusive)
  const remainingCount = targetMatches - currentMatchId + 1;

  // ── Single match ─────────────────────────────────────────────────────────
  const handleSelectRecommendation = (rec: Recommendation) => {
    onAddMatch({
      id: currentMatchId,
      teamA: rec.teamA,
      teamB: rec.teamB,
      isManual: false,
    });
    toast.success(`✅ Match M${currentMatchId} dijadwalkan!`);
  };

  // ── GENERATE ALL M(currentMatchId) → M(targetMatches) in one shot ────────
  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    try {
      const { generatedMatches, allWarnings } = generateAllRemainingMatches(
        players,
        matches,
        currentMatchId,
        targetMatches
      );

      if (generatedMatches.length === 0) {
        toast.error("Tidak bisa generate — pastikan ada minimal 4 pemain aktif.");
        setIsGeneratingAll(false);
        return;
      }

      onAddMultipleMatches(generatedMatches);
      setGeneratedSummary(generatedMatches);

      if (allWarnings.length > 0) {
        toast.warning(`${generatedMatches.length} match digenerate dengan ${allWarnings.length} catatan.`);
      } else {
        toast.success(
          `🎉 ${generatedMatches.length} match sekaligus! M${currentMatchId}–M${currentMatchId + generatedMatches.length - 1} sudah terjadwal!`
        );
      }
    } catch {
      toast.error("Terjadi kesalahan saat generate.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // ── Manual match ──────────────────────────────────────────────────────────
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
    toast.success(`✅ Match M${currentMatchId} disimpan secara manual!`);
  };

  const getPlayerName = (id: string) => {
    const p = players.find((pl) => pl.id === id);
    return p ? `${p.name} (Lvl ${p.level ?? "-"})` : "?";
  };

  const getShortName = (id: string) => {
    const p = players.find((pl) => pl.id === id);
    return p?.name ?? "?";
  };

  const getAvailablePlayersForSelect = (currentSelectVal: string) => {
    const selected = [manualA1, manualA2, manualB1, manualB2].filter(
      (id) => id && id !== currentSelectVal
    );
    return activePlayers.filter(
      (p) => !selected.includes(p.id) && !prevPlayedIds.has(p.id)
    );
  };

  const isManualFormValid = manualA1 && manualA2 && manualB1 && manualB2;
  const topRec = recommendations[0];

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card shadow-sm">
        {/* Header */}
        <CardHeader className="border-b border-border bg-muted/40 py-4 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-serif font-normal tracking-wide text-foreground">
                Match Control Panel
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs mt-0.5">
                {isManualPhase
                  ? `Fase awal: Input manual M1–M3 berdasarkan urutan kedatangan.`
                  : currentMatchId > targetMatches
                  ? "Semua pertandingan telah dijadwalkan."
                  : `Fase otomatis: M${currentMatchId}–M${targetMatches} siap digenerate.`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Target:</span>
              <div className="flex bg-muted p-0.5 rounded-lg border border-border gap-0.5">
                {[9, 10].map((n) => (
                  <Button
                    key={n}
                    variant={targetMatches === n ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onSetTargetMatches(n)}
                    className={`h-7 px-3 text-xs font-semibold rounded-md ${
                      targetMatches === n
                        ? "bg-primary hover:bg-[#15803D] text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n}×
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <AlertTitle className="text-xs font-bold uppercase tracking-wider text-yellow-700">
                Catatan Algoritma
              </AlertTitle>
              <AlertDescription className="text-xs space-y-0.5 mt-1 text-yellow-700">
                {warnings.map((w, i) => <div key={i}>• {w}</div>)}
              </AlertDescription>
            </Alert>
          )}

          {/* ── DONE ──────────────────────────────────────────────────────── */}
          {currentMatchId > targetMatches ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Sesi Mabar Selesai! 🎉</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Semua {targetMatches} match sudah terjadwal. Cek tab Riwayat atau Statistik.
              </p>
            </div>

          ) : isManualPhase || isManualOverride ? (
            /* ── MANUAL INPUT ───────────────────────────────────────────── */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Input Manual — Match M{currentMatchId}
                </h3>
                {!isManualPhase && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsManualOverride(false)}
                    className="text-xs text-primary hover:text-[#15803D] p-0 h-auto"
                  >
                    ← Kembali ke Generate
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team A */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold tracking-wider text-green-700 uppercase">Tim A</h4>
                  <div className="space-y-2">
                    {([manualA1, manualA2] as [string, string]).map((val, vi) => {
                      const setter = vi === 0 ? setManualA1 : setManualA2;
                      return (
                        <Select key={vi} value={val} onValueChange={setter}>
                          <SelectTrigger className="w-full bg-white border-green-200 h-9 text-xs text-foreground">
                            <SelectValue placeholder={`Pilih Pemain ${vi + 1}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-border text-foreground">
                            {getAvailablePlayersForSelect(val).map((p) => (
                              <SelectItem key={p.id} value={p.id} className="text-xs">
                                {p.name} (Lvl {p.level ?? "-"}) {p.isJoker ? "[Admin]" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    })}
                  </div>
                </div>

                {/* Team B */}
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold tracking-wider text-red-600 uppercase">Tim B</h4>
                  <div className="space-y-2">
                    {([manualB1, manualB2] as [string, string]).map((val, vi) => {
                      const setter = vi === 0 ? setManualB1 : setManualB2;
                      return (
                        <Select key={vi} value={val} onValueChange={setter}>
                          <SelectTrigger className="w-full bg-white border-red-200 h-9 text-xs text-foreground">
                            <SelectValue placeholder={`Pilih Pemain ${vi + 1}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-border text-foreground">
                            {getAvailablePlayersForSelect(val).map((p) => (
                              <SelectItem key={p.id} value={p.id} className="text-xs">
                                {p.name} (Lvl {p.level ?? "-"}) {p.isJoker ? "[Admin]" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveManual}
                disabled={!isManualFormValid}
                className="w-full bg-primary hover:bg-[#15803D] text-white font-bold h-11 tracking-wide text-xs rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Simpan Match M{currentMatchId}
              </Button>
            </div>

          ) : recommendations.length === 0 ? (
            /* ── NO RECS ───────────────────────────────────────────────── */
            <div className="text-center py-8 border border-dashed border-border rounded-xl space-y-3">
              <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">Rekomendasi Tidak Tersedia</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {currentMatchId === targetMatches
                  ? "Match final — aktifkan Admin Joker untuk bermain bersama top performer."
                  : "Pastikan ada minimal 4 pemain aktif di spreadsheet."}
              </p>
              <Button
                variant="ghost"
                onClick={() => setIsManualOverride(true)}
                className="text-xs text-muted-foreground hover:text-foreground h-9"
              >
                Input Manual Saja
              </Button>
            </div>

          ) : (
            /* ── AUTO PHASE: GENERATE ALL IS THE HERO ACTION ─────────── */
            <div className="space-y-4">

              {/* ═══════════════════════════════════════════════════════════
                  STEP 1 — GENERATE ALL (primary hero action)
                  Shown whenever there are 2+ matches to go
              ═══════════════════════════════════════════════════════════ */}
              {remainingCount >= 1 && (
                <div className="rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md">
                  {/* Dark navy top bar */}
                  <div className="bg-[#0F172A] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-[#84CC16]" />
                      <div>
                        <span className="text-sm font-bold text-[#F8FAFC]">
                          Generate Semua Sekaligus
                        </span>
                        <span className="ml-2 text-[10px] font-bold bg-[#16A34A]/20 text-[#4ADE80] border border-[#16A34A]/30 px-2 py-0.5 rounded-full">
                          M{currentMatchId} → M{targetMatches}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-white/10 text-[#94A3B8] border-0 text-[10px]">
                      {remainingCount} match
                    </Badge>
                  </div>

                  {/* Body */}
                  <div className="bg-[#1E293B] px-5 py-4 space-y-2">
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                      Sistem akan otomatis generate <strong className="text-[#F8FAFC]">semua {remainingCount} pertandingan</strong> sekaligus
                      berdasarkan keseimbangan level, rotasi pemain, dan aturan tunggu — tanpa perlu pencet berkali-kali.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Array.from({ length: remainingCount }, (_, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-bold bg-[#16A34A]/15 text-[#4ADE80] border border-[#16A34A]/25 px-2 py-0.5 rounded-full"
                        >
                          M{currentMatchId + i}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="bg-[#0F172A] px-5 pb-5 pt-1">
                    <Button
                      onClick={handleGenerateAll}
                      disabled={isGeneratingAll}
                      className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-black h-14 text-sm tracking-widest uppercase rounded-xl shadow-lg shadow-green-900/30 flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                      {isGeneratingAll ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating semua match...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 fill-current" />
                          1 KLIK → Generate M{currentMatchId}–M{targetMatches} Semua!
                          <ChevronRight className="w-5 h-5 ml-auto" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Separator className="flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap">
                  atau jadwalkan satu per satu
                </span>
                <Separator className="flex-1 bg-border" />
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  STEP 2 — Single next match recommendation (secondary)
              ═══════════════════════════════════════════════════════════ */}
              {topRec && (
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                  {/* Header */}
                  <div className="bg-muted/60 px-4 py-2.5 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Rekomendasi Terbaik — M{currentMatchId} saja
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Skor {topRec.score}/100
                    </span>
                  </div>

                  {/* Matchup */}
                  <div className="bg-card px-4 py-3 grid grid-cols-7 items-center gap-2">
                    <div className="col-span-3 text-right space-y-0.5">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-primary">Tim A</span>
                      {topRec.teamA.map((id) => (
                        <div key={id} className="text-sm font-semibold text-foreground truncate">{getShortName(id)}</div>
                      ))}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <span className="bg-muted text-muted-foreground text-[10px] font-bold py-1.5 px-2.5 rounded-full border border-border">VS</span>
                    </div>
                    <div className="col-span-3 text-left space-y-0.5">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#F59E0B]">Tim B</span>
                      {topRec.teamB.map((id) => (
                        <div key={id} className="text-sm font-semibold text-foreground truncate">{getShortName(id)}</div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-muted/30 px-4 py-3 space-y-2 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">💡 {topRec.explanation}</p>
                    <Button
                      onClick={() => handleSelectRecommendation(topRec)}
                      className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold h-9 text-xs tracking-wider uppercase rounded-lg flex items-center justify-center gap-2"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Jadwalkan M{currentMatchId} Saja
                    </Button>
                  </div>
                </div>
              )}

              {/* Alternatives + override */}
              {recommendations.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Alternatif Lain
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsManualOverride(true)}
                      className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                    >
                      Override Manual
                    </Button>
                  </div>

                  {recommendations.slice(1).map((rec, i) => (
                    <div
                      key={rec.id}
                      className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge className="text-[9px] font-bold bg-muted text-muted-foreground border-0">
                            Rek. {i + 2}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground">Skor {rec.score}</span>
                        </div>
                        <div className="text-xs text-foreground font-medium truncate">
                          {rec.teamA.map(getShortName).join(" & ")}
                          <span className="text-muted-foreground mx-1.5">vs</span>
                          {rec.teamB.map(getShortName).join(" & ")}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{rec.explanation}</p>
                      </div>
                      <Button
                        onClick={() => handleSelectRecommendation(rec)}
                        size="sm"
                        className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary border-0 font-bold px-3 h-8 text-[11px] rounded-lg"
                      >
                        Pakai
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const { recommendations: recs, warnings: warns } = generateRecommendations(
                    players, matches, currentMatchId, targetMatches
                  );
                  setRecommendations(recs);
                  setWarnings(warns);
                  toast.success("Rekomendasi diperbarui!");
                }}
                className="w-full border-border text-muted-foreground text-xs h-9 flex items-center justify-center gap-1.5 hover:bg-muted"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Rekomendasi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
