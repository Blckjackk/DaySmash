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
import { Download, Upload, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PlayerSpreadsheetProps {
  players: Player[];
  matches: Match[];
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onUpdateMatchKok: (matchId: number, kokCount: number) => void;
  onImportState: (importedData: { players: Player[]; matches: Match[]; title: string }) => void;
  title: string;
  onEditMatch: (matchId: number) => void;
  onDeletePlayer?: (id: string) => void;
}

export default function PlayerSpreadsheet({
  players,
  matches,
  onUpdatePlayer,
  onUpdateMatchKok,
  onImportState,
  title,
  onEditMatch,
  onDeletePlayer,
}: PlayerSpreadsheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if a player played in a specific match
  const playerPlayedInMatch = (playerId: string, matchId: number): boolean => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return false;
    return match.teamA.includes(playerId) || match.teamB.includes(playerId);
  };

  // Get kok count for a specific match
  const getMatchKok = (matchId: number): number => {
    const match = matches.find((m) => m.id === matchId);
    return match?.kokCount ?? 0;
  };

  // Accumulated kok count for a player: sum of kokCount from all matches they played in
  const getPlayerTotalKok = (playerId: string): number => {
    return matches
      .filter((m) => m.teamA.includes(playerId) || m.teamB.includes(playerId))
      .reduce((sum, m) => sum + (m.kokCount ?? 0), 0);
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
    } catch {
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
      } catch {
        toast.error("Gagal membaca file JSON");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle player deletion
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pemain ${name || "ini"}?`)) {
      if (onDeletePlayer) {
        onDeletePlayer(id);
        toast.success(`Pemain ${name} berhasil dihapus.`);
      }
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden rounded-2xl">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border bg-muted/40 py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <CardTitle className="text-lg font-serif font-light tracking-wide text-primary">
            Spreadsheet Pemain &amp; Pertandingan
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
            className="flex-1 sm:flex-none gap-2 bg-card hover:bg-muted text-foreground border-border text-xs h-9"
          >
            <Upload className="w-3.5 h-3.5" />
            Impor JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="flex-1 sm:flex-none gap-2 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 text-xs h-9"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor JSON
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table className="min-w-[950px] border-collapse text-foreground">
          <TableHeader className="bg-primary hover:bg-primary text-white border-b border-primary/80">
            <TableRow className="hover:bg-transparent border-white/10">
              <TableHead className="w-10 text-center font-bold text-white uppercase text-[10px] tracking-wider border-r border-white/20">
                NO
              </TableHead>
              <TableHead className="w-14 text-center font-bold text-white uppercase text-[10px] tracking-wider border-r border-white/20">
                HADIR
              </TableHead>
              <TableHead className="min-w-[140px] font-bold text-white uppercase text-[10px] tracking-wider border-r border-white/20">
                NAMA PEMAIN
              </TableHead>
              <TableHead className="w-20 text-center font-bold text-white uppercase text-[10px] tracking-wider border-r border-white/20">
                LEVEL
              </TableHead>
              <TableHead className="w-14 text-center font-bold text-white uppercase text-[10px] tracking-wider border-r border-white/20">
                MAIN
              </TableHead>
              <TableHead className="w-32 text-center font-bold text-white uppercase text-[10px] tracking-wider border-r border-white/20">
                BAYAR
              </TableHead>

              {/* MATCH MATRIX — M1 to M10 */}
              {/* Each cell: dot = played, tiny kok input below dot */}
              <TableHead className="text-center font-bold text-white uppercase text-[10px] tracking-wider border-r border-white/20 p-0">
                <div className="py-1 border-b border-white/20 bg-primary/80 font-bold uppercase text-[9px] tracking-wider">
                  MAIN &amp; KOK PER MATCH
                </div>
                <div className="flex text-[9px] font-semibold text-green-100">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => onEditMatch(i + 1)}
                      className="flex-1 min-w-[2.8rem] py-1 border-r border-white/20 last:border-0 hover:bg-primary/60 hover:text-white transition-colors cursor-pointer font-bold"
                      title={`Klik untuk edit Match ${i + 1}`}
                    >
                      M{i + 1}
                    </button>
                  ))}
                </div>
              </TableHead>

              <TableHead className="min-w-[120px] font-bold text-white uppercase text-[10px] tracking-wider border-r border-white/20">
                KET
              </TableHead>
              <TableHead className="w-14 text-center font-bold text-white uppercase text-[10px] tracking-wider">
                AKSI
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border bg-card">
            {players.map((player, idx) => {
              const playCount = matches.filter(
                (m) => m.teamA.includes(player.id) || m.teamB.includes(player.id)
              ).length;

              // Total kok accumulated from all matches this player played in
              const totalKok = getPlayerTotalKok(player.id);
              // Total bill = court fee + kok cost (Rp 2,000 per kok)
              const totalBill = player.paidAmount + totalKok * 2000;

              return (
                <TableRow
                  key={player.id}
                  className={`hover:bg-muted/50 transition-colors border-border ${
                    player.isJoker ? "bg-primary/[0.03] font-medium border-t-2 border-primary/15" : ""
                  } ${!player.active ? "opacity-40 text-muted-foreground hover:bg-transparent" : ""}`}
                >
                  {/* NO */}
                  <TableCell className="text-center py-2.5 px-2 border-r border-border text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </TableCell>

                  {/* HADIR */}
                  <TableCell className="text-center py-2.5 px-2 border-r border-border">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={player.active}
                        onCheckedChange={(checked) => {
                          onUpdatePlayer(player.id, { active: !!checked });
                          if (!checked && player.isJoker) {
                            toast.warning("Admin (Joker) dinonaktifkan dari rotasi.");
                          }
                        }}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>
                  </TableCell>

                  {/* NAMA */}
                  <TableCell className="py-1.5 px-2 border-r border-border">
                    <Input
                      value={player.name}
                      onChange={(e) => onUpdatePlayer(player.id, { name: e.target.value })}
                      placeholder={player.isJoker ? "Admin (Joker)" : `Pemain ${idx + 1}`}
                      className="h-8 bg-muted/40 text-foreground border-border focus-visible:ring-primary text-xs py-1"
                    />
                  </TableCell>

                  {/* LEVEL */}
                  <TableCell className="py-1.5 px-2 border-r border-border text-center">
                    <Select
                      value={player.level?.toString() || "null"}
                      onValueChange={(val) =>
                        onUpdatePlayer(player.id, {
                          level: val === "null" ? null : parseInt(val, 10),
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-full bg-muted/40 border-border text-foreground text-[10px]">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="null" className="text-muted-foreground text-xs">Belum tahu</SelectItem>
                        <SelectItem value="1" className="text-xs">Level 1</SelectItem>
                        <SelectItem value="2" className="text-xs">Level 2</SelectItem>
                        <SelectItem value="3" className="text-xs">Level 3</SelectItem>
                        <SelectItem value="4" className="text-xs">Level 4</SelectItem>
                        <SelectItem value="5" className="text-xs">Level 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* MAIN */}
                  <TableCell className="text-center py-2.5 px-2 border-r border-border text-xs font-bold text-primary bg-primary/5">
                    {playCount}
                  </TableCell>

                  {/* BAYAR — court fee input + auto-accumulated total */}
                  <TableCell className="py-1.5 px-2 border-r border-border">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={player.paidAmount}
                          onChange={(e) =>
                            onUpdatePlayer(player.id, { paidAmount: parseInt(e.target.value, 10) || 0 })
                          }
                          className="h-7 w-20 bg-muted/40 text-foreground border-border focus-visible:ring-primary text-xs py-1 px-2"
                          title="Iuran Lapangan (Rp)"
                          placeholder="Iuran"
                        />
                        <Checkbox
                          checked={player.paidStatus}
                          onCheckedChange={(checked) =>
                            onUpdatePlayer(player.id, { paidStatus: !!checked })
                          }
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                          title={player.paidStatus ? "Lunas" : "Belum Bayar"}
                        />
                      </div>
                      {/* Accumulated total */}
                      <div className="flex items-center gap-1 px-0.5">
                        <span className="text-[9px] text-muted-foreground">+{totalKok} kok =</span>
                        <span className={`text-[10px] font-bold ${player.paidStatus ? "text-primary" : "text-foreground"}`}>
                          Rp {totalBill.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* MATCH MATRIX — dot + kok input inside green cell */}
                  <TableCell className="p-0 border-r border-border">
                    <div className="flex h-full min-h-[52px] items-stretch">
                      {[...Array(10)].map((_, i) => {
                        const matchId = i + 1;
                        const played = playerPlayedInMatch(player.id, matchId);
                        const matchKok = getMatchKok(matchId);
                        const matchExists = matches.some((m) => m.id === matchId);

                        return (
                          <div
                            key={i}
                            className={`flex-1 min-w-[2.8rem] flex flex-col items-center justify-center border-r border-border last:border-0 gap-0.5 py-1 transition-colors ${
                              played
                                ? "bg-primary/12 text-primary"
                                : matchExists
                                ? "bg-muted/20"
                                : ""
                            }`}
                          >
                            {played ? (
                              <>
                                {/* Big dot */}
                                <span className="text-primary text-lg leading-none select-none">•</span>
                                {/* Kok input — shared per match */}
                                <input
                                  type="number"
                                  min={0}
                                  max={99}
                                  value={matchKok || ""}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    onUpdateMatchKok(matchId, isNaN(val) ? 0 : val);
                                  }}
                                  placeholder="0"
                                  title={`Kok Match M${matchId}`}
                                  className="w-8 h-5 text-center text-[10px] font-bold bg-primary/15 border border-primary/30 rounded text-primary focus:outline-none focus:ring-1 focus:ring-primary/50 leading-none px-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </>
                            ) : matchExists ? (
                              // Match exists but player didn't play
                              <span className="text-muted-foreground/30 text-xs select-none">—</span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>

                  {/* KET */}
                  <TableCell className="py-1.5 px-2 border-r border-border">
                    <Input
                      value={player.notes}
                      onChange={(e) => onUpdatePlayer(player.id, { notes: e.target.value })}
                      placeholder={player.isJoker ? "Admin (Joker)" : "-"}
                      className="h-8 bg-muted/40 text-foreground border-border focus-visible:ring-primary text-xs py-1"
                    />
                  </TableCell>

                  {/* AKSI */}
                  <TableCell className="py-1 px-2 text-center">
                    {!player.isJoker ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(player.id, player.name)}
                        disabled={playCount > 0}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 disabled:opacity-20"
                        title={playCount > 0 ? "Pemain sudah bermain, tidak bisa dihapus." : "Hapus pemain"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Joker</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <div className="py-3 px-6 bg-muted/30 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <span>
          Input angka <strong>kok</strong> langsung di dalam sel hijau tiap match — otomatis diakumulasikan ke total bayar setiap pemain. 1 kok = Rp 2.000.
        </span>
      </div>
    </Card>
  );
}
