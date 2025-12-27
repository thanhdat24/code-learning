
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  initialCode: string;
}

export interface EvaluationResult {
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error';
  score: number;
  feedback: string;
  suggestions: string[];
  optimizedCode: string;
}

export interface Submission {
  id: string;
  problemId: string;
  code: string;
  timestamp: number;
  result: EvaluationResult;
}

export interface User {
  username: string;
  solvedProblemIds: string[];
  points: number;
  submissions: Submission[];
}
