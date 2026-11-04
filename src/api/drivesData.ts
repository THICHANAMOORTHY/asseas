import { Department } from './types';

export interface CampusDrive {
  id: string;
  companyName: string;
  logoText: string;
  logoBg: string;
  role: string;
  ctc: string; // e.g. "₹18 - 24 LPA"
  tier: 'Tier-1 Product' | 'Fintech & Core' | 'Global IT' | 'Core Engineering';
  eligibleDepartments: Department[];
  minCgpa: number;
  maxBacklogs: number;
  minProgrammingScore: number;
  driveDate: string;
  deadline: string;
  openings: number;
  location: string;
  selectionRounds: string[];
  status: 'Registration Open' | 'Shortlisting' | 'Assessment Scheduled' | 'Completed';
}

export const CAMPUS_DRIVES: CampusDrive[] = [
  {
    id: 'DRV-2025-01',
    companyName: 'Microsoft Corporation',
    logoText: 'MSFT',
    logoBg: 'bg-blue-600',
    role: 'Software Development Engineer (SDE-1)',
    ctc: '₹24.5 LPA',
    tier: 'Tier-1 Product',
    eligibleDepartments: ['CSE', 'IT', 'ECE'],
    minCgpa: 8.0,
    maxBacklogs: 0,
    minProgrammingScore: 80,
    driveDate: '2025-03-15',
    deadline: '2025-03-05',
    openings: 18,
    location: 'Hyderabad / Bangalore',
    selectionRounds: ['Online Coding (3 DSA Qs)', 'Tech Round 1 (Data Structures)', 'Tech Round 2 (System Design)', 'HR & Leadership'],
    status: 'Registration Open',
  },
  {
    id: 'DRV-2025-02',
    companyName: 'Goldman Sachs',
    logoText: 'GS',
    logoBg: 'bg-sky-700',
    role: 'Engineering Summer Analyst / Associate',
    ctc: '₹22.0 LPA',
    tier: 'Fintech & Core',
    eligibleDepartments: ['CSE', 'IT', 'ECE', 'EEE'],
    minCgpa: 7.5,
    maxBacklogs: 0,
    minProgrammingScore: 75,
    driveDate: '2025-03-20',
    deadline: '2025-03-10',
    openings: 14,
    location: 'Bangalore',
    selectionRounds: ['Aptitude & Math Screener', 'DSA Assessment', 'System & Algorithmic Interview', 'Culture Fit'],
    status: 'Registration Open',
  },
  {
    id: 'DRV-2025-03',
    companyName: 'Qualcomm India',
    logoText: 'QCOM',
    logoBg: 'bg-indigo-700',
    role: 'Hardware Systems & Firmware Engineer',
    ctc: '₹16.8 LPA',
    tier: 'Fintech & Core',
    eligibleDepartments: ['ECE', 'EEE', 'CSE'],
    minCgpa: 7.2,
    maxBacklogs: 0,
    minProgrammingScore: 68,
    driveDate: '2025-03-28',
    deadline: '2025-03-15',
    openings: 22,
    location: 'Hyderabad / Chennai',
    selectionRounds: ['Digital Electronics & C Assessment', 'Architecture Interview', 'Domain Viva', 'HR Round'],
    status: 'Registration Open',
  },
  {
    id: 'DRV-2025-04',
    companyName: 'TCS Digital (Tata Consultancy Services)',
    logoText: 'TCS',
    logoBg: 'bg-slate-800',
    role: 'Systems Engineer — Digital Innovation',
    ctc: '₹7.5 LPA',
    tier: 'Global IT',
    eligibleDepartments: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'],
    minCgpa: 6.5,
    maxBacklogs: 1,
    minProgrammingScore: 60,
    driveDate: '2025-04-05',
    deadline: '2025-03-22',
    openings: 85,
    location: 'Pan India (Multiple Hubs)',
    selectionRounds: ['TCS National Qualifier Test (NQT)', 'Technical Interview', 'Managerial & HR'],
    status: 'Registration Open',
  },
  {
    id: 'DRV-2025-05',
    companyName: 'Larsen & Toubro (L&T Core)',
    logoText: 'L&T',
    logoBg: 'bg-amber-700',
    role: 'Graduate Engineer Trainee (GET)',
    ctc: '₹6.8 LPA',
    tier: 'Core Engineering',
    eligibleDepartments: ['MECH', 'CIVIL', 'EEE', 'ECE'],
    minCgpa: 6.5,
    maxBacklogs: 0,
    minProgrammingScore: 40,
    driveDate: '2025-04-12',
    deadline: '2025-03-25',
    openings: 35,
    location: 'Mumbai / Chennai / Vadodara',
    selectionRounds: ['Domain Technical Test', 'Group Discussion', 'Technical Viva', 'Personal Interview'],
    status: 'Registration Open',
  },
  {
    id: 'DRV-2025-06',
    companyName: 'Amazon Development Centre',
    logoText: 'AMZN',
    logoBg: 'bg-orange-600',
    role: 'Quality Assurance & SDE Intern',
    ctc: '₹20.0 LPA',
    tier: 'Tier-1 Product',
    eligibleDepartments: ['CSE', 'IT', 'ECE'],
    minCgpa: 7.8,
    maxBacklogs: 0,
    minProgrammingScore: 78,
    driveDate: '2025-04-20',
    deadline: '2025-04-02',
    openings: 20,
    location: 'Hyderabad / Bangalore',
    selectionRounds: ['Online Assessment (Debugging + Coding)', 'Leadership Principles Interview', 'Data Structures Bar-Raiser'],
    status: 'Shortlisting',
  },
];

