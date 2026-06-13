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

  // Process completed matches (we consider a match completed if it has players)
  matches.forEach((m) => {
    const playersInMatch = [...m.teamA, ...m.teamB];
    if (playersInMatch.length < 4) return;

    // Track play counts & last played match
    playersInMatch.forEach((pid) => {
      if (stats[pid]) {
        stats[pid].playCount += 1;
        if (m.id > stats[pid].lastPlayedMatch) {
          stats[pid].lastPlayedMatch = m.id;
        }
      }
    });

    // Track partners & opponents
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

    const teamASet = new Set(m.teamA);
    const teamBSet = new Set(m.teamB);

    m.teamA.forEach((apid) => {
      m.teamB.forEach((bpid) => {
        if (stats[apid]) stats[apid].opponentIds.add(bpid);
        if (stats[bpid]) stats[bpid].opponentIds.add(apid);
      });
    });

    // Track wins if scores are input
    if (m.scoreA !== undefined && m.scoreB !== undefined) {
      if (m.scoreA > m.scoreB) {
        m.teamA.forEach((pid) => {
          if (stats[pid]) stats[pid].wins += 1;
        });
      } else if (m.scoreB > m.scoreA) {
        m.teamB.forEach((pid) => {
          if (stats[pid]) stats[pid].wins += 1;
        });
      }
    }
  });

  // Calculate wait duration and win rate for each player
  players.forEach((p) => {
    const s = stats[p.id];
    if (!s) return;

    if (s.lastPlayedMatch > 0) {
      s.waitDuration = (currentMatchIndex - 1) - s.lastPlayedMatch;
    } else {
      // If never played, they have waited for all matches played so far
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
 * Generate match recommendations for match index M
 */
export function generateRecommendations(
  players: Player[],
  matches: Match[],
  currentMatchIndex: number,
  targetMatches: number = 9
): { recommendations: Recommendation[]; warnings: string[] } {
  const warnings: string[] = [];
  
  // Find Admin/Joker player (usually isJoker = true, or last player if not flagged)
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
    // FINAL MATCH RULE: Admin MUST play, along with the 3 top-performing players
    // Top-performing is sorted by level (descending), then winCount (descending), then winRate (descending), then lowest playCount
    const sortedPerformers = [...activePlayers].sort((a, b) => {
      const lvlA = getPlayerLevel(a);
      const lvlB = getPlayerLevel(b);
      if (lvlA !== lvlB) return lvlB - lvlA;

      const statA = stats[a.id];
      const statB = stats[b.id];
      if (statA && statB) {
        if (statA.wins !== statB.wins) return statB.wins - statA.wins;
        if (statA.winRate !== statB.winRate) return statB.winRate - statA.winRate;
        return statA.playCount - statB.playCount; // Prefer players with fewer plays as tiebreaker
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

  // STANDARD MATCH GENERATION (Matches 4 to N-1)
  // Ensure we have at least 4 active players
  if (totalActivePlayers < 4) {
    return {
      recommendations: [],
      warnings: ["Pemain aktif kurang dari 4 orang (tidak termasuk Admin). Aktifkan lebih banyak pemain di tabel."],
    };
  }

  // 1. Get the list of players who played in the previous match (back-to-back constraint)
  const lastMatch = matches.find((m) => m.id === currentMatchIndex - 1);
  const prevPlayedIds = new Set<string>();
  if (lastMatch) {
    [...lastMatch.teamA, ...lastMatch.teamB].forEach((id) => prevPlayedIds.add(id));
  }

  // Filter out back-to-back players
  let eligiblePlayers = activePlayers.filter((p) => !prevPlayedIds.has(p.id));

  // If we don't have enough players who did not play in the previous match, we have to relax back-to-back
  if (eligiblePlayers.length < 4) {
    warnings.push("Relaksasi batasan bermain berturut-turut karena jumlah pemain terbatas.");
    eligiblePlayers = activePlayers;
  }

  // 2. Hard Constraint: Players who have waited 2 matches MUST play
  // Wait duration >= 2 means they missed at least the last 2 matches
  const mandatoryPlayers = eligiblePlayers.filter((p) => {
    const s = stats[p.id];
    return s && s.waitDuration >= 2;
  });

  let selectedSet: Player[] = [];
  let candidate4PlayerGroups: Player[][] = [];

  if (mandatoryPlayers.length > 4) {
    warnings.push(`Ada ${mandatoryPlayers.length} pemain yang sudah menunggu 2 match. Memprioritaskan yang memiliki waktu tunggu terlama.`);
    
    // Sort mandatory players by wait time (descending), then play count (ascending)
    const sortedMandatory = [...mandatoryPlayers].sort((a, b) => {
      const waitDiff = (stats[b.id]?.waitDuration || 0) - (stats[a.id]?.waitDuration || 0);
      if (waitDiff !== 0) return waitDiff;
      return (stats[a.id]?.playCount || 0) - (stats[b.id]?.playCount || 0);
    });
    
    // Select top 4
    candidate4PlayerGroups = [sortedMandatory.slice(0, 4)];
  } else if (mandatoryPlayers.length === 4) {
    // Exactly 4 mandatory players
    candidate4PlayerGroups = [mandatoryPlayers];
  } else {
    // Fewer than 4 mandatory players. We need to choose (4 - mandatoryPlayers.length) from other eligible players
    const kNeeded = 4 - mandatoryPlayers.length;
    const remainingEligible = eligiblePlayers.filter((p) => !mandatoryPlayers.some((mp) => mp.id === p.id));

    if (remainingEligible.length < kNeeded) {
      // Not enough remaining eligible players, fallback to all active players
      warnings.push("Kurang pemain eligible. Melakukan fallback ke seluruh pemain aktif.");
      const allCombos = getCombinations(activePlayers, 4);
      candidate4PlayerGroups = allCombos;
    } else {
      const combos = getCombinations(remainingEligible, kNeeded);
      candidate4PlayerGroups = combos.map((combo) => [...mandatoryPlayers, ...combo]);
    }
  }

  // 3. For each group of 4 players, evaluate all 3 possible matchups
  const allMatchups: Recommendation[] = [];

  candidate4PlayerGroups.forEach((group) => {
    const matchups = createMatchupsFor4Players(group, players, matches, stats, currentMatchIndex, false);
    allMatchups.push(...matchups);
  });

  // Sort by score descending
  allMatchups.sort((a, b) => b.score - a.score);

  // Return the top 3 recommendations
  return {
    recommendations: allMatchups.slice(0, 3),
    warnings,
  };
}

/**
 * Creates and evaluates the 3 possible matchups for a set of 4 players
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

  // The 3 possible double match combinations
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

    // 1. Level Difference
    const sumA = tA.reduce((sum, p) => sum + getPlayerLevel(p), 0);
    const sumB = tB.reduce((sum, p) => sum + getPlayerLevel(p), 0);
    const levelDifference = Math.abs(sumA - sumB);

    // 2. Partner repeats
    const partnerRepeats = countPartnerRepeats(tAIds[0], tAIds[1], matches) + 
                           countPartnerRepeats(tBIds[0], tBIds[1], matches);

    // 3. Opponent repeats
    const opponentRepeats = 
      countOpponentRepeats(tAIds[0], tBIds[0], matches) +
      countOpponentRepeats(tAIds[0], tBIds[1], matches) +
      countOpponentRepeats(tAIds[1], tBIds[0], matches) +
      countOpponentRepeats(tAIds[1], tBIds[1], matches);

    // 4. Play count distribution (prefer players with lower play counts)
    const playsSum = group.reduce((sum, p) => sum + (stats[p.id]?.playCount || 0), 0);

    // 5. Waiting time prioritization
    const waitsSum = group.reduce((sum, p) => sum + (stats[p.id]?.waitDuration || 0), 0);

    // Scoring Formula (normalized out of 100)
    // Starting with 100:
    // Deduct 15 points per 1.0 of level difference.
    // Deduct 12 points per repeated partner.
    // Deduct 3 points per repeated opponent.
    // Deduct 0.5 points per play of the players.
    // Add 0.2 points per wait count.
    let baseScore = 100;
    baseScore -= levelDifference * 15;
    baseScore -= partnerRepeats * 12;
    baseScore -= opponentRepeats * 3;
    baseScore -= playsSum * 0.5;
    baseScore += waitsSum * 0.2;

    const score = Math.max(0, Math.min(100, Math.round(baseScore)));

    // Generate description explanation
    let explanation = `Selisih level ${levelDifference.toFixed(1)}.`;
    if (partnerRepeats > 0) explanation += ` Partner berulang: ${partnerRepeats}x.`;
    if (opponentRepeats > 0) explanation += ` Lawan berulang: ${opponentRepeats}x.`;
    if (isFinalMatch) {
      explanation += " Pertandingan Final (Admin bermain).";
    }

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
