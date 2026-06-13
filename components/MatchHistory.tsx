import React, { useState } from "react";
import { Player, Match } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Save, Calendar, Check } from "lucide-react";
import { toast } from "sonner";

interface MatchHistoryProps {
  players: Player[];
  matches: Match[];
  onUpdateMatchScore: (matchId: number, scoreA: number, scoreB: number) => void;
  onDeleteMatch: (matchId: number) => void;
  onEditMatch: (matchId: number) => void;
}

export default function MatchHistory({
  players,
  matches,
  onUpdateMatchScore,
  onDeleteMatch,
  onEditMatch,
}: MatchHistoryProps) {
  const [editingScores, setEditingScores] = useState<Record<number, { scoreA: string; scoreB: string }>>({});

  // Get player name by ID
  const getPlayerName = (id: string) => {
    const p = players.find((pl) => pl.id === id);
    return p ? p.name : "Pemain";
  };

  // Get player level by ID
  const getPlayerLevel = (id: string) => {
    const p = players.find((pl) => pl.id === id);
    return p && p.level !== null ? `(Lvl ${p.level})` : "";
  };

  // Init score editing state
  const startEditingScore = (matchId: number, currentScoreA?: number, currentScoreB?: number) => {
    setEditingScores((prev) => ({
      ...prev,
      [matchId]: {
        scoreA: currentScoreA !== undefined ? currentScoreA.toString() : "",
        scoreB: currentScoreB !== undefined ? currentScoreB.toString() : "",
      },
    }));
  };

  // Save edited score
  const handleSaveScore = (matchId: number) => {
    const editState = editingScores[matchId];
    if (!editState) return;

    const sA = parseInt(editState.scoreA, 10);
    const sB = parseInt(editState.scoreB, 10);

    if (isNaN(sA) || sNaN(sB)) {
      toast.error("Harap masukkan skor yang valid (angka).");
      return;
    }

    onUpdateMatchScore(matchId, sA, sB);
    setEditingScores((prev) => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
    toast.success(`Skor Match M${matchId} disimpan: ${sA} - ${sB}`);
  };

  const sNaN = (num: number) => Number.isNaN(num);

  if (matches.length === 0) {
    return (
      <Card className="border-emerald-800/20 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
        <CardContent className="p-6 text-center py-10">
          <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-slate-300">Belum Ada Riwayat Pertandingan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Pertandingan yang dijadwalkan akan muncul di sini. Admin dapat mencatat skor hasil mabar.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sorted list of matches
  const sortedMatches = [...matches].sort((a, b) => a.id - b.id);

  return (
    <Card className="border-emerald-800/20 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
      <CardHeader className="border-b border-slate-800 bg-slate-900/40 py-4 px-6">
        <CardTitle className="text-lg font-serif font-light tracking-wide text-emerald-400">
          Riwayat Pertandingan
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs mt-1">
          Keterangan: M1–M3 adalah pertandingan manual awal. M4 dst direkomendasikan sistem.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto pr-2">
        {sortedMatches.map((m) => {
          const isEditing = editingScores[m.id] !== undefined;
          const editState = editingScores[m.id];
          const hasScore = m.scoreA !== undefined && m.scoreB !== undefined;
          
          // Determine winner
          const teamAWon = hasScore && m.scoreA! > m.scoreB!;
          const teamBWon = hasScore && m.scoreB! > m.scoreA!;

          // Map Match ID to alphabet representation (Match F, G, H, J...)
          // M1 = Match F, M2 = Match G, M3 = Match H, M4 = Match J, etc.
          const getMatchLabel = (id: number) => {
            const labels = ["F", "G", "H", "J", "K", "L", "M", "N", "O", "P"];
            return labels[id - 1] || `${id}`;
          };

          return (
            <div key={m.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Match Indicator */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex flex-col items-center justify-center bg-slate-800 border border-slate-700/60 w-11 h-11 rounded-xl shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 leading-none uppercase">Match</span>
                  <span className="text-sm font-bold text-emerald-400 leading-none mt-1">{getMatchLabel(m.id)}</span>
                </div>
                <div className="flex-1">
                  <span className="text-slate-500 font-semibold text-[10px] block">
                    {m.isManual ? "MANUAL INPUT" : "ALGORITHM GENERATED"} (M{m.id})
                  </span>
                  <div className="text-slate-300 text-xs font-semibold mt-0.5">
                    {m.teamA.map((id) => getPlayerName(id)).join(" + ")}
                    <span className="text-slate-500 font-normal mx-2">vs</span>
                    {m.teamB.map((id) => getPlayerName(id)).join(" + ")}
                  </div>
                </div>
              </div>

              {/* Match Action & Score input */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {isEditing ? (
                  // SCORE INPUT FIELDS
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editState.scoreA}
                      onChange={(e) =>
                        setEditingScores((prev) => ({
                          ...prev,
                          [m.id]: { ...prev[m.id], scoreA: e.target.value },
                        }))
                      }
                      placeholder="TIM A"
                      className="w-14 h-8 text-center bg-slate-950/60 border-slate-800 text-xs font-bold text-emerald-400"
                    />
                    <span className="text-slate-500 font-bold">:</span>
                    <Input
                      type="number"
                      value={editState.scoreB}
                      onChange={(e) =>
                        setEditingScores((prev) => ({
                          ...prev,
                          [m.id]: { ...prev[m.id], scoreB: e.target.value },
                        }))
                      }
                      placeholder="TIM B"
                      className="w-14 h-8 text-center bg-slate-950/60 border-slate-800 text-xs font-bold text-red-400"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveScore(m.id)}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold px-2 rounded-lg"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  // SCORE DISPLAY OR INPUT BUTTON
                  <div className="flex items-center gap-3">
                    {hasScore ? (
                      <div className="flex items-center gap-1.5 bg-slate-950/50 border border-slate-800/80 py-1 px-2.5 rounded-lg text-xs">
                        <span className={`font-bold ${teamAWon ? "text-emerald-400" : "text-slate-400"}`}>
                          {m.scoreA}
                        </span>
                        <span className="text-slate-600 font-bold">:</span>
                        <span className={`font-bold ${teamBWon ? "text-red-400" : "text-slate-400"}`}>
                          {m.scoreB}
                        </span>
                        {teamAWon && <Check className="w-3 h-3 text-emerald-400 ml-1 shrink-0" />}
                        {teamBWon && <Check className="w-3 h-3 text-red-400 ml-1 shrink-0" />}
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingScore(m.id)}
                        className="h-7 text-[10px] bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-800 px-2 rounded-lg"
                      >
                        Input Skor
                      </Button>
                    )}

                    {hasScore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingScore(m.id, m.scoreA, m.scoreB)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                        title="Edit Skor"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                )}

                {/* EDIT/DELETE MATCH */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditMatch(m.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                    title="Edit Susunan Pemain"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteMatch(m.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                    title="Hapus Match"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
