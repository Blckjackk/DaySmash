import React from "react";
import { Player, Match } from "@/lib/types";
import { calculatePlayerStats } from "@/lib/matchmaker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Shield, User, Clock, HeartHandshake } from "lucide-react";

interface PlayerStatsProps {
  players: Player[];
  matches: Match[];
  currentMatchId: number;
}

export default function PlayerStats({ players, matches, currentMatchId }: PlayerStatsProps) {
  const stats = calculatePlayerStats(players, matches, currentMatchId);

  // Helper to map wait duration to status badge
  const renderWaitBadge = (wait: number, active: boolean) => {
    if (!active) {
      return <Badge variant="secondary" className="bg-slate-800 text-slate-500 border-slate-700 text-[10px]">Istirahat (Pulang)</Badge>;
    }
    if (wait === 0) {
      return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-slate-950 font-bold text-[10px]">Baru Main</Badge>;
    }
    if (wait === 1) {
      return <Badge className="bg-slate-700 hover:bg-slate-700 text-slate-300 border-slate-600 text-[10px]">Menunggu 1</Badge>;
    }
    return (
      <Badge className="bg-amber-500 hover:bg-amber-500 text-slate-950 font-bold animate-pulse text-[10px]">
        WAJIB MAIN (M{wait})
      </Badge>
    );
  };

  // Helper to render stars for level
  const renderLevelStars = (level: number | null) => {
    if (level === null || level === undefined) {
      return <span className="text-[10px] text-slate-500 italic font-medium">Belum tahu</span>;
    }
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < level ? "fill-amber-400 text-amber-400" : "text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  // Helper to map Match ID to alphabet representation (Match F, G, H, J...)
  const getMatchLabel = (id: number) => {
    if (id <= 0) return "-";
    const labels = ["F", "G", "H", "J", "K", "L", "M", "N", "O", "P"];
    return labels[id - 1] || `${id}`;
  };

  return (
    <Card className="border-emerald-800/20 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
      <CardHeader className="border-b border-slate-800 bg-slate-900/40 py-4 px-6">
        <CardTitle className="text-lg font-semibold tracking-wide text-emerald-400">
          Dashboard Statistik Pemain
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs mt-1">
          Analisis rotasi pemain, jumlah partner/lawan unik, dan performa bermain.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const pStats = stats[player.id];
            if (!pStats) return null;

            // Calculate losses
            const completedMatchesCount = matches.filter(
              (m) =>
                (m.teamA.includes(player.id) || m.teamB.includes(player.id)) &&
                m.scoreA !== undefined &&
                m.scoreB !== undefined
            ).length;
            const losses = completedMatchesCount - pStats.wins;
            const winRatePercent =
              completedMatchesCount > 0
                ? Math.round((pStats.wins / completedMatchesCount) * 100)
                : 0;

            return (
              <Card
                key={player.id}
                className={`border bg-slate-950/45 hover:bg-slate-900/60 transition-all duration-150 rounded-xl overflow-hidden ${
                  player.isJoker
                    ? "border-slate-850 bg-slate-950/65 shadow-md shadow-emerald-950/10"
                    : "border-slate-800/80"
                } ${!player.active ? "opacity-55" : ""}`}
              >
                <div className="p-4 space-y-3">
                  {/* Name and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                        {player.isJoker ? (
                          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        {player.name || `Pemain`}
                      </h4>
                      <div className="mt-1">{renderLevelStars(player.level)}</div>
                    </div>
                    <div>{renderWaitBadge(pStats.waitDuration, player.active)}</div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                      <span className="text-slate-500 block">Total Bermain</span>
                      <span className="text-xs font-bold text-slate-200 mt-0.5">
                        {pStats.playCount} Match
                      </span>
                    </div>

                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                      <span className="text-slate-500 block">Match Terakhir</span>
                      <span className="text-xs font-bold text-slate-200 mt-0.5">
                        {pStats.lastPlayedMatch > 0
                          ? `Match ${getMatchLabel(pStats.lastPlayedMatch)}`
                          : "-"}
                      </span>
                    </div>

                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                      <span className="text-slate-500 block">Partner Unik</span>
                      <span className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-500/80 shrink-0" />
                        {pStats.partnerIds.size} orang
                      </span>
                    </div>

                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                      <span className="text-slate-500 block">Lawan Unik</span>
                      <span className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
                        {pStats.opponentIds.size} orang
                      </span>
                    </div>
                  </div>

                  {/* Win record details if available */}
                  {completedMatchesCount > 0 && (
                    <div className="bg-emerald-950/10 border border-emerald-900/20 py-1.5 px-2.5 rounded-lg flex items-center justify-between text-[9px] font-semibold text-slate-400">
                      <span>Record Mabar</span>
                      <span className="text-emerald-400">
                        {pStats.wins} M - {losses} K ({winRatePercent}% Win Rate)
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
