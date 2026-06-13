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
  Trophy, Users, Zap, CheckCircle2, ChevronRight,
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

  // Active players list
  const activePlayers = players.filter((p) => p.active);

  // Back-to-back constraint
  const prevMatch = matches[matches.length - 1];
  const prevPlayedIds = prevMatch
    ? new Set([...prevMatch.teamA, ...prevMatch.teamB])
    : new Set<string>();

  // Auto-generate recommendations on match transition
  useEffect(() => {
    setManualA1("");
    setManualA2("");
    setManualB1("");
    setManualB2("");
    setIsManualOverride(false);

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
  const remainingMatchCount = targetMatches - currentMatchId + 1;

  // ── Apply single recommendation ──────────────────────────────────────────
  const handleSelectRecommendation = (rec: Recommendation) => {
    onAddMatch({
      id: currentMatchId,
      teamA: rec.teamA,
      teamB: rec.teamB,
      isManual: false,
    });
    toast.success(`✅ Match M${currentMatchId} dijadwalkan!`);
  };

  // ── Generate ALL remaining matches in one click ──────────────────────────
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
        toast.error("Tidak bisa generate — pastikan ada cukup pemain aktif.");
        return;
      }

      onAddMultipleMatches(generatedMatches);

      if (allWarnings.length > 0) {
        toast.warning(`${generatedMatches.length} match digenerate dengan ${allWarnings.length} catatan. Cek riwayat.`);
      } else {
        toast.success(`🎉 ${generatedMatches.length} match (M${currentMatchId}–M${currentMatchId + generatedMatches.length - 1}) digenerate sekaligus!`);
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat generate.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // ── Manual match submission ──────────────────────────────────────────────
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
    return p ? `${p.name} (Lvl ${p.level ?? "-"})` : "Pemain";
  };

  const getPlayerNameShort = (id: string) => {
    const p = players.find((pl) => pl.id === id);
    return p ? p.name : "?";
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
      {/* ── Header Card ───────────────────────────────────────────────────── */}
      <Card className="border-border bg-card shadow-sm">
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
                  : `Fase rekomendasi: Generate M${currentMatchId}–M${targetMatches} otomatis atau satu per satu.`}
              </CardDescription>
            </div>
            {/* Target selector */}
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
          {/* Warning Alerts */}
          {warnings.length > 0 && (
            <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <AlertTitle className="text-xs font-bold uppercase tracking-wider text-yellow-700">
                Pemberitahuan Algoritma
              </AlertTitle>
              <AlertDescription className="text-xs space-y-1 mt-1 font-medium text-yellow-700">
                {warnings.map((w, i) => <div key={i}>• {w}</div>)}
              </AlertDescription>
            </Alert>
          )}

          {/* ── DONE state ─────────────────────────────────────────────────── */}
          {currentMatchId > targetMatches ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Sesi Mabar Selesai! 🎉</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Seluruh {targetMatches} pertandingan telah dijadwalkan. Lihat statistik di tab Dashboard atau mulai sesi baru.
              </p>
            </div>

          ) : isManualPhase || isManualOverride ? (
            /* ── MANUAL INPUT ─────────────────────────────────────────────── */
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
                    ← Kembali ke Rekomendasi
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
                Simpan Pertandingan M{currentMatchId}
              </Button>
            </div>

          ) : (
            /* ── AUTO RECOMMENDATIONS ─────────────────────────────────────── */
            <div className="space-y-5">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl space-y-3">
                  <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Rekomendasi Tidak Tersedia</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      {currentMatchId === targetMatches
                        ? "Match berikutnya adalah babak FINAL. Aktifkan Admin Joker untuk bermain bersama top performer."
                        : "Tidak dapat menghitung rekomendasi. Pastikan ada minimal 4 pemain aktif."}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setIsManualOverride(true)}
                    className="text-xs text-muted-foreground hover:text-foreground h-9"
                  >
                    Input Manual Saja
                  </Button>
                </div>
              ) : (
                <>
                  {/* ── 1-CLICK BEST RECOMMENDATION ─────────────────────── */}
                  <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-sm">
                    {/* Header */}
                    <div className="bg-[#0F172A] px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#84CC16]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                          Rekomendasi Terbaik — M{currentMatchId}
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-[#16A34A]/20 text-[#4ADE80] border border-[#16A34A]/30 px-2.5 py-0.5 rounded-full">
                        Skor {topRec.score}/100
                      </span>
                    </div>

                    {/* Matchup visual */}
                    <div className="bg-[#1E293B] px-5 py-4 grid grid-cols-7 items-center gap-2">
                      {/* Team A */}
                      <div className="col-span-3 text-right space-y-0.5">
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-[#84CC16]">Tim A</span>
                        {topRec.teamA.map((id) => (
                          <div key={id} className="text-sm font-semibold text-[#F8FAFC] truncate">
                            {getPlayerNameShort(id)}
                          </div>
                        ))}
                      </div>

                      {/* VS */}
                      <div className="col-span-1 flex justify-center">
                        <span className="bg-[#0F172A] text-[#94A3B8] text-[10px] font-bold py-1.5 px-3 rounded-full border border-[#1E293B]">
                          VS
                        </span>
                      </div>

                      {/* Team B */}
                      <div className="col-span-3 text-left space-y-0.5">
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-[#F59E0B]">Tim B</span>
                        {topRec.teamB.map((id) => (
                          <div key={id} className="text-sm font-semibold text-[#F8FAFC] truncate">
                            {getPlayerNameShort(id)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation + action */}
                    <div className="bg-[#0F172A] px-5 py-3 space-y-3">
                      <p className="text-[10px] text-[#94A3B8] font-medium">
                        💡 {topRec.explanation}
                      </p>
                      <Button
                        onClick={() => handleSelectRecommendation(topRec)}
                        className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold h-11 text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Jadwalkan M{currentMatchId} — 1 Klik
                      </Button>
                    </div>
                  </div>

                  {/* ── GENERATE ALL REMAINING ──────────────────────────── */}
                  {remainingMatchCount > 1 && (
                    <div className="rounded-2xl border border-[#06B6D4]/20 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#06B6D4]" />
                        <span className="text-sm font-bold text-[#1F2937]">
                          Generate Semua Sekaligus
                        </span>
                        <Badge className="text-[9px] font-bold bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
                          {remainingMatchCount} match
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        Generate M{currentMatchId} s.d. M{targetMatches} sekaligus dalam 1 klik. 
                        Sistem otomatis menyimulasikan rotasi, keseimbangan level, dan aturan tunggu.
                      </p>
                      <Button
                        onClick={handleGenerateAll}
                        disabled={isGeneratingAll}
                        className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-[#F8FAFC] font-bold h-11 text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        {isGeneratingAll
                          ? "Generating..."
                          : `Generate M${currentMatchId}–M${targetMatches} Sekaligus`}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      </Button>
                    </div>
                  )}

                  <Separator className="bg-border" />

                  {/* ── Alternative recommendations 2 & 3 ────────────────── */}
                  {recommendations.length > 1 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                          Pilihan Alternatif
                        </h5>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setIsManualOverride(true)}
                          className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                        >
                          Override Manual
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {recommendations.slice(1).map((rec, i) => (
                          <div
                            key={rec.id}
                            className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge className="text-[9px] font-bold bg-muted text-muted-foreground border-0">
                                  Rek. {i + 2}
                                </Badge>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  Skor {rec.score}
                                </span>
                              </div>
                              <div className="text-xs text-foreground font-medium truncate">
                                {rec.teamA.map(getPlayerNameShort).join(" & ")}
                                <span className="text-muted-foreground mx-1.5">vs</span>
                                {rec.teamB.map(getPlayerNameShort).join(" & ")}
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
                    </div>
                  )}

                  {/* Regenerate */}
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
                    Perbarui Rekomendasi
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
