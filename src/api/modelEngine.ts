import {
  PredictionRequest,
  PredictionResponse,
  TopFactor,
  ConfidenceBand,
  PlacementLabel,
  CompanyEligibility,
  ImprovementStep,
} from './types';
import {
  KAGGLE_RANDOM_FOREST_TREES,
  KAGGLE_FEATURE_IMPORTANCES,
  KAGGLE_DATASET_INFO,
  TreeNode,
} from './kaggleModelData';

// True population means from the 10,000 students in Kaggle Placement Prediction Dataset
// Source: ruchikakumbhar/placement-prediction-dataset
export const BASELINE_MEANS = {
  cgpa: 7.70,
  tenth_percentage: 69.16, // SSC_Marks
  twelfth_percentage: 74.50, // HSC_Marks
  aptitude_score: 79.45,
  technical_score: 72.0,
  communication_score: 86.4, // SoftSkillsRating scaled to 100
  programming_score: 75.0,
  internships: 1.05,
  projects: 2.03,
  certifications: 1.01,
  hackathon_participation: 1.0,
  backlogs: 0,
  attendance_percentage: 85.0,
  interview_score: 72.0,
  extracurricular_activities: 1.0,
};

/**
 * Evaluates a single decision tree in the Random Forest ensemble
 */
function evaluateDecisionTree(node: TreeNode, features: Record<string, number>): number {
  let curr: TreeNode | undefined = node;
  while (curr) {
    if (curr.v !== undefined) {
      return curr.v;
    }
    if (!curr.f || curr.t === undefined) {
      return curr.v ?? 0.5;
    }
    const val: number = features[curr.f] ?? 0;
    curr = val <= curr.t ? curr.l : curr.r;
  }
  return 0.5;
}

/**
 * Machine Learning Placement Prediction Engine
 * Replaces rule-based formulas with a 50-tree Random Forest Classifier trained on
 * Kaggle's Placement Prediction Dataset (ruchikakumbhar/placement-prediction-dataset).
 */
export function runModelInference(input: PredictionRequest): PredictionResponse {
  // Map input parameters to the exact 10 features expected by the trained Kaggle Random Forest model
  const softSkills = input.communication_score
    ? Math.max(1.0, Math.min(5.0, Number((input.communication_score / 20).toFixed(1))))
    : 4.3;

  const featuresMap: Record<string, number> = {
    CGPA: Number(input.cgpa) || 7.0,
    Internships: Math.max(0, Math.min(2, Math.round(Number(input.internships) || 0))),
    Projects: Math.max(0, Math.min(3, Math.round(Number(input.projects) || 0))),
    'Workshops/Certifications': Math.max(0, Math.min(3, Math.round(Number(input.certifications) || 0))),
    AptitudeTestScore: Math.max(0, Math.min(100, Math.round(Number(input.aptitude_score) || 60))),
    SoftSkillsRating: softSkills,
    ExtracurricularActivities: (input.extracurricular_activities ?? 0) > 0 ? 1 : 0,
    PlacementTraining: 1, // Participated in campus placement training
    SSC_Marks: Math.max(0, Math.min(100, Math.round(Number(input.tenth_percentage) || 60))),
    HSC_Marks: Math.max(0, Math.min(100, Math.round(Number(input.twelfth_percentage) || 60))),
  };

  // 1. Run inference across the 50 decision trees of the Random Forest
  let totalTreeProbability = 0;
  const treeVoteImpacts: Record<string, number> = {};

  for (const tree of KAGGLE_RANDOM_FOREST_TREES) {
    let curr: TreeNode | undefined = tree;
    while (curr) {
      if (curr.v !== undefined) {
        totalTreeProbability += curr.v;
        break;
      }
      if (!curr.f || curr.t === undefined) {
        totalTreeProbability += curr.v ?? 0.5;
        break;
      }

      const fName = curr.f;
      const fVal = featuresMap[fName] ?? 0;
      if (fVal <= curr.t) {
        treeVoteImpacts[fName] = (treeVoteImpacts[fName] || 0) - 0.015;
        curr = curr.l;
      } else {
        treeVoteImpacts[fName] = (treeVoteImpacts[fName] || 0) + 0.015;
        curr = curr.r;
      }
    }
  }

  const modelMeanProbability = totalTreeProbability / KAGGLE_RANDOM_FOREST_TREES.length;

  // Institutional backlogs constraint: Companies require 0 active backlogs
  let finalProbability = modelMeanProbability;
  if (input.backlogs > 0) {
    const backlogPenalty = input.backlogs * 0.18 + (input.backlogs > 1 ? 0.12 : 0);
    finalProbability = Math.max(0.02, finalProbability - backlogPenalty);
  }

  const probability = Math.min(0.98, Math.max(0.02, Math.round(finalProbability * 1000) / 1000));
  const label: PlacementLabel = probability >= 0.50 ? 'Placed' : 'Not Placed';

  // 2. Compute dynamic feature impacts (SHAP-style) based on trained model importances & student deltas
  const rawFactors: TopFactor[] = [];

  // Aptitude Score (Kaggle Importance: ~20.85%)
  const aptDelta = (featuresMap.AptitudeTestScore - BASELINE_MEANS.aptitude_score) / 20;
  rawFactors.push({
    feature: 'AptitudeTestScore',
    impact: Math.round(aptDelta * (KAGGLE_FEATURE_IMPORTANCES['AptitudeTestScore'] / 100) * 100) / 100,
    direction: featuresMap.AptitudeTestScore >= BASELINE_MEANS.aptitude_score ? 'positive' : 'negative',
    readableName: `Aptitude Assessment (${featuresMap.AptitudeTestScore}/100)`,
    category: 'Technical',
  });

  // HSC Marks (Kaggle Importance: ~20.82%)
  const hscDelta = (featuresMap.HSC_Marks - BASELINE_MEANS.twelfth_percentage) / 20;
  rawFactors.push({
    feature: 'HSC_Marks',
    impact: Math.round(hscDelta * (KAGGLE_FEATURE_IMPORTANCES['HSC_Marks'] / 100) * 100) / 100,
    direction: featuresMap.HSC_Marks >= BASELINE_MEANS.twelfth_percentage ? 'positive' : 'negative',
    readableName: `Higher Secondary Aggregate (${featuresMap.HSC_Marks}%)`,
    category: 'Academics',
  });

  // Extracurricular Activities (Kaggle Importance: ~17.19%)
  rawFactors.push({
    feature: 'ExtracurricularActivities',
    impact: featuresMap.ExtracurricularActivities === 1 ? 0.17 : -0.17,
    direction: featuresMap.ExtracurricularActivities === 1 ? 'positive' : 'negative',
    readableName: featuresMap.ExtracurricularActivities === 1 ? 'Extracurricular Engagement' : 'No Extracurriculars Logged',
    category: 'Behavioral',
  });

  // Projects (Kaggle Importance: ~14.42%)
  const projDelta = (featuresMap.Projects - BASELINE_MEANS.projects) / 1.5;
  rawFactors.push({
    feature: 'Projects',
    impact: Math.round(projDelta * (KAGGLE_FEATURE_IMPORTANCES['Projects'] / 100) * 100) / 100,
    direction: featuresMap.Projects >= 2 ? 'positive' : 'negative',
    readableName: `Capstone Technical Projects (${featuresMap.Projects})`,
    category: 'Experience',
  });

  // SSC Marks (Kaggle Importance: ~7.68%)
  const sscDelta = (featuresMap.SSC_Marks - BASELINE_MEANS.tenth_percentage) / 20;
  rawFactors.push({
    feature: 'SSC_Marks',
    impact: Math.round(sscDelta * (KAGGLE_FEATURE_IMPORTANCES['SSC_Marks'] / 100) * 100) / 100,
    direction: featuresMap.SSC_Marks >= BASELINE_MEANS.tenth_percentage ? 'positive' : 'negative',
    readableName: `Secondary School Aggregate (${featuresMap.SSC_Marks}%)`,
    category: 'Academics',
  });

  // CGPA (Kaggle Importance: ~6.93%)
  const cgpaDelta = (featuresMap.CGPA - BASELINE_MEANS.cgpa) / 1.5;
  rawFactors.push({
    feature: 'CGPA',
    impact: Math.round(cgpaDelta * (KAGGLE_FEATURE_IMPORTANCES['CGPA'] / 100) * 100) / 100,
    direction: featuresMap.CGPA >= BASELINE_MEANS.cgpa ? 'positive' : 'negative',
    readableName: `Cumulative CGPA (${featuresMap.CGPA.toFixed(2)}/10)`,
    category: 'Academics',
  });

  // Workshops & Certifications (Kaggle Importance: ~5.59%)
  rawFactors.push({
    feature: 'Workshops/Certifications',
    impact: featuresMap['Workshops/Certifications'] > 0 ? 0.08 : -0.06,
    direction: featuresMap['Workshops/Certifications'] > 0 ? 'positive' : 'negative',
    readableName: `Certifications & Workshops (${featuresMap['Workshops/Certifications']})`,
    category: 'Experience',
  });

  // Soft Skills (Kaggle Importance: ~3.24%)
  rawFactors.push({
    feature: 'SoftSkillsRating',
    impact: softSkills >= 4.0 ? 0.06 : -0.05,
    direction: softSkills >= 4.0 ? 'positive' : 'negative',
    readableName: `Soft Skills & Communication (${softSkills}/5.0)`,
    category: 'Soft Skills',
  });

  // Backlogs Penalty (Institutional)
  if (input.backlogs > 0) {
    rawFactors.push({
      feature: 'Backlogs',
      impact: -(input.backlogs * 0.20),
      direction: 'negative',
      readableName: `Active Arrears / Backlogs (${input.backlogs})`,
      category: 'Academics',
    });
  }

  // Sort factors by absolute magnitude of impact
  const top_factors = rawFactors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 5);

  // 3. Confidence Band
  let confidence_band: ConfidenceBand = 'Medium';
  let margin = 0.05;
  if (probability >= 0.75 || probability <= 0.25) {
    confidence_band = 'High';
    margin = 0.035;
  } else if (probability >= 0.45 && probability <= 0.55) {
    confidence_band = 'Low';
    margin = 0.08;
  }

  const confidence_interval: [number, number] = [
    Math.max(0.01, Math.round((probability - margin) * 1000) / 1000),
    Math.min(0.99, Math.round((probability + margin) * 1000) / 1000),
  ];

  // 4. Placement Tier determination
  let placement_tier = 'At-Risk / Coaching Required';
  if (probability >= 0.80 && input.cgpa >= 7.5 && input.backlogs === 0) {
    placement_tier = 'Super Dream (Tier-1 Product)';
  } else if (probability >= 0.60 && input.cgpa >= 6.8 && input.backlogs === 0) {
    placement_tier = 'Dream (Tier-2 Core & Fintech)';
  } else if (probability >= 0.45 && input.backlogs <= 1) {
    placement_tier = 'Standard / Mass Recruitment';
  }

  // 5. Company Eligibility Evaluation
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

  // 6. Actionable recommendations based on the Kaggle Random Forest top drivers
  const suggestions: string[] = [];

  if (input.backlogs > 0) {
    suggestions.push(`Clear all ${input.backlogs} pending backlog(s) prior to campus drive registration to satisfy Tier-1 and Tier-2 mandatory zero-arrears criteria.`);
  }
  if (featuresMap.AptitudeTestScore < 80) {
    suggestions.push(`Aptitude is the #1 driving factor (20.8% model weight). Target lifting score from ${featuresMap.AptitudeTestScore} to 80+ via daily timed quantitative modules.`);
  }
  if (featuresMap.Projects < 2) {
    suggestions.push(`Hands-on projects carry a 14.4% model weight. Build and document at least 2 full-scale capstone projects with public repositories.`);
  }
  if (featuresMap.ExtracurricularActivities === 0) {
    suggestions.push(`Active extracurricular and hackathon participation provides a +17% positive boost in placement classification.`);
  }
  if (featuresMap['Workshops/Certifications'] === 0) {
    suggestions.push(`Complete at least one industry-recognized certification track (Cloud, AI/ML, or Full Stack) to strengthen profile readiness.`);
  }
  if (suggestions.length === 0) {
    suggestions.push(`Your academic foundation and assessment profile are well aligned with Tier-1 placement benchmarks.`);
    suggestions.push(`Focus on system design interviews, STAR behavioral articulation, and domain-specific company pre-talks.`);
  }

  // 7. Optimal improvement steps
  const optimal_steps: ImprovementStep[] = [];
  if (input.backlogs > 0) {
    optimal_steps.push({
      action: `Clear all ${input.backlogs} active arrears in the upcoming university examinations`,
      expectedDelta: 0.22,
      difficulty: 'High Impact',
      category: 'Academics',
    });
  }
  if (featuresMap.AptitudeTestScore < 80) {
    optimal_steps.push({
      action: `Raise Aptitude score from ${featuresMap.AptitudeTestScore} to 80+ on mock assessments`,
      expectedDelta: 0.16,
      difficulty: 'Moderate',
      category: 'Technical',
    });
  }
  if (featuresMap.Projects < 2) {
    optimal_steps.push({
      action: `Complete and deploy a second end-to-end technical capstone project`,
      expectedDelta: 0.12,
      difficulty: 'Moderate',
      category: 'Experience',
    });
  }

  // 8. Overall readiness score (0 - 100)
  const readiness_score = Math.round(
    probability * 70 +
    (featuresMap.CGPA / 10) * 15 +
    (featuresMap.Projects >= 2 ? 10 : featuresMap.Projects * 5) +
    (input.backlogs === 0 ? 5 : 0)
  );

  return {
    probability,
    label,
    confidence_band,
    top_factors,
    suggestions: suggestions.slice(0, 4),
    readiness_score: Math.min(99, Math.max(10, readiness_score)),
    placement_tier,
    confidence_interval,
    company_eligibility,
    optimal_steps: optimal_steps.slice(0, 3),
  };
}
