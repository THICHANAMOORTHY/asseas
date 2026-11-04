import {
  PredictionRequest,
  PredictionResponse,
  TopFactor,
  ConfidenceBand,
  PlacementLabel,
  CompanyEligibility,
  ImprovementStep,
} from './types';

// Baseline averages from 5,000 synthetic dataset distribution
export const BASELINE_MEANS = {
  cgpa: 7.25,
  tenth_percentage: 78.4,
  twelfth_percentage: 76.1,
  aptitude_score: 68.2,
  technical_score: 66.5,
  communication_score: 70.1,
  programming_score: 64.8,
  internships: 0.95,
  projects: 1.85,
  certifications: 1.20,
  hackathon_participation: 0.65,
  backlogs: 0.45,
  attendance_percentage: 82.5,
  interview_score: 67.0,
  extracurricular_activities: 1.5,
};

// Coefficients reflecting Random Forest feature importances
// Note: Gender and Department are intentionally omitted from predictive penalties to follow ethical guidelines
const WEIGHTS = {
  cgpa: 0.28,
  technical_score: 0.22,
  programming_score: 0.20,
  backlogs: -0.35, // Strongest negative driver
  interview_score: 0.18,
  internships: 0.16,
  aptitude_score: 0.14,
  projects: 0.12,
  communication_score: 0.12,
  certifications: 0.08,
  attendance_percentage: 0.06,
  hackathon_participation: 0.07,
  twelfth_percentage: 0.05,
  tenth_percentage: 0.04,
  extracurricular_activities: 0.04,
};

export function runModelInference(input: PredictionRequest): PredictionResponse {
  let logit = 0.35; // base intercept yielding ~58% placement rate at baseline

  // Calculate contributions
  const rawFactors: TopFactor[] = [];

  // CGPA impact
  const cgpaDelta = (input.cgpa - BASELINE_MEANS.cgpa) / 1.5;
  const cgpaImpact = cgpaDelta * WEIGHTS.cgpa;
  logit += cgpaImpact * 2.5;
  rawFactors.push({
    feature: 'cgpa',
    impact: Math.round(cgpaImpact * 100) / 100,
    direction: cgpaImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Cumulative GPA (CGPA)',
    category: 'Academics',
  });

  // Technical & Programming impact
  const techDelta = (input.technical_score - BASELINE_MEANS.technical_score) / 20;
  const techImpact = techDelta * WEIGHTS.technical_score;
  logit += techImpact * 2.0;
  rawFactors.push({
    feature: 'technical_score',
    impact: Math.round(techImpact * 100) / 100,
    direction: techImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Technical Core Assessment',
    category: 'Technical',
  });

  const progDelta = (input.programming_score - BASELINE_MEANS.programming_score) / 20;
  const progImpact = progDelta * WEIGHTS.programming_score;
  logit += progImpact * 2.0;
  rawFactors.push({
    feature: 'programming_score',
    impact: Math.round(progImpact * 100) / 100,
    direction: progImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Coding & Data Structures',
    category: 'Technical',
  });

  // Backlogs penalty (exponential damping for 2+ backlogs)
  let backlogPenalty = 0;
  if (input.backlogs > 0) {
    backlogPenalty = input.backlogs * -0.22 - (input.backlogs > 1 ? 0.25 : 0);
  } else {
    backlogPenalty = 0.08; // Clean record bonus
  }
  logit += backlogPenalty * 2.2;
  rawFactors.push({
    feature: 'backlogs',
    impact: Math.round(backlogPenalty * 100) / 100,
    direction: backlogPenalty >= 0 ? 'positive' : 'negative',
    readableName: 'Active Backlog Arrears',
    category: 'Academics',
  });

  // Interview & Communication
  const interviewDelta = (input.interview_score - BASELINE_MEANS.interview_score) / 20;
  const interviewImpact = interviewDelta * WEIGHTS.interview_score;
  logit += interviewImpact * 1.8;
  rawFactors.push({
    feature: 'interview_score',
    impact: Math.round(interviewImpact * 100) / 100,
    direction: interviewImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Mock Interview Performance',
    category: 'Soft Skills',
  });

  const commDelta = (input.communication_score - BASELINE_MEANS.communication_score) / 20;
  const commImpact = commDelta * WEIGHTS.communication_score;
  logit += commImpact * 1.5;
  rawFactors.push({
    feature: 'communication_score',
    impact: Math.round(commImpact * 100) / 100,
    direction: commImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Communication & Verbal',
    category: 'Soft Skills',
  });

  // Internships & Projects
  const internDelta = (input.internships - BASELINE_MEANS.internships) / 1.0;
  const internImpact = internDelta * WEIGHTS.internships;
  logit += internImpact * 1.6;
  rawFactors.push({
    feature: 'internships',
    impact: Math.round(internImpact * 100) / 100,
    direction: internImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Industry Internships Completed',
    category: 'Experience',
  });

  const projDelta = (input.projects - BASELINE_MEANS.projects) / 1.5;
  const projImpact = projDelta * WEIGHTS.projects;
  logit += projImpact * 1.4;
  rawFactors.push({
    feature: 'projects',
    impact: Math.round(projImpact * 100) / 100,
    direction: projImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Capstone & Major Projects',
    category: 'Experience',
  });

  // Aptitude
  const aptDelta = (input.aptitude_score - BASELINE_MEANS.aptitude_score) / 20;
  const aptImpact = aptDelta * WEIGHTS.aptitude_score;
  logit += aptImpact * 1.5;
  rawFactors.push({
    feature: 'aptitude_score',
    impact: Math.round(aptImpact * 100) / 100,
    direction: aptImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Quantitative & Analytical Aptitude',
    category: 'Technical',
  });

  // Attendance & Secondary
  const attDelta = (input.attendance_percentage - BASELINE_MEANS.attendance_percentage) / 15;
  const attImpact = attDelta * WEIGHTS.attendance_percentage;
  logit += attImpact * 1.0;
  rawFactors.push({
    feature: 'attendance_percentage',
    impact: Math.round(attImpact * 100) / 100,
    direction: attImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Semester Class Attendance',
    category: 'Behavioral',
  });

  // Hackathons & Certifications
  const certDelta = (input.certifications - BASELINE_MEANS.certifications) / 1.0;
  const certImpact = certDelta * WEIGHTS.certifications;
  logit += certImpact * 1.0;
  rawFactors.push({
    feature: 'certifications',
    impact: Math.round(certImpact * 100) / 100,
    direction: certImpact >= 0 ? 'positive' : 'negative',
    readableName: 'Industry Certifications',
    category: 'Experience',
  });

  // Sigmoid conversion to probability
  const rawProb = 1 / (1 + Math.exp(-logit));
  const probability = Math.min(0.98, Math.max(0.04, Math.round(rawProb * 1000) / 1000));
  const label: PlacementLabel = probability >= 0.5 ? 'Placed' : 'Not Placed';

  // Confidence band calculation
  let confidence_band: ConfidenceBand = 'Medium';
  let margin = 0.055;
  if (probability >= 0.78 || probability <= 0.28) {
    confidence_band = 'High';
    margin = 0.038;
  } else if (probability >= 0.45 && probability <= 0.55) {
    confidence_band = 'Low';
    margin = 0.075;
  }

  const confidence_interval: [number, number] = [
    Math.max(0.02, Math.round((probability - margin) * 1000) / 1000),
    Math.min(0.99, Math.round((probability + margin) * 1000) / 1000),
  ];

  // Placement Tier determination
  let placement_tier = 'At-Risk / Coaching Required';
  if (probability >= 0.80 && input.cgpa >= 7.8 && input.programming_score >= 75 && input.backlogs === 0) {
    placement_tier = 'Super Dream (Tier-1 Product)';
  } else if (probability >= 0.65 && input.cgpa >= 7.0 && input.backlogs === 0) {
    placement_tier = 'Dream (Tier-2 Core & Fintech)';
  } else if (probability >= 0.50 && input.backlogs <= 1) {
    placement_tier = 'Standard / Mass Recruitment';
  }

  // Company Eligibility Evaluation
  const company_eligibility: CompanyEligibility[] = [
    {
      tierName: 'Tier-1 Product & Tech Giants',
      ctcRange: '₹14 – 28 LPA',
      sampleCompanies: ['Google', 'Microsoft', 'Amazon', 'Atlassian', 'Adobe'],
      isEligible: input.cgpa >= 7.5 && input.backlogs === 0 && input.programming_score >= 75,
      unmetCriteria: [
        ...(input.cgpa < 7.5 ? [`Min CGPA 7.5 (Current: ${input.cgpa})`] : []),
        ...(input.backlogs > 0 ? [`Zero Backlogs Required (${input.backlogs} active)`] : []),
        ...(input.programming_score < 75 ? [`Min Coding Score 75+ (Current: ${input.programming_score})`] : []),
      ],
    },
    {
      tierName: 'Fintech & Core Engineering',
      ctcRange: '₹8 – 14 LPA',
      sampleCompanies: ['Goldman Sachs', 'Morgan Stanley', 'Qualcomm', 'Cisco'],
      isEligible: input.cgpa >= 7.0 && input.backlogs === 0 && input.technical_score >= 65,
      unmetCriteria: [
        ...(input.cgpa < 7.0 ? [`Min CGPA 7.0 (Current: ${input.cgpa})`] : []),
        ...(input.backlogs > 0 ? [`Zero Backlogs Required (${input.backlogs} active)`] : []),
        ...(input.technical_score < 65 ? [`Min Technical 65+ (Current: ${input.technical_score})`] : []),
      ],
    },
    {
      tierName: 'Global IT Consultancies & Services',
      ctcRange: '₹4.5 – 7.5 LPA',
      sampleCompanies: ['TCS Digital', 'Infosys', 'Cognizant', 'Accenture', 'Wipro'],
      isEligible: input.cgpa >= 6.0 && input.backlogs <= 1 && input.aptitude_score >= 55,
      unmetCriteria: [
        ...(input.cgpa < 6.0 ? [`Min CGPA 6.0 (Current: ${input.cgpa})`] : []),
        ...(input.backlogs > 1 ? [`Max 1 Active Backlog (${input.backlogs} active)`] : []),
        ...(input.aptitude_score < 55 ? [`Min Aptitude 55+ (Current: ${input.aptitude_score})`] : []),
      ],
    },
  ];

  // Optimal Next Steps for Goal-Seek
  const optimal_steps: ImprovementStep[] = [];
  if (input.backlogs > 0) {
    optimal_steps.push({
      action: `Clear all ${input.backlogs} active backlogs before campus placement drive window`,
      expectedDelta: Math.min(0.28, input.backlogs * 0.12),
      difficulty: 'High Impact',
      category: 'Academics',
    });
  }
  if (input.programming_score < 75) {
    optimal_steps.push({
      action: `Raise coding & DSA score from ${input.programming_score} to 75+ via LeetCode practice`,
      expectedDelta: 0.14,
      difficulty: 'Moderate',
      category: 'Technical',
    });
  }
  if (input.interview_score < 75) {
    optimal_steps.push({
      action: `Complete placement cell mock interviews to raise interview score from ${input.interview_score} to 75+`,
      expectedDelta: 0.10,
      difficulty: 'Easy',
      category: 'Soft Skills',
    });
  }
  if (input.internships === 0) {
    optimal_steps.push({
      action: 'Complete at least one verified industry internship or live open-source project',
      expectedDelta: 0.09,
      difficulty: 'Moderate',
      category: 'Experience',
    });
  }
  if (input.aptitude_score < 70) {
    optimal_steps.push({
      action: `Improve quantitative aptitude mock scores from ${input.aptitude_score} to 70+`,
      expectedDelta: 0.07,
      difficulty: 'Easy',
      category: 'Technical',
    });
  }

  // Sort factors by absolute impact descending
  const sortedFactors = [...rawFactors].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  const top_factors = sortedFactors.slice(0, 6);

  // Generate actionable, non-jargon suggestions (strictly avoiding gender)
  const suggestions: string[] = [];

  if (input.backlogs > 0) {
    suggestions.push(`Clear all ${input.backlogs} pending backlogs before the upcoming campus recruitment drives to satisfy mandatory corporate zero-backlog eligibility criteria.`);
  }
  if (input.programming_score < 70) {
    suggestions.push(`Strengthen core algorithms and data structures on LeetCode/HackerRank. Target raising programming score from ${input.programming_score} to 75+ for Day-1 tech assessments.`);
  }
  if (input.internships === 0) {
    suggestions.push(`Complete at least one 6-8 week verified industry internship or open-source contribution to demonstrate practical production experience.`);
  }
  if (input.interview_score < 70) {
    suggestions.push(`Participate in placement cell mock HR & technical interview rounds to practice the STAR method and improve interview confidence score (currently ${input.interview_score}/100).`);
  }
  if (input.aptitude_score < 65) {
    suggestions.push(`Complete weekly timed quantitative and logical aptitude mock modules to clear initial screening benchmarks.`);
  }
  if (input.projects < 2) {
    suggestions.push(`Build and deploy a full-stack or hardware capstone project with public GitHub documentation and live demo.`);
  }
  if (input.communication_score < 65) {
    suggestions.push(`Join peer group discussion practice sessions to enhance spontaneous articulation and technical presentation skills.`);
  }
  if (suggestions.length === 0) {
    suggestions.push(`Maintain strong academic momentum (CGPA ${input.cgpa}) and focus on domain-specific system design interview rounds.`);
    suggestions.push(`Prepare tailored presentations for your capstone project and highlight leadership experiences.`);
  }

  // Overall readiness index (0-100 scale)
  const readiness_score = Math.round(
    (input.cgpa * 10) * 0.25 +
    input.technical_score * 0.2 +
    input.programming_score * 0.2 +
    input.interview_score * 0.15 +
    input.aptitude_score * 0.1 +
    (input.backlogs === 0 ? 10 : Math.max(0, 10 - input.backlogs * 5))
  );

  return {
    probability,
    label,
    confidence_band,
    top_factors,
    suggestions: suggestions.slice(0, 4),
    readiness_score: Math.min(99, Math.max(12, readiness_score)),
    placement_tier,
    confidence_interval,
    company_eligibility,
    optimal_steps: optimal_steps.slice(0, 3),
  };
}
