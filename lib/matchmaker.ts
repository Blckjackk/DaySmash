import { Player, Match, Recommendation } from "./types";

// Helper to calculate player statistics based on match history
export interface PlayerStats {
  id: string;
  playCount: number;
  lastPlayedMatch: number;
  waitDuration: number;
  partnerIds: Set<string>;
  opponentIds: Set<string>;
  wins: number;
  winRate: number;
}

export function calculatePlayerStats(players: Player[], matches: Match[], currentMatchIndex: number): Record<string, PlayerStats> {
  const stats: Record<string, PlayerStats> = {};

  // Initialize stats for all players
  players.forEach((p) => {
    stats[p.id] = {
      id: p.id,
      playCount: 0,
      lastPlayedMatch: 0,
      waitDuration: 0,
      partnerIds: new Set<string>(),
      opponentIds: new Set<string>(),
      wins: 0,
      winRate: 0,
    };
  });

  // Process completed matches
  matches.forEach((m) => {
    const playersInMatch = [...m.teamA, ...m.teamB];
    if (playersInMatch.length < 4) return;

    playersInMatch.forEach((pid) => {
      if (stats[pid]) {
        stats[pid].playCount += 1;
        if (m.id > stats[pid].lastPlayedMatch) {
          stats[pid].lastPlayedMatch = m.id;
        }
      }
    });

    const [a1, a2] = m.teamA;
    const [b1, b2] = m.teamB;

    if (stats[a1] && stats[a2]) {
      stats[a1].partnerIds.add(a2);
      stats[a2].partnerIds.add(a1);
    }
    if (stats[b1] && stats[b2]) {
      stats[b1].partnerIds.add(b2);
      stats[b2].partnerIds.add(b1);
    }

    m.teamA.forEach((apid) => {
      m.teamB.forEach((bpid) => {
        if (stats[apid]) stats[apid].opponentIds.add(bpid);
        if (stats[bpid]) stats[bpid].opponentIds.add(apid);
      });
    });

    if (m.scoreA !== undefined && m.scoreB !== undefined) {
      if (m.scoreA > m.scoreB) {
        m.teamA.forEach((pid) => { if (stats[pid]) stats[pid].wins += 1; });
      } else if (m.scoreB > m.scoreA) {
        m.teamB.forEach((pid) => { if (stats[pid]) stats[pid].wins += 1; });
      }
    }
  });

  players.forEach((p) => {
    const s = stats[p.id];
    if (!s) return;
    if (s.lastPlayedMatch > 0) {
      s.waitDuration = (currentMatchIndex - 1) - s.lastPlayedMatch;
    } else {
      s.waitDuration = currentMatchIndex - 1;
    }
    s.winRate = s.playCount > 0 ? s.wins / s.playCount : 0;
  });

  return stats;
}

// Get combination of k elements from array
function getCombinations<T>(array: T[], k: number): T[][] {
  const result: T[][] = [];
  function helper(start: number, combo: T[]) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return result;
}

// Get player level helper (defaults to 3 if null or not specified)
function getPlayerLevel(player: Player): number {
  return player.level !== null && player.level !== undefined ? player.level : 3.0;
}

/**
 * Generate the single best match for a given match index.
 * Returns the top recommendation only (used for generate-all).
 */
function generateBestMatch(
  players: Player[],
  matches: Match[],
  currentMatchIndex: number,
  targetMatches: number
): { match: Match | null; warnings: string[] } {
  const { recommendations, warnings } = generateRecommendations(
    players,
    matches,
    currentMatchIndex,
    targetMatches
  );
  if (recommendations.length === 0) return { match: null, warnings };
  const best = recommendations[0];
  return {
    match: {
      id: currentMatchIndex,
      teamA: best.teamA,
      teamB: best.teamB,
      isManual: false,
    },
    warnings,
  };
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Generate ALL remaining matches from currentMatchIndex to targetMatches.
 * Each generated match is simulated (added to the "virtual" match history)
 * so subsequent matches use it as their history base.
 * Returns an array of all generated Match objects.
 * ─────────────────────────────────────────────────────────────────────────
 */
export function generateAllRemainingMatches(
  players: Player[],
  matches: Match[],
  currentMatchIndex: number,
  targetMatches: number
): { generatedMatches: Match[]; allWarnings: string[] } {
  const generatedMatches: Match[] = [];
  const allWarnings: string[] = [];

  // Simulate match history, starting from real matches
  let simulatedMatches = [...matches];

  for (let idx = currentMatchIndex; idx <= targetMatches; idx++) {
    const { match, warnings } = generateBestMatch(
      players,
      simulatedMatches,
      idx,
      targetMatches
    );

    if (warnings.length > 0) {
      allWarnings.push(...warnings.map((w) => `M${idx}: ${w}`));
    }

    if (!match) {
      allWarnings.push(`M${idx}: Tidak bisa generate — tidak cukup pemain eligible.`);
      break;
    }

    generatedMatches.push(match);
    simulatedMatches = [...simulatedMatches, match];
  }

  return { generatedMatches, allWarnings };
}

/**
 * Generate match recommendations for match index M (returns top 3)
 */
export function generateRecommendations(
  players: Player[],
  matches: Match[],
  currentMatchIndex: number,
  targetMatches: number = 9
): { recommendations: Recommendation[]; warnings: string[] } {
  const warnings: string[] = [];
  
  // Find Admin/Joker player
  const adminPlayer = players.find((p) => p.isJoker) || players[11];
  const adminId = adminPlayer?.id;

  // Filter active players (excluding Admin from standard list)
  const activePlayers = players.filter((p) => p.active && p.id !== adminId);
  const totalActivePlayers = activePlayers.length;

  // Calculate stats based on previous matches
  const stats = calculatePlayerStats(players, matches, currentMatchIndex);

  // Check if we are generating the FINAL match
  const isFinalMatch = currentMatchIndex === targetMatches;

  if (isFinalMatch && adminPlayer && adminPlayer.active) {
    // FINAL MATCH: Admin plays with the 3 top-performing players
    const sortedPerformers = [...activePlayers].sort((a, b) => {
      const lvlA = getPlayerLevel(a);
      const lvlB = getPlayerLevel(b);
      if (lvlA !== lvlB) return lvlB - lvlA;

      const statA = stats[a.id];
      const statB = stats[b.id];
      if (statA && statB) {
        if (statA.wins !== statB.wins) return statB.wins - statA.wins;
        if (statA.winRate !== statB.winRate) return statB.winRate - statA.winRate;
        return statA.playCount - statB.playCount;
      }
      return 0;
    });

    const top3 = sortedPerformers.slice(0, 3);
    if (top3.length < 3) {
      warnings.push("Jumlah pemain aktif kurang untuk membuat pertandingan final.");
      return { recommendations: [], warnings };
    }

    const selected4 = [adminPlayer, ...top3];
    const recs = createMatchupsFor4Players(selected4, players, matches, stats, currentMatchIndex, true);
    return { recommendations: recs, warnings };
  }

  // STANDARD MATCH GENERATION
  if (totalActivePlayers < 4) {
    return {
      recommendations: [],
      warnings: ["Pemain aktif kurang dari 4 orang (tidak termasuk Admin). Aktifkan lebih banyak pemain di tabel."],
    };
  }

  // 1. Back-to-back constraint: players from previous match can't play again
  const lastMatch = matches[matches.length - 1];
  const prevPlayedIds = new Set<string>();
  if (lastMatch) {
    [...lastMatch.teamA, ...lastMatch.teamB].forEach((id) => prevPlayedIds.add(id));
  }

  let eligiblePlayers = activePlayers.filter((p) => !prevPlayedIds.has(p.id));

  if (eligiblePlayers.length < 4) {
    warnings.push("Relaksasi batasan bermain berturut-turut karena jumlah pemain terbatas.");
    eligiblePlayers = activePlayers;
  }

  // 2. Hard Constraint: Players who waited 2 matches MUST play
  const mandatoryPlayers = eligiblePlayers.filter((p) => {
    const s = stats[p.id];
    return s && s.waitDuration >= 2;
  });

  let candidate4PlayerGroups: Player[][] = [];

  if (mandatoryPlayers.length > 4) {
    warnings.push(`Ada ${mandatoryPlayers.length} pemain yang sudah menunggu 2 match. Memprioritaskan yang memiliki waktu tunggu terlama.`);
    const sortedMandatory = [...mandatoryPlayers].sort((a, b) => {
      const waitDiff = (stats[b.id]?.waitDuration || 0) - (stats[a.id]?.waitDuration || 0);
      if (waitDiff !== 0) return waitDiff;
      return (stats[a.id]?.playCount || 0) - (stats[b.id]?.playCount || 0);
    });
    candidate4PlayerGroups = [sortedMandatory.slice(0, 4)];
  } else if (mandatoryPlayers.length === 4) {
    candidate4PlayerGroups = [mandatoryPlayers];
  } else {
    const kNeeded = 4 - mandatoryPlayers.length;
    const remainingEligible = eligiblePlayers.filter((p) => !mandatoryPlayers.some((mp) => mp.id === p.id));

    if (remainingEligible.length < kNeeded) {
      warnings.push("Kurang pemain eligible. Melakukan fallback ke seluruh pemain aktif.");
      candidate4PlayerGroups = getCombinations(activePlayers, 4);
    } else {
      const combos = getCombinations(remainingEligible, kNeeded);
      candidate4PlayerGroups = combos.map((combo) => [...mandatoryPlayers, ...combo]);
    }
  }

  // 3. Evaluate all possible matchups for each 4-player group
  const allMatchups: Recommendation[] = [];
  candidate4PlayerGroups.forEach((group) => {
    const matchups = createMatchupsFor4Players(group, players, matches, stats, currentMatchIndex, false);
    allMatchups.push(...matchups);
  });

  allMatchups.sort((a, b) => b.score - a.score);

  return {
    recommendations: allMatchups.slice(0, 3),
    warnings,
  };
}

/**
 * Creates and scores the 3 possible matchups for a set of 4 players.
 * Priority: Level balance (A+B ≈ C+D) > partner repeats > opponent repeats > play count fairness
 */
function createMatchupsFor4Players(
  group: Player[],
  allPlayers: Player[],
  matches: Match[],
  stats: Record<string, PlayerStats>,
  currentMatchIndex: number,
  isFinalMatch: boolean
): Recommendation[] {
  if (group.length !== 4) return [];
  const [A, B, C, D] = group;

  // The 3 possible double-pair combinations
  const pairings = [
    { teamA: [A, B], teamB: [C, D] },
    { teamA: [A, C], teamB: [B, D] },
    { teamA: [A, D], teamB: [B, C] },
  ];

  return pairings.map((pair, index) => {
    const tA = pair.teamA;
    const tB = pair.teamB;
    const tAIds = tA.map((p) => p.id);
    const tBIds = tB.map((p) => p.id);

    // 1. Level balance — HIGHEST priority soft constraint
    //    Goal: A+B total level ≈ C+D total level (doesn't have to be equal, just close)
    const sumA = tA.reduce((sum, p) => sum + getPlayerLevel(p), 0);
    const sumB = tB.reduce((sum, p) => sum + getPlayerLevel(p), 0);
    const levelDifference = Math.abs(sumA - sumB);

    // 2. Partner repeats
    const partnerRepeats =
      countPartnerRepeats(tAIds[0], tAIds[1], matches) +
      countPartnerRepeats(tBIds[0], tBIds[1], matches);

    // 3. Opponent repeats
    const opponentRepeats =
      countOpponentRepeats(tAIds[0], tBIds[0], matches) +
      countOpponentRepeats(tAIds[0], tBIds[1], matches) +
      countOpponentRepeats(tAIds[1], tBIds[0], matches) +
      countOpponentRepeats(tAIds[1], tBIds[1], matches);

    // 4. Play count fairness
    const playsSum = group.reduce((sum, p) => sum + (stats[p.id]?.playCount || 0), 0);
    const waitsSum = group.reduce((sum, p) => sum + (stats[p.id]?.waitDuration || 0), 0);

    // ── Scoring Formula (out of 100) ───────────────────────────────────────
    // Level balance is the dominant factor.
    // levelDifference=0   → -0 pts   (perfect balance)
    // levelDifference=1   → -20 pts  (1 level apart)
    // levelDifference=2   → -40 pts  (heavily penalized)
    // Partner repeat      → -12 pts each
    // Opponent repeat     → -4 pts each (more acceptable than partner)
    // Play count penalty  → -0.5 pts per total plays (minor fairness)
    // Wait bonus          → +0.3 pts per wait count (mandatory satisfaction)
    let baseScore = 100;
    baseScore -= levelDifference * 20;   // level balance is king
    baseScore -= partnerRepeats * 12;    // avoid same partner
    baseScore -= opponentRepeats * 4;    // avoid same opponent (more lenient)
    baseScore -= playsSum * 0.5;
    baseScore += waitsSum * 0.3;

    const score = Math.max(0, Math.min(100, Math.round(baseScore)));

    // Human-readable explanation
    let explanation = `Selisih level ${levelDifference.toFixed(1)} (Tim A: ${sumA.toFixed(1)} vs Tim B: ${sumB.toFixed(1)}).`;
    if (partnerRepeats > 0) explanation += ` Partner berulang: ${partnerRepeats}x.`;
    if (opponentRepeats > 0) explanation += ` Lawan berulang: ${opponentRepeats}x.`;
    if (isFinalMatch) explanation += " 🏆 Pertandingan Final — Admin bermain.";

    return {
      id: `${tAIds.join("-")}-vs-${tBIds.join("-")}-${index}`,
      teamA: tAIds,
      teamB: tBIds,
      levelDifference,
      score,
      explanation,
    };
  });
}

// Count how many times player A and player B partnered
function countPartnerRepeats(p1: string, p2: string, matches: Match[]): number {
  let count = 0;
  matches.forEach((m) => {
    if (m.teamA.includes(p1) && m.teamA.includes(p2)) count++;
    if (m.teamB.includes(p1) && m.teamB.includes(p2)) count++;
  });
  return count;
}

// Count how many times player A and player B were opponents
function countOpponentRepeats(p1: string, p2: string, matches: Match[]): number {
  let count = 0;
  matches.forEach((m) => {
    const inTeamA1 = m.teamA.includes(p1);
    const inTeamA2 = m.teamA.includes(p2);
    const inTeamB1 = m.teamB.includes(p1);
    const inTeamB2 = m.teamB.includes(p2);
    if ((inTeamA1 && inTeamB2) || (inTeamB1 && inTeamA2)) {
      count++;
    }
  });
  return count;
}
