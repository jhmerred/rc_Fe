export interface Report {
  id: string;
  title: string;
  date: Date;
  description: string;
  category?: string;
  score?: number;
  status?: "excellent" | "good" | "average" | "needs_improvement";
}

export interface ReportDetail extends Report {
  content: {
    summary: string;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}