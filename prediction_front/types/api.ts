export interface Match {
   id: number;
   home_team: string;
   away_team: string;
   home_score: number;
   away_score: number;
   date: string;
}

export interface Prediction {
   user: string;
   match_id: number;
   predicted_home_score: number;
   predicted_away_score: number;
}

export interface LeaderboardEntry {
   user: string;
   points: number;
}

export interface ApiError {
   error: string;
   message?: string;
}