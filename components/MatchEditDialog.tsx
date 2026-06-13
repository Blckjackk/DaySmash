import React, { useState, useEffect } from "react";
import { Player, Match } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface MatchEditDialogProps {
  matchId: number | null;
  players: Player[];
  matches: Match[];
  onSave: (matchId: number, teamA: string[], teamB: string[]) => void;
  onClose: () => void;
}

export default function MatchEditDialog({
  matchId,
  players,
  matches,
  onSave,
  onClose,
}: MatchEditDialogProps) {
  const [a1, setA1] = useState<string>("");
  const [a2, setA2] = useState<string>("");
  const [b1, setB1] = useState<string>("");
  const [b2, setB2] = useState<string>("");

  const activePlayers = players.filter((p) => p.active);

  // Load existing match players when matchId changes
  useEffect(() => {
    if (matchId !== null) {
      const match = matches.find((m) => m.id === matchId);
      if (match && match.teamA.length === 2 && match.teamB.length === 2) {
        setA1(match.teamA[0]);
        setA2(match.teamA[1]);
        setB1(match.teamB[0]);
        setB2(match.teamB[1]);
      } else {
        // Clear if match is new/empty
        setA1("");
        setA2("");
        setB1("");
        setB2("");
      }
    }
  }, [matchId, matches]);

  const handleSave = () => {
    if (!matchId) return;
    if (!a1 || !a2 || !b1 || !b2) {
      toast.error("Harap pilih 4 pemain.");
      return;
    }

    const selected = new Set([a1, a2, b1, b2]);
    if (selected.size !== 4) {
      toast.error("Pemain tidak boleh sama.");
      return;
    }

    onSave(matchId, [a1, a2], [b1, b2]);
    toast.success(`Susunan pemain Match M${matchId} berhasil diperbarui.`);
    onClose();
  };

  // Helper to get active players excluding selected in other dropdowns
  const getAvailablePlayers = (currentVal: string) => {
    const selected = [a1, a2, b1, b2].filter((id) => id && id !== currentVal);
    return activePlayers.filter((p) => !selected.includes(p.id));
  };

  const isOpen = matchId !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-400 font-bold text-lg">
            Edit Pertandingan M{matchId}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Ubah susunan pemain untuk pertandingan ini secara manual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Team A */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block">TIM A</span>
              
              <Select value={a1} onValueChange={setA1}>
                <SelectTrigger className="w-full bg-slate-900 border-slate-800 h-8 text-xs">
                  <SelectValue placeholder="Pemain 1" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {getAvailablePlayers(a1).map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} (Lvl {p.level || "-"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={a2} onValueChange={setA2}>
                <SelectTrigger className="w-full bg-slate-900 border-slate-800 h-8 text-xs">
                  <SelectValue placeholder="Pemain 2" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {getAvailablePlayers(a2).map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} (Lvl {p.level || "-"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team B */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
              <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase block">TIM B</span>
              
              <Select value={b1} onValueChange={setB1}>
                <SelectTrigger className="w-full bg-slate-900 border-slate-800 h-8 text-xs">
                  <SelectValue placeholder="Pemain 1" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {getAvailablePlayers(b1).map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} (Lvl {p.level || "-"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={b2} onValueChange={setB2}>
                <SelectTrigger className="w-full bg-slate-900 border-slate-800 h-8 text-xs">
                  <SelectValue placeholder="Pemain 2" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {getAvailablePlayers(b2).map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} (Lvl {p.level || "-"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!a1 || !a2 || !b1 || !b2}
            className="bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold text-xs"
          >
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
