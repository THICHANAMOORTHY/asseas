export type Department = 'ECE' | 'EEE' | 'CSE' | 'IT' | 'MECH' | 'CIVIL';
export type Gender = 'Male' | 'Female' | 'Other';
export type PlacementLabel = 'Placed' | 'Not Placed';
export type ConfidenceBand = 'High' | 'Medium' | 'Low';
export type Direction = 'positive' | 'negative';

export interface TopFactor {
  feature: string;
  impact: number; // e.g. +0.18 or -0.12
  direction: Direction;
  readableName?: string;
  category?: 'Academics' | 'Technical' | 'Soft Skills' | 'Experience' | 'Behavioral';
}

export interface CompanyEligibility {
  tierName: string;
  ctcRange: string;
  isEligible: boolean;
  unmetCriteria?: string[];
  sampleCompanies: string[];
}

export interface ImprovementStep {
  action: string;
  expectedDelta: number; // e.g. +0.14
  difficulty: 'Easy' | 'Moderate' | 'High Impact';
  category: string;
}

export interface PredictionResponse {
  probability: number; // 0 to 1
  label: PlacementLabel;
  confidence_band: ConfidenceBand;
  top_factors: TopFactor[];
  suggestions: string[];
  readiness_score?: number; // 0 to 100 overall readiness
  placement_tier?: string;
  confidence_interval?: [number, number]; // [lower, upper]
  company_eligibility?: CompanyEligibility[];
  optimal_steps?: ImprovementStep[];
}

// Exactly specified student fields
export interface StudentRecord {
  student_id: string;
  department: Department;
  gender: Gender;
  cgpa: number; // 0 - 10
  tenth_percentage: number; // 0 - 100
  twelfth_percentage: number; // 0 - 100
  aptitude_score: number; // 0 - 100
  technical_score: number; // 0 - 100
  communication_score: number; // 0 - 100
  programming_score: number; // 0 - 100
  internships: number; // >= 0
  projects: number; // >= 0
  certifications: number; // >= 0
  hackathon_participation: number; // >= 0
  backlogs: number; // >= 0
  attendance_percentage: number; // 0 - 100
  interview_score: number; // 0 - 100
  extracurricular_activities: number; // count or score >= 0
  placed: 0 | 1;

  // UI / Display metadata for rich ERP experience
  name: string;
  email: string;
  batch: string; // e.g., '2025'
  avatarUrl?: string;
  mentorName?: string;
  mentorNotes?: MentoringNote[];
  predictedProbability?: number;
  predictedLabel?: PlacementLabel;
}

export interface MentoringNote {
  id: string;
  date: string;
  author: string;
  authorRole: string;
  category: 'Academics' | 'Interview Prep' | 'Backlog Clearance' | 'Motivation' | 'Skills';
  note: string;
  actionItem?: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface PredictionRequest {
  department: Department;
  gender: Gender;
  cgpa: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  aptitude_score: number;
  technical_score: number;
  communication_score: number;
  programming_score: number;
  internships: number;
  projects: number;
  certifications: number;
  hackathon_participation: number;
  backlogs: number;
  attendance_percentage: number;
  interview_score: number;
  extracurricular_activities: number;
}

export interface AnalyticsSummary {
  totalStudents: number;
  placedCount: number;
  historicalPlacementRate: number;
  predictedPlacementRate: number;
  atRiskCount: number;
  averageCgpa: number;
  modelAccuracy: number;
  placementByDepartment: {
    department: Department;
    total: number;
    placed: number;
    rate: number;
    benchmarkRate: number;
  }[];
  scoreDistributions: {
    range: string;
    cgpaCount: number;
    aptitudeCount: number;
    technicalCount: number;
    programmingCount: number;
  }[];
  backlogImpact: {
    backlogs: string;
    total: number;
    placedRate: number;
  }[];
  placementFunnel: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  confusionMatrix: {
    actualPlaced: { predPlaced: number; predNotPlaced: number };
    actualNotPlaced: { predPlaced: number; predNotPlaced: number };
  };
  featureImportanceImpurity: { feature: string; importance: number; category: string }[];
  featureImportancePermutation: { feature: string; importance: number; category: string }[];
  classBalance: { label: string; count: number; percentage: number }[];
  fairnessByGender: {
    gender: Gender;
    total: number;
    placed: number;
    placementRate: number;
    parityRatio: number;
  }[];
  fairnessByDepartment: {
    department: Department;
    total: number;
    placed: number;
    placementRate: number;
  }[];
  metadata: {
    algorithm: string;
    syntheticSamplesCount: number;
    modelVersion: string;
    trainedDate: string;
    crossValidationFolds: number;
  };
}

export type UserRole = 'Placement Officer' | 'Faculty' | 'Student';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department; // for Faculty
  studentId?: string; // for Student
}

