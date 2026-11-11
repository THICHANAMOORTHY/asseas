// Test Gemini Career Advisor live end-to-end call
const EMBEDDED_KEY_B64 = 'QVEuQWI4Uk42TGpsdjBBcFV4ZlI3WTc2LVN2Rmp4MWEtblZBMkxHQWhmTWViNDBkbzJTQXc=';
const apiKey = Buffer.from(EMBEDDED_KEY_B64, 'base64').toString('utf8');

const testStudent = {
  student_id: 'EASA-CSE-2024-001',
  name: 'Lokesh',
  department: 'CSE',
  batch: '2024',
  cgpa: 8.2,
  tenth_percentage: 85,
  twelfth_percentage: 82,
  backlogs: 0,
  attendance_percentage: 90,
  programming_score: 80,
  technical_score: 78,
  aptitude_score: 75,
  communication_score: 85,
  interview_score: 80,
  internships: 1,
  projects: 2,
  certifications: 1,
  hackathon_participation: 1,
};

async function testLiveCareerAdvisor() {
  console.log('Testing Gemini API integration...');
  const prompt = 'How do I crack technical rounds for campus placement drives?';
  
  const systemContext = `
You are the CampusHire AI Senior Placement & Career Advisor for EASA College of Engineering and Technology, Coimbatore.
You are counseling an engineering student in real-time.
Student: ${testStudent.name}, ${testStudent.department} Engineering, CGPA ${testStudent.cgpa}.
`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `SYSTEM INSTRUCTION:\n${systemContext}\nPlease acknowledge.` }]
    },
    {
      role: 'model',
      parts: [{ text: `Understood! I am your EASA College CampusHire AI Placement Advisor.` }]
    },
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-flash-latest'];
  for (const model of models) {
    const start = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 500 } })
      });
      const duration = Date.now() - start;
      if (res.ok) {
        const json = await res.json();
        const reply = json.candidates[0].content.parts[0].text;
        console.log(`\n=== GEMINI API STATUS: 100% OPERATIONAL ===`);
        console.log(`Model Used: ${model}`);
        console.log(`Latency:    ${duration}ms`);
        console.log(`Response Snippet:\n${reply.slice(0, 350)}...\n`);
        return true;
      } else {
        const err = await res.text();
        console.log(`Model ${model} returned ${res.status}: ${err.slice(0, 80)}`);
      }
    } catch (e) {
      console.log(`Error calling ${model}:`, e.message);
    }
  }
  return false;
}

testLiveCareerAdvisor();
