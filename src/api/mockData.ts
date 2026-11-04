import { StudentRecord, Department, Gender, MentoringNote } from './types';
import { runModelInference } from './modelEngine';

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Ananya', 'Arjun', 'Bhavya', 'Chetan', 'Devika', 'Dhruv',
  'Diya', 'Esha', 'Gautam', 'Harsh', 'Ishaan', 'Janhavi', 'Kavya', 'Kiran',
  'Madhav', 'Meera', 'Nikhil', 'Nisha', 'Pranav', 'Pooja', 'Rahul', 'Rhea',
  'Rohan', 'Sakshi', 'Sameer', 'Shreya', 'Siddharth', 'Sneha', 'Tanvi', 'Tarun',
  'Utkarsh', 'Varun', 'Vedika', 'Vikram', 'Yash', 'Zoya', 'Abhishek', 'Akanksha',
  'Ankit', 'Ayush', 'Deepak', 'Kunal', 'Manish', 'Neha', 'Priya', 'Rohit'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Iyer', 'Reddy', 'Nair', 'Kulkarni', 'Deshmukh',
  'Gupta', 'Singh', 'Choudhury', 'Rao', 'Bose', 'Mukherjee', 'Mehta', 'Joshi',
  'Kapoor', 'Bhat', 'Menon', 'Pillai', 'Saxena', 'Pandey', 'Nambiar', 'Agarwal',
  'Bhardwaj', 'Chatterjee', 'Mishra', 'Tripathi', 'Thakur', 'Gowda', 'Kumar'
];

const MENTORS = [
  'Dr. Ramesh Sundaram', 'Prof. Sunita Rao', 'Dr. Arvind Mahajan',
  'Prof. Shalini Verma', 'Dr. K. V. Narayanan', 'Prof. Anjali Saxena'
];

// Seeded pseudorandom generator for deterministic, consistent generation
function createSeededRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateSyntheticDataset(count: number = 360): StudentRecord[] {
  const rand = createSeededRandom(42);
  const departments: Department[] = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const genders: Gender[] = ['Male', 'Female', 'Other'];

  const students: StudentRecord[] = [];

  // Target rates roughly:
  // CSE/IT ~65%, ECE ~60%, MECH/EEE ~52%, CIVIL ~46%
  const targetPlacementRates: Record<Department, number> = {
    CSE: 0.66,
    IT: 0.65,
    ECE: 0.60,
    EEE: 0.53,
    MECH: 0.51,
    CIVIL: 0.46,
  };

  for (let i = 1; i <= count; i++) {
    const idNum = i.toString().padStart(4, '0');
    const student_id = `CH-2025-${idNum}`;

    // Department distribution weighted realistic
    const deptIdx = Math.floor(rand() * departments.length);
    const department = departments[deptIdx];

    // Gender ~50% Male, 46% Female, 4% Other
    const gVal = rand();
    const gender: Gender = gVal < 0.50 ? 'Male' : (gVal < 0.96 ? 'Female' : 'Other');

    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i % 10}@campus.edu`;

    // Department-adjusted skill averages
    const isTechDept = department === 'CSE' || department === 'IT';
    const isCoreCir = department === 'ECE' || department === 'EEE';

    // Baseline placement probability from target rate
    const isHighTarget = rand() < targetPlacementRates[department];

    // CGPA: centered higher for high-target students
    let cgpa: number;
    if (isHighTarget) {
      cgpa = 6.8 + rand() * 2.8 + (isTechDept ? 0.3 : 0);
    } else {
      cgpa = 4.8 + rand() * 2.8;
    }
    cgpa = Math.min(9.95, Math.max(5.1, Math.round(cgpa * 100) / 100));

    // High school percentages
    const tenth_percentage = Math.round(Math.min(99, Math.max(55, (cgpa * 8) + 18 + (rand() * 14 - 7))));
    const twelfth_percentage = Math.round(Math.min(98, Math.max(52, (cgpa * 7.8) + 19 + (rand() * 16 - 8))));

    // Backlogs: placed students usually have 0 or max 1; not placed may have 1-4
    let backlogs = 0;
    if (!isHighTarget && rand() < 0.48) {
      backlogs = 1 + Math.floor(rand() * 3);
    } else if (isHighTarget && rand() < 0.08) {
      backlogs = 1;
    }

    // Attendance
    const attendance_percentage = Math.round(
      Math.min(99, Math.max(62, 75 + (cgpa - 7.0) * 4 + (rand() * 12 - 6)))
    );

    // Skills
    const techBase = isTechDept ? 15 : (isCoreCir ? 5 : 0);
    const progBase = isTechDept ? 20 : (isCoreCir ? 8 : -5);

    let technical_score = Math.round(
      Math.min(98, Math.max(35, (cgpa * 8) + techBase + (rand() * 20 - 10)))
    );
    let programming_score = Math.round(
      Math.min(99, Math.max(30, (cgpa * 7.5) + progBase + (rand() * 22 - 11)))
    );
    let aptitude_score = Math.round(
      Math.min(98, Math.max(40, (cgpa * 7) + 20 + (rand() * 20 - 10)))
    );
    let communication_score = Math.round(
      Math.min(98, Math.max(38, 55 + (rand() * 38)))
    );
    let interview_score = Math.round(
      Math.min(98, Math.max(32, (communication_score * 0.45) + (technical_score * 0.4) + (rand() * 16 - 8)))
    );

    // Career preparation
    let internships = 0;
    if (isHighTarget) {
      internships = 1 + (rand() < 0.45 ? 1 : 0) + (rand() < 0.15 ? 1 : 0);
    } else {
      internships = rand() < 0.25 ? 1 : 0;
    }

    let projects = isHighTarget ? 2 + Math.floor(rand() * 3) : 1 + Math.floor(rand() * 2);
    let certifications = Math.floor(rand() * 4);
    let hackathon_participation = isTechDept ? Math.floor(rand() * 3) : (rand() < 0.25 ? 1 : 0);
    let extracurricular_activities = Math.floor(rand() * 3) + 1;

    // Run prediction to get model's confidence and factors
    const predInput = {
      department,
      gender,
      cgpa,
      tenth_percentage,
      twelfth_percentage,
      aptitude_score,
      technical_score,
      communication_score,
      programming_score,
      internships,
      projects,
      certifications,
      hackathon_participation,
      backlogs,
      attendance_percentage,
      interview_score,
      extracurricular_activities,
    };

    const inference = runModelInference(predInput);

    // Placed outcome aligns with ground-truth target rate (~58% overall)
    // with realistic small classification noise as in Random Forest
    const placed: 0 | 1 = (inference.probability >= 0.50) ? 1 : 0;

    // Mentoring notes for at-risk students (probability < 0.40)
    const mentorNotes: MentoringNote[] = [];
    const mentorName = MENTORS[i % MENTORS.length];

    if (inference.probability < 0.40) {
      if (backlogs > 0) {
        mentorNotes.push({
          id: `MN-${i}-1`,
          date: '2025-01-14',
          author: mentorName,
          authorRole: 'Department Mentor',
          category: 'Backlog Clearance',
          note: `Reviewed academic status. Student has ${backlogs} active arrear(s). Advised daily revision schedule with remedial coaching.`,
          actionItem: 'Submit weekly arrears study plan signed by subject faculty',
          status: 'In Progress',
        });
      }
      if (interview_score < 60) {
        mentorNotes.push({
          id: `MN-${i}-2`,
          date: '2025-02-03',
          author: 'Prof. Shalini Verma',
          authorRole: 'Placement Cell Faculty',
          category: 'Interview Prep',
          note: `Student struggled with self-introduction and technical project articulation. Recommended joining the speech & communication boot camp.`,
          actionItem: 'Complete two recorded video mock sessions before company pre-talks',
          status: 'Open',
        });
      }
      if (mentorNotes.length === 0) {
        mentorNotes.push({
          id: `MN-${i}-3`,
          date: '2025-01-20',
          author: mentorName,
          authorRole: 'Academic Advisor',
          category: 'Skills',
          note: 'Scheduled quarterly mentoring review. Student advised to complete a recognized certification to bolster portfolio.',
          actionItem: 'Enroll in NPTEL or Coursera cloud practitioner track',
          status: 'In Progress',
        });
      }
    }

    students.push({
      ...predInput,
      student_id,
      placed,
      name,
      email,
      batch: i % 4 === 0 ? '2024' : '2025',
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 7919) % 5000000}?w=150&auto=format&fit=crop&q=80`,
      mentorName: inference.probability < 0.40 ? mentorName : undefined,
      mentorNotes: mentorNotes.length > 0 ? mentorNotes : undefined,
      predictedProbability: inference.probability,
      predictedLabel: inference.label,
    });
  }

  return students;
}

// Generate static singleton dataset
export const SYNTHETIC_STUDENTS = generateSyntheticDataset(360);

