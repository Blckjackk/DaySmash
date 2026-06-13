import React, { useRef } from "react";
import { Player, Match } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Info } from "lucide-react";
import { toast } from "sonner";

interface PlayerSpreadsheetProps {
  players: Player[];
  matches: Match[];
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onImportState: (importedData: { players: Player[]; matches: Match[]; title: string }) => void;
  title: string;
  onEditMatch: (matchId: number) => void;
}

export default function PlayerSpreadsheet({
  players,
  matches,
  onUpdatePlayer,
  onImportState,
  title,
  onEditMatch,
}: PlayerSpreadsheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to check if a player played in a specific match
  const playerPlayedInMatch = (playerId: string, matchId: number): boolean => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return false;
    return match.teamA.includes(playerId) || match.teamB.includes(playerId);
  };

  // Export session data to JSON
  const handleExportJSON = () => {
    try {
      const exportData = {
        players,
        matches,
        title,
        version: "1.0",
        timestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `daysmash-${title.toLowerCase().replace(/\s+/g, "-") || "session"}.json`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Data berhasil diekspor ke JSON");
    } catch (error) {
      toast.error("Gagal mengekspor data");
    }
  };

  // Import session data from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.players) && Array.isArray(data.matches)) {
          onImportState({
            players: data.players,
            matches: data.matches,
            title: data.title || "Mabar Badminton",
          });
          toast.success("Data berhasil diimpor!");
        } else {
          toast.error("Format file JSON tidak sesuai");
        }
      } catch (error) {
        toast.error("Gagal membaca file JSON");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input
    }
  };

  return (
    <Card className="border-emerald-800/20 bg-slate-900/40 backdrop-blur-md text-white shadow-xl overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/60 py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <CardTitle className="text-lg font-semibold tracking-wide text-emerald-400">
            Spreadsheet Pemain & Pertandingan
          </CardTitle>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportJSON}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700 text-xs h-9"
          >
            <Upload className="w-3.5 h-3.5" />
            Impor JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="flex-1 sm:flex-none gap-2 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border-emerald-800/40 text-xs h-9"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor JSON
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table className="min-w-[900px] border-collapse text-slate-200">
          <TableHeader className="bg-emerald-800/95 hover:bg-emerald-800/95 text-white border-b border-emerald-900">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="w-12 text-center font-bold text-white uppercase text-xs tracking-wider border-r border-emerald-900">
                NO
              </TableHead>
              <TableHead className="w-16 text-center font-bold text-white uppercase text-xs tracking-wider border-r border-emerald-900">
                HADIR
              </TableHead>
              <TableHead className="min-w-[150px] font-bold text-white uppercase text-xs tracking-wider border-r border-emerald-900">
                NAMA PEMAIN
              </TableHead>
              <TableHead className="w-24 text-center font-bold text-white uppercase text-xs tracking-wider border-r border-emerald-900">
                LEVEL
              </TableHead>
              <TableHead className="w-16 text-center font-bold text-white uppercase text-xs tracking-wider border-r border-emerald-900">
                MAIN
              </TableHead>
              <TableHead className="w-32 text-center font-bold text-white uppercase text-xs tracking-wider border-r border-emerald-900">
                BAYAR
              </TableHead>
              <TableHead className="text-center font-bold text-white uppercase text-xs tracking-wider border-r border-emerald-900 p-0">
                <div className="py-1 border-b border-emerald-900 bg-emerald-850 font-bold uppercase text-[10px] tracking-wider">
                  MAIN DAN JUMLAH KOK
                </div>
                <div className="grid grid-cols-10 text-[9px] font-semibold text-emerald-100">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => onEditMatch(i + 1)}
                      className="py-1 border-r border-emerald-900 last:border-0 hover:bg-emerald-700 hover:text-white transition-colors duration-150 cursor-pointer font-bold"
                      title={`Klik untuk edit Match ${i + 1}`}
                    >
                      M{i + 1}
                    </button>
                  ))}
                </div>
              </TableHead>
              <TableHead className="w-16 text-center font-bold text-white uppercase text-xs tracking-wider border-r border-emerald-900">
                KOK
              </TableHead>
              <TableHead className="min-w-[120px] font-bold text-white uppercase text-xs tracking-wider">
                KET
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-800 bg-slate-950/20">
            {players.map((player, idx) => {
              const playCount = matches.filter(
                (m) => m.teamA.includes(player.id) || m.teamB.includes(player.id)
              ).length;

              return (
                <TableRow
                  key={player.id}
                  className={`hover:bg-slate-900/50 transition-colors border-slate-800 ${
                    player.isJoker ? "bg-slate-900/40 font-medium border-t-2 border-slate-850" : ""
                  } ${!player.active ? "opacity-45 text-slate-500 hover:bg-transparent" : ""}`}
                >
                  {/* NO */}
                  <TableCell className="text-center py-2 px-3 border-r border-slate-800 text-xs font-semibold text-slate-400">
                    {idx + 1}
                  </TableCell>

                  {/* HADIR */}
                  <TableCell className="text-center py-2 px-3 border-r border-slate-800">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={player.active}
                        onCheckedChange={(checked) => {
                          onUpdatePlayer(player.id, { active: !!checked });
                          if (!checked && player.isJoker) {
                            toast.warning("Admin (Joker) dinonaktifkan dari rotasi.");
                          }
                        }}
                        className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                    </div>
                  </TableCell>

                  {/* NAMA */}
                  <TableCell className="py-1 px-3 border-r border-slate-800">
                    <Input
                      value={player.name}
                      onChange={(e) => onUpdatePlayer(player.id, { name: e.target.value })}
                      placeholder={player.isJoker ? "Admin (Joker)" : `Pemain ${idx + 1}`}
                      disabled={player.isJoker} // Prevent renaming admin joker directly to keep it simple, or keep it editable
                      className="h-8 bg-slate-950/40 text-slate-100 border-slate-800 focus-visible:ring-emerald-500 text-sm py-1"
                    />
                  </TableCell>

                  {/* LEVEL */}
                  <TableCell className="py-1 px-3 border-r border-slate-800 text-center">
                    <Select
                      value={player.level?.toString() || "null"}
                      onValueChange={(val) =>
                        onUpdatePlayer(player.id, {
                          level: val === "null" ? null : parseInt(val, 10),
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-full bg-slate-950/40 border-slate-800 text-slate-100 text-xs flex justify-center items-center">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="null" className="text-slate-400 text-xs">Belum tahu</SelectItem>
                        <SelectItem value="1" className="text-xs">Level 1</SelectItem>
                        <SelectItem value="2" className="text-xs">Level 2</SelectItem>
                        <SelectItem value="3" className="text-xs">Level 3</SelectItem>
                        <SelectItem value="4" className="text-xs">Level 4</SelectItem>
                        <SelectItem value="5" className="text-xs">Level 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* MAIN */}
                  <TableCell className="text-center py-2 px-3 border-r border-slate-800 text-xs font-semibold text-emerald-400 bg-emerald-950/5">
                    {playCount}
                  </TableCell>

                  {/* BAYAR */}
                  <TableCell className="py-1 px-3 border-r border-slate-800">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={player.paidAmount}
                        onChange={(e) =>
                          onUpdatePlayer(player.id, { paidAmount: parseInt(e.target.value, 10) || 0 })
                        }
                        className="h-8 w-20 bg-slate-950/40 text-slate-100 border-slate-800 focus-visible:ring-emerald-500 text-xs py-1 px-2"
                      />
                      <Checkbox
                        checked={player.paidStatus}
                        onCheckedChange={(checked) =>
                          onUpdatePlayer(player.id, { paidStatus: !!checked })
                        }
                        className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        title={player.paidStatus ? "Lunas" : "Belum Bayar"}
                      />
                    </div>
                  </TableCell>

                  {/* MATCH MATRIX */}
                  <TableCell className="p-0 border-r border-slate-800 bg-slate-950/10">
                    <div className="grid grid-cols-10 h-full min-h-[32px] text-center items-center">
                      {[...Array(10)].map((_, i) => {
                        const played = playerPlayedInMatch(player.id, i + 1);
                        const matchScheduled = matches.some((m) => m.id === i + 1);
                        
                        // Wait, special case in screenshot for admin joker is an "x" sometimes? Let's keep it simple.
                        return (
                          <div
                            key={i}
                            className={`h-full flex items-center justify-center border-r border-slate-800/40 last:border-0 text-sm ${
                              played
                                ? "bg-emerald-500/20 text-emerald-400 font-bold"
                                : ""
                            }`}
                          >
                            {played ? (
                              <span className="text-lg leading-none animate-fade-in">•</span>
                            ) : matchScheduled && player.isJoker && i + 1 === 9 ? (
                              // Match 9 is the target final match where joker plays
                              <span className="text-slate-700 text-xs"></span>
                            ) : (
                              ""
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>

                  {/* KOK */}
                  <TableCell className="py-1 px-3 border-r border-slate-800">
                    <Input
                      type="number"
                      value={player.kokCount}
                      onChange={(e) =>
                        onUpdatePlayer(player.id, { kokCount: parseInt(e.target.value, 10) || 0 })
                      }
                      className="h-8 w-14 bg-slate-950/40 text-slate-100 border-slate-800 focus-visible:ring-emerald-500 text-xs py-1 px-2 text-center"
                    />
                  </TableCell>

                  {/* KET */}
                  <TableCell className="py-1 px-3">
                    <Input
                      value={player.notes}
                      onChange={(e) => onUpdatePlayer(player.id, { notes: e.target.value })}
                      placeholder={player.isJoker ? "Admin (Joker)" : "-"}
                      className="h-8 bg-slate-950/40 text-slate-100 border-slate-800 focus-visible:ring-emerald-500 text-xs py-1"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <div className="py-3 px-6 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Tip: Klik pada nama match (<strong>M1–M10</strong>) di kolom header untuk mengedit secara manual detail pertandingan kapan saja.
        </span>
      </div>
    </Card>
  );
}
