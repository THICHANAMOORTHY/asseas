import { getGeminiApiKey } from './geminiClient';

export interface QuizQuestion {
  id: string;
  type: 'aptitude' | 'soft_skills';
  subCategory: string;
  question: string;
  options: string[];
  correctIndex?: number; // For aptitude questions (0 to 3)
  scoringRatings?: number[]; // For soft skills questions: [5.0, 3.5, 2.0, 1.0]
  explanation: string;
}

export interface QuizResult {
  totalQuestions: number;
  aptitudeTotal: number;
  aptitudeCorrect: number;
  measuredAptitudeScore: number; // 0 to 100
  softSkillsTotal: number;
  measuredSoftSkillsRating: number; // 1.0 to 5.0
  measuredCommunicationScore: number; // 0 to 100 normalized
  strengths: string[];
  areasToImprove: string[];
  userAnswers: Record<string, number>;
  questions: QuizQuestion[];
}

export const CURATED_APTITUDE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'apt-1',
    type: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    question: 'A train 240 m long passes an electric pole in 24 seconds. How long will it take to pass a station platform 650 m long?',
    options: ['65 seconds', '89 seconds', '100 seconds', '150 seconds'],
    correctIndex: 1,
    explanation: 'Train speed = 240 / 24 = 10 m/s. Total distance to clear platform = 240 + 650 = 890 m. Time required = 890 / 10 = 89 seconds.',
  },
  {
    id: 'apt-2',
    type: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    question: 'If 12 men or 18 women can complete a development project in 14 days, in how many days can 8 men and 16 women finish the same project?',
    options: ['7 days', '9 days', '10 days', '12 days'],
    correctIndex: 1,
    explanation: '12 Men = 18 Women => 1 Man = 1.5 Women. 8 Men + 16 Women = (8 * 1.5) + 16 = 28 Women. Total work = 18 * 14 = 252 women-days. Days = 252 / 28 = 9 days.',
  },
  {
    id: 'apt-3',
    type: 'aptitude',
    subCategory: 'Logical Reasoning',
    question: 'In a certain coding system, "COMPUTER" is encoded as "RFUVQNPC". Following the same rule, how will "MEDICINE" be encoded?',
    options: ['EOJDJEFM', 'EOJDEJFM', 'MFEJDJOE', 'EOJDJEFN'],
    correctIndex: 0,
    explanation: 'Reverse the word except the first and last letters: C and R swap places. Each intermediate letter shifts forward by +1. MEDICINE yields EOJDJEFM.',
  },
  {
    id: 'apt-4',
    type: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    question: 'A sum of money invested at compound interest triples itself in 3 years. In how many years will it grow to 9 times the initial principal at the same rate?',
    options: ['6 years', '9 years', '12 years', '15 years'],
    correctIndex: 0,
    explanation: 'P triples to 3P in 3 years. In the next 3 years, 3P triples to 3 * 3P = 9P. Total time required = 3 + 3 = 6 years.',
  },
  {
    id: 'apt-5',
    type: 'aptitude',
    subCategory: 'Logical Reasoning',
    question: 'Pointing to a photograph of a student, Suresh said: "He is the son of the only son of my mother." How is Suresh related to the student in the photo?',
    options: ['Brother', 'Uncle', 'Cousin', 'Father'],
    correctIndex: 3,
    explanation: 'The only son of Suresh’s mother is Suresh himself. Therefore, the student in the photograph is Suresh’s son, making Suresh the Father.',
  },
  {
    id: 'apt-6',
    type: 'aptitude',
    subCategory: 'Data Interpretation',
    question: 'A retailer marks hardware components at 40% above cost price and offers a festival discount of 25% on the marked price. What is the net profit percentage?',
    options: ['5% Profit', '5% Loss', '15% Profit', '10% Loss'],
    correctIndex: 0,
    explanation: 'Let CP = 100. Marked Price = 140. Discount = 25% of 140 = 35. Selling Price = 140 - 35 = 105. Net Profit = 105 - 100 = 5%.',
  },
  {
    id: 'apt-7',
    type: 'aptitude',
    subCategory: 'Logical Reasoning',
    question: 'Find the missing number in the sequence: 4, 9, 25, 49, 121, ?',
    options: ['144', '169', '196', '225'],
    correctIndex: 1,
    explanation: 'The sequence consists of squares of consecutive prime numbers: 2²=4, 3²=9, 5²=25, 7²=49, 11²=121, next prime is 13² = 169.',
  },
  {
    id: 'apt-8',
    type: 'aptitude',
    subCategory: 'Quantitative Aptitude',
    question: 'Pipes A and B can fill an overhead water reservoir in 20 and 30 minutes respectively. If both valves open simultaneously, how many minutes will it take?',
    options: ['10 minutes', '12 minutes', '15 minutes', '25 minutes'],
    correctIndex: 1,
    explanation: 'Combined filling rate = 1/20 + 1/30 = (3+2)/60 = 5/60 = 1/12 tank/min. Time required = 12 minutes.',
  },
];

export const CURATED_SOFT_SKILLS_QUESTIONS: QuizQuestion[] = [
  {
    id: 'soft-1',
    type: 'soft_skills',
    subCategory: 'Team Collaboration & Conflict Resolution',
    question: 'During a final-year software capstone sprint, a teammate disagrees strongly with your chosen architecture and stops pushing code. What is your best course of action?',
    options: [
      'Report them immediately to the department placement coordinator and request a team change.',
      'Schedule a private 1-on-1, actively listen to their architectural concerns, and collaboratively benchmark both approaches against project latency and deadline constraints.',
      'Proceed independently with your architecture and complete their remaining assigned modules alone.',
      'Ignore the disagreement and ask another teammate to quietly complete their tasks.',
    ],
    scoringRatings: [2.0, 5.0, 3.0, 1.5],
    explanation: 'Empathetic listening paired with objective technical benchmarking de-escalates conflict constructively while preserving project velocity and team trust.',
  },
  {
    id: 'soft-2',
    type: 'soft_skills',
    subCategory: 'Professional Communication & Escalation',
    question: 'You discover that an important client demo is scheduled in 24 hours, but a key API dependency broke due to an upstream change. How do you communicate this?',
    options: [
      'Wait until the demo begins to explain why the feature is non-functional.',
      'Promptly notify your project manager and client, transparently explaining the root cause, providing a mockup/fallback demo plan, and giving an estimated fix time.',
      'Post a blunt complaint on social media about the third-party API provider.',
      'Cancel the meeting 5 minutes before without giving a technical reason.',
    ],
    scoringRatings: [1.0, 5.0, 1.5, 1.0],
    explanation: 'Proactive transparency combined with an immediate fallback plan protects credibility and client confidence in crisis scenarios.',
  },
  {
    id: 'soft-3',
    type: 'soft_skills',
    subCategory: 'Adaptability & Feedback Reception',
    question: 'In a mock technical interview, the panel gives direct feedback that your algorithm explanation lacked clarity and structured flow. How do you respond?',
    options: [
      'Argue that your code produced the correct output and the interviewer failed to follow your thinking.',
      'Acknowledge the critique gracefully, ask for specific examples of where articulation broke down, and practice structured frameworks like STAR and Top-Down explanation.',
      'Feel demoralized and avoid signing up for subsequent mock placement rounds.',
      'Stay silent during the feedback debrief and ignore the suggestions.',
    ],
    scoringRatings: [1.5, 5.0, 1.0, 2.0],
    explanation: 'A growth mindset coupled with active inquiry transforms critical critique into concrete interview performance gains.',
  },
  {
    id: 'soft-4',
    type: 'soft_skills',
    subCategory: 'Time Management & Prioritization',
    question: 'You have a semester exam in two days, an online campus assessment tomorrow evening, and an overdue lab record. How do you prioritize your time?',
    options: [
      'Focus exclusively on the semester exam and skip the company placement assessment.',
      'Deconstruct the commitments: finish the lab record during a scheduled free period, block 2 hours for high-yield assessment drills, and follow an organized revision plan for the exam.',
      'Panic and multitask haphazardly without completing any single task properly.',
      'Request medical exemption to delay all upcoming obligations.',
    ],
    scoringRatings: [2.5, 5.0, 1.5, 1.0],
    explanation: 'Systematic time-blocking and calm triage under pressure reflect high emotional resilience and executive functioning.',
  },
  {
    id: 'soft-5',
    type: 'soft_skills',
    subCategory: 'Leadership & Engineering Ethics',
    question: 'You discover a critical security vulnerability in an internal college portal module that your team built for an active hackathon. What is your responsibility?',
    options: [
      'Keep quiet until prizes are announced so the team does not forfeit standing.',
      'Immediately disclose the vulnerability responsibly to the judges and faculty coordinator along with a proof-of-concept mitigation fix.',
      'Share the vulnerability with peers so they can test it themselves.',
      'Delete the repository branch to conceal the bug.',
    ],
    scoringRatings: [1.5, 5.0, 1.0, 1.0],
    explanation: 'Ethical integrity and proactive disclosure demonstrate the engineering accountability that enterprise recruiters value most.',
  },
];

/**
 * Generates an assessment quiz (10 or 15 questions) using Gemini when available,
 * falling back seamlessly to the curated question bank.
 */
export async function generateAssessmentQuiz(
  department: string = 'Engineering',
  count: 10 | 15 = 10
): Promise<QuizQuestion[]> {
  const apiKey = getGeminiApiKey();

  // Try generating fresh questions via Gemini 3.5 Flash if available
  if (apiKey) {
    try {
      const aptitudeCount = Math.floor(count / 2);
      const softSkillsCount = count - aptitudeCount;

      const prompt = `
Generate an assessment quiz containing exactly ${count} multiple choice questions for a college campus placement diagnostic (${department} Engineering student).
Requirements:
1. Exactly ${aptitudeCount} Quantitative/Logical Aptitude questions with 4 options, an integer "correct_index" (0 to 3), and an "explanation".
2. Exactly ${softSkillsCount} Soft Skills & Workplace Situational Judgment questions with 4 options, an array "scoring_ratings" of 4 float numbers between 1.0 and 5.0 (e.g. [5.0, 3.5, 2.0, 1.0]) corresponding to the professional maturity of each option, and an "explanation".

Format strictly as JSON with key "questions":
{
  "questions": [
    {
      "id": "gen-1",
      "type": "aptitude",
      "subCategory": "Quantitative Aptitude",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 1,
      "explanation": "..."
    },
    {
      "id": "gen-2",
      "type": "soft_skills",
      "subCategory": "Team Collaboration",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "scoring_ratings": [5.0, 3.0, 2.0, 1.0],
      "explanation": "..."
    }
  ]
}
`.trim();

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 2500,
          },
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.questions) && parsed.questions.length >= count) {
            return parsed.questions.slice(0, count).map((q: any, idx: number) => ({
              id: q.id || `gen-${idx + 1}`,
              type: q.type === 'soft_skills' ? 'soft_skills' : 'aptitude',
              subCategory: q.subCategory || (q.type === 'soft_skills' ? 'Situational Judgment' : 'Quantitative Aptitude'),
              question: q.question,
              options: q.options || [],
              correctIndex: q.correct_index ?? 0,
              scoringRatings: q.scoring_ratings || [5.0, 3.5, 2.0, 1.0],
              explanation: q.explanation || '',
            }));
          }
        }
      }
    } catch (e) {
      // Fall through to curated bank on timeout or API error
    }
  }

  // Fallback to offline curated question bank
  const aptPool = [...CURATED_APTITUDE_QUESTIONS].sort(() => 0.5 - Math.random());
  const softPool = [...CURATED_SOFT_SKILLS_QUESTIONS].sort(() => 0.5 - Math.random());

  const aptCount = Math.floor(count / 2);
  const softCount = count - aptCount;

  const selectedApt = aptPool.slice(0, aptCount);
  const selectedSoft = softPool.slice(0, softCount);

  // Interleave questions for an engaging test flow
  const combined: QuizQuestion[] = [];
  const maxLen = Math.max(selectedApt.length, selectedSoft.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < selectedApt.length) combined.push(selectedApt[i]);
    if (i < selectedSoft.length) combined.push(selectedSoft[i]);
  }

  return combined;
}

/**
 * Computes diagnostic evaluation scores based on user answers
 */
export function evaluateQuizSubmission(
  questions: QuizQuestion[],
  answers: Record<string, number>
): QuizResult {
  let aptitudeTotal = 0;
  let aptitudeCorrect = 0;

  let softSkillsTotal = 0;
  let softSkillsScoreSum = 0;

  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  questions.forEach((q) => {
    const selectedIdx = answers[q.id];

    if (q.type === 'aptitude') {
      aptitudeTotal++;
      if (selectedIdx !== undefined && selectedIdx === q.correctIndex) {
        aptitudeCorrect++;
        if (!strengths.includes(q.subCategory)) {
          strengths.push(q.subCategory);
        }
      } else {
        if (!areasToImprove.includes(q.subCategory)) {
          areasToImprove.push(q.subCategory);
        }
      }
    } else if (q.type === 'soft_skills') {
      softSkillsTotal++;
      const ratings = q.scoringRatings || [5.0, 3.5, 2.0, 1.0];
      const rating = selectedIdx !== undefined ? ratings[selectedIdx] ?? 2.5 : 2.0;
      softSkillsScoreSum += rating;

      if (rating >= 4.0) {
        if (!strengths.includes(q.subCategory)) {
          strengths.push(q.subCategory);
        }
      } else {
        if (!areasToImprove.includes(q.subCategory)) {
          areasToImprove.push(q.subCategory);
        }
      }
    }
  });

  const measuredAptitudeScore = aptitudeTotal > 0
    ? Math.round((aptitudeCorrect / aptitudeTotal) * 100)
    : 70;

  const measuredSoftSkillsRating = softSkillsTotal > 0
    ? Number((softSkillsScoreSum / softSkillsTotal).toFixed(2))
    : 3.5;

  // Normalized to 0 - 100 scale: ((rating - 1.0) / 4.0) * 100
  const measuredCommunicationScore = Math.round(
    Math.max(0, Math.min(100, ((measuredSoftSkillsRating - 1.0) / 4.0) * 100))
  );

  return {
    totalQuestions: questions.length,
    aptitudeTotal,
    aptitudeCorrect,
    measuredAptitudeScore,
    softSkillsTotal,
    measuredSoftSkillsRating,
    measuredCommunicationScore,
    strengths: strengths.slice(0, 3),
    areasToImprove: areasToImprove.slice(0, 3),
    userAnswers: answers,
    questions,
  };
}

