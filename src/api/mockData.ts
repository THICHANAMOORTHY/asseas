import { StudentRecord, Department, Gender, MentoringNote } from './types';
import { runModelInference } from './modelEngine';

// Real Institutional Student Records from EASA College of Engineering and Technology
const BASE_REAL_STUDENTS: Array<Omit<StudentRecord, 'predictedProbability' | 'predictedLabel'>> = [
  {
    student_id: '720523106032',
    name: 'THICHANAMOORTHY THICHU',
    email: 'thichu683@gmail.com',
    department: 'ECE',
    gender: 'Male',
    batch: '2027',
    cgpa: 8.11,
    tenth_percentage: 100.0,
    twelfth_percentage: 69.6,
    aptitude_score: 66.0,
    technical_score: 75.0,
    communication_score: 70.0,
    programming_score: 78.0,
    internships: 2,
    projects: 7,
    certifications: 2,
    hackathon_participation: 2,
    backlogs: 0,
    attendance_percentage: 92.0,
    interview_score: 76.0,
    extracurricular_activities: 1,
    placed: 0,
    mentorName: 'Prof. K. Sundaram (EASA Placement Cell)',
    mentorNotes: [
      {
        id: 'MN-720523106032-1',
        date: '2026-11-01',
        author: 'Prof. K. Sundaram',
        authorRole: 'Placement Officer',
        category: 'Skills',
        note: 'Outstanding project portfolio (7 technical projects) and perfect 100% 10th standard record. Recommended targeting Tier-1 Core Embedded & ECE drives.',
        actionItem: 'Refine GitHub READMEs and STAR explanations for top 2 IoT/hardware projects',
        status: 'In Progress',
      },
    ],
  },
  {
    student_id: '720523106037',
    name: 'Thichu Thichana',
    email: '720523106032@ecetonline.com',
    department: 'ECE',
    gender: 'Male',
    batch: '2027',
    cgpa: 8.11,
    tenth_percentage: 100.0,
    twelfth_percentage: 71.2,
    aptitude_score: 70.0,
    technical_score: 76.0,
    communication_score: 72.0,
    programming_score: 75.0,
    internships: 2,
    projects: 7,
    certifications: 12,
    hackathon_participation: 3,
    backlogs: 0,
    attendance_percentage: 94.0,
    interview_score: 78.0,
    extracurricular_activities: 1,
    placed: 0,
    mentorName: 'Prof. Sunita Rao',
    mentorNotes: [
      {
        id: 'MN-720523106037-1',
        date: '2026-11-02',
        author: 'Prof. Sunita Rao',
        authorRole: 'Faculty Mentor',
        category: 'Skills',
        note: 'Exceptional certification record with 12 completed courses. Keep practicing timed aptitude rounds for dream companies.',
        actionItem: 'Complete mock technical interviews before upcoming drive registrations',
        status: 'In Progress',
      },
    ],
  },
  {
    student_id: '927621BCS088',
    name: 'Karthik Raja',
    email: 'karthik.raja@campus.edu',
    department: 'CSE',
    gender: 'Male',
    batch: '2025',
    cgpa: 8.45,
    tenth_percentage: 89.2,
    twelfth_percentage: 86.5,
    aptitude_score: 75.0,
    technical_score: 82.0,
    communication_score: 74.0,
    programming_score: 80.0,
    internships: 2,
    projects: 3,
    certifications: 2,
    hackathon_participation: 1,
    backlogs: 0,
    attendance_percentage: 88.0,
    interview_score: 78.0,
    extracurricular_activities: 1,
    placed: 1,
    mentorName: 'Dr. Vikramaditya Rao',
    mentorNotes: [
      {
        id: 'MN-927621BCS088-1',
        date: '2026-10-15',
        author: 'Dr. Vikramaditya Rao',
        authorRole: 'Head of Placement',
        category: 'Interview Prep',
        note: 'Cleared preliminary assessment rounds. Offer received from campus drive recruitment.',
        actionItem: 'Assist junior peer groups with mock coding mentoring',
        status: 'Resolved',
      },
    ],
  },
];

// Enrich with model inferences
export const REAL_STUDENTS: StudentRecord[] = BASE_REAL_STUDENTS.map((student) => {
  const inference = runModelInference(student);
  return {
    ...student,
    predictedProbability: inference.probability,
    predictedLabel: inference.label,
  };
});

// Provide backward compatibility while ensuring NO fake data is generated
export function generateSyntheticDataset(count: number = 3): StudentRecord[] {
  return [...REAL_STUDENTS];
}

export const SYNTHETIC_STUDENTS = REAL_STUDENTS;
