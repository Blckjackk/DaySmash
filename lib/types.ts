export interface Player {
  id: string;
  name: string;
  level: number | null; // Level 1-5 or null (belum diketahui)
  active: boolean; // Hadir checkbox
  paidAmount: number; // e.g. 12000
  paidStatus: boolean; // Paid checkbox
  kokCount: number; // Kok count
  notes: string; // Keterangan
  isJoker: boolean; // True for the 12th player (Admin)
}

export interface Match {
  id: number; // 1 to 10
  teamA: string[]; // [player1Id, player2Id]
  teamB: string[]; // [player3Id, player4Id]
  scoreA?: number; // Score Team A
  scoreB?: number; // Score Team B
  isManual: boolean; // True if manually entered, false if from recommendation
}

export interface Recommendation {
  id: string; // Unique ID
  teamA: string[]; // [player1Id, player2Id]
  teamB: string[]; // [player3Id, player4Id]
  levelDifference: number; // Difference in levels between the two teams
  score: number; // Score of match quality (0-100)
  explanation: string; // Explanation of why this matchup was chosen
}

export interface AppState {
  players: Player[];
  matches: Match[];
  title: string; // Mabar title
  targetMatches: number; // Default target is 9
}
