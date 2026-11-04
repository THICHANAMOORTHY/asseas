import { StudentRecord, PredictionResponse } from './types';

// Default Gemini API key provided by user (with fallback to env and localStorage)
const FALLBACK_DEFAULT_KEY = '';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export function getGeminiApiKey(): string {
  // 1. Check user override in localStorage
  try {
    const local = localStorage.getItem('campushire_gemini_api_key');
    if (local && local.trim().length > 10 && !local.startsWith('YOUR_')) {
      return local.trim();
    }
  } catch (e) {
    // localStorage might fail in restricted environments
  }

  // 2. Check Vite env variable
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 10 && !envKey.startsWith('YOUR_')) {
      return envKey.trim();
    }
  } catch (e) {}

  // 3. Fallback to active system key
  return FALLBACK_DEFAULT_KEY;
}

export function setGeminiApiKey(key: string): void {
  const cleaned = (key || '').trim();
  if (cleaned) {
    localStorage.setItem('campushire_gemini_api_key', cleaned);
  } else {
    localStorage.removeItem('campushire_gemini_api_key');
  }
}

export function isGeminiConfigured(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 10 && !key.startsWith('YOUR_'));
}

export function buildStudentCareerContext(
  student: StudentRecord,
  prediction?: PredictionResponse | null
): string {
  const dept = student.department || 'Engineering';
  const cgpa = student.cgpa ?? 'N/A';
  const tenth = student.tenth_percentage ?? 'N/A';
  const twelfth = student.twelfth_percentage ?? 'N/A';
  const backlogs = student.backlogs ?? 0;
  const attendance = student.attendance_percentage ?? 'N/A';

  const dsa = student.programming_score ?? 'N/A';
  const technical = student.technical_score ?? 'N/A';
  const aptitude = student.aptitude_score ?? 'N/A';
  const communication = student.communication_score ?? 'N/A';
  const interview = student.interview_score ?? 'N/A';

  const internships = student.internships ?? 0;
  const projects = student.projects ?? 0;
  const certs = student.certifications ?? 0;
  const hackathons = student.hackathon_participation ?? 0;

  let mlSummary = 'Inference pending';
  let probability = 'N/A';
  let readiness = 'N/A';
  let shapDrivers = 'None recorded';

  if (prediction) {
    mlSummary = prediction.label;
    probability = `${Math.round(prediction.probability * 100)}%`;
    readiness = `${prediction.readiness_score ?? 'N/A'}/100`;
    if (prediction.top_factors && prediction.top_factors.length > 0) {
      shapDrivers = prediction.top_factors
        .slice(0, 4)
        .map(
          (f) =>
            `${f.readableName || f.feature} (${f.impact >= 0 ? '+' : ''}${f.impact.toFixed(2)})`
        )
        .join('; ');
    }
  }

  return `
You are the CampusHire AI Senior Placement & Career Advisor for EASA College of Engineering and Technology, Coimbatore.
You are counseling an engineering student in real-time.

STUDENT PROFILE CONTEXT (EASA College of Engineering & Technology):
- Name: ${student.name}
- Student ID: ${student.student_id}
- Discipline: ${dept} Engineering (Class of ${student.batch})
- Cumulative CGPA: ${cgpa}/10.0 | Active Arrears: ${backlogs} | Attendance: ${attendance}%
- Secondary School Baseline: Class 10: ${tenth}% | Class 12: ${twelfth}%
- Core Assessment Competencies (0–100):
  * Programming & DSA: ${dsa}/100
  * Technical Engineering: ${technical}/100
  * Aptitude & Logical Reasoning: ${aptitude}/100
  * Verbal & Communication: ${communication}/100
  * Mock Interview Poise: ${interview}/100
- Practical Portfolio: ${internships} Internship(s), ${projects} Capstone Project(s), ${certs} Certifications, ${hackathons} Hackathons

MACHINE LEARNING PREDICTION OUTCOME (Random Forest Model):
- Predicted Status: ${mlSummary}
- Placement Probability: ${probability}
- Overall Career Readiness Score: ${readiness}
- Top Feature Drivers (SHAP TreeExplainer): ${shapDrivers}

ADVISOR GUIDELINES & INSTITUTIONAL BENCHMARKS:
1. Provide personalized, highly practical, and step-by-step career recommendations specifically tailored for ${dept} Engineering students at EASA College.
2. If their CGPA < 7.0 or Backlogs > 0, highlight clearing arrears first and qualifying for Tier 3 / Mass Recruitment drives (TCS, Wipro, Infosys, Cognizant) before targeting Dream tiers.
3. If Programming & DSA < 65, outline a structured 30-day LeetCode / GeeksforGeeks plan (Arrays, Strings, HashMaps, Two Pointers).
4. If Aptitude < 70, prescribe daily quantitative and logical reasoning drills (RS Aggarwal, IndiaBIX, speed math).
5. If Interview or Communication score < 70, teach the STAR framework (Situation, Task, Action, Result) for behavioral and technical rounds.
6. Emphasize that the Random Forest predictions are diagnostic educational benchmarks designed to steer their preparation roadmap.
7. Format responses with clean Markdown: bold key metrics, use bulleted lists, and numbered action steps. Keep the tone inspiring, professional, and rigorous.
`.trim();
}

export async function askCareerAdvisor(
  userMessage: string,
  history: Array<{ role: 'user' | 'model'; content: string }>,
  student: StudentRecord,
  prediction?: PredictionResponse | null
): Promise<{ success: boolean; reply: string; modelUsed?: string; error?: string }> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      success: false,
      reply:
        '⚠️ **Google Gemini API Key Required**\n\nPlease configure your Gemini API Key in the chat settings to enable real-time personalized AI counseling.',
    };
  }

  const systemContext = buildStudentCareerContext(student, prediction);

  // Build Gemini contents array
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // 1. Initial System Context Instruction
  contents.push({
    role: 'user',
    parts: [
      {
        text: `SYSTEM INSTRUCTION & STUDENT PROFILE:\n${systemContext}\n\nPlease acknowledge your role as EASA College Senior Placement Advisor and confirm you will tailor your advice to my specific profile.`,
      },
    ],
  });
  contents.push({
    role: 'model',
    parts: [
      {
        text: `Understood! I am your EASA College CampusHire AI Senior Placement Advisor. I have analyzed your complete academic record (${student.department} Engineering, CGPA ${student.cgpa}), your assessment scores, and your Random Forest placement readiness model. How can I guide your placement preparation today?`,
      },
    ],
  });

  // 2. Append prior conversation history (keep last 8 turns)
  if (history && history.length > 0) {
    const recent = history.slice(-8);
    for (const turn of recent) {
      if (turn.content && turn.content.trim()) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content.trim() }],
        });
      }
    }
  }

  // 3. Current user prompt
  contents.push({
    role: 'user',
    parts: [{ text: userMessage.trim() }],
  });

  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ];

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
      topP: 0.95,
    },
  };

  let lastError = '';

  for (const modelName of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const resData = await response.json();
        const candidates = resData?.candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0]?.content?.parts;
          if (parts && parts.length > 0 && parts[0].text) {
            return {
              success: true,
              reply: parts[0].text,
              modelUsed: modelName,
            };
          }
        }
        return {
          success: false,
          reply: 'I received an empty response from the AI model. Please try asking again.',
          error: 'Empty candidates',
        };
      }

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        let errJson: any = {};
        try {
          errJson = await response.json();
        } catch (e) {}
        const msg = errJson?.error?.message || response.statusText;
        return {
          success: false,
          error: msg,
          reply: `⚠️ **Gemini API Error (${response.status}):**\n\n${msg}\n\nPlease verify that your Gemini API key has active quotas at Google AI Studio.`,
        };
      }

      lastError = `HTTP ${response.status}: ${response.statusText}`;
      // Continue to next model
    } catch (err: any) {
      lastError = err?.message || 'Network request failed';
      break;
    }
  }

  return {
    success: false,
    error: lastError,
    reply: `⚠️ Could not reach Gemini service (${lastError}). Please check your internet connection or API key.`,
  };
}
