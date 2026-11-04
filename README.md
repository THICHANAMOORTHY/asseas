# CampusHire — College Placement Prediction & Analytics System

CampusHire is an enterprise-grade university placement prediction, analytics, and student coaching web platform. It equips college Placement Cells, Department Coordinators, and Engineering Students with machine-learning-driven placement likelihood estimations, SHAP-style factor attributions, at-risk early intervention rosters, and actionable career improvement plans.

> **Synthetic Educational Data Notice**: All 5,000 underlying student records, grades, assessments, and model weights are synthetic and calibrated for educational modeling and demonstration. Predictions represent statistical probabilities rather than hiring commitments.

---

## 1. Design Rationale & Architecture

### User Goals & Personas
1. **Placement Officer (Campus Admin)**
   - **Goal**: Full strategic oversight of campus-wide hiring trends, cross-branch conversion funnels, model audits, and official accreditation reports.
   - **Key Views**: Executive Dashboard, Full Student Directory (360+ records), ML Model Diagnostics, Department Reports Studio.
2. **Faculty / Department Coordinator**
   - **Goal**: Identify vulnerable students in their department early, understand root causes (active backlogs, low mock scores), and assign mentors with concrete remedial action items.
   - **Key Views**: Department-Scoped Dashboard, Prioritized At-Risk Watchlist (Probability < 40%), Mentoring Notes Log.
3. **Student Candidate**
   - **Goal**: Check individual placement readiness, view what factors raised or lowered their odds, and test hypothetical interventions ("What if I clear my backlog and raise coding score from 50 to 75?").
   - **Key Views**: Personal Placement Profile, Interactive What-If Prediction Studio, Competency Radar.

### Design Tokens & System
- **Institutional Trust Palette**: Deep Indigo primary (`hsl(221, 83%, 42%)`), Slate neutrals, and Teal accents.
- **Accessible Semantic Feedback**: Success (Emerald), Warning (Amber), and Danger (Rose) paired with iconography and text labels to satisfy WCAG AA contrast without relying on color alone.
- **Tabular Figures**: Tabular numerals enabled via `font-variant-numeric: tabular-nums` for crisp numeric comparisons in data tables and KPI cards.
- **Ethical Safeguards**: Short "How to Read Predictions" modal/collapsible banner, non-discrimination guarantee (Gender excluded from recommendation heuristics), and demographic fairness auditing panel.

---

## 2. Tech Stack

- **Frontend Core**: React 18, Vite 5, TypeScript 5.6
- **Routing**: React Router v6 (with route-level code splitting via `React.lazy` and `Suspense`)
- **State & Data**: TanStack Query (React Query v5), React Hook Form, Zod validation
- **Design & Primitives**: Tailwind CSS, Radix UI primitives (Dialog, Slider, Tabs, Tooltip, Progress, Separator, Popover)
- **Data Visualization**: Recharts (Scatter, Composed, Bar, Radar, Donut, Funnel stages)
- **Data Grid**: TanStack Table v8 (server-style pagination, column visibility, sorting, multi-filtering, row selection, CSV export)
- **Icons**: Lucide React

---

## 3. Getting Started & Scripts

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### Installation
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Compile TypeScript and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 4. Canonical Data Contract

All data adheres to the exact 19 specified fields:

| Field | Type | Range / Options | Role in ML Inference |
|---|---|---|---|
| `student_id` | string | `CH-YYYY-XXXX` | Primary Key / Identifier |
| `department` | enum | `ECE` \| `EEE` \| `CSE` \| `IT` \| `MECH` \| `CIVIL` | Academic Branch Stratification |
| `gender` | enum | `Male` \| `Female` \| `Other` | Demographic Parity Audit (Excluded from penalty) |
| `cgpa` | float | `0.00 – 10.00` | High Positive Predictor (Weight ~0.28) |
| `tenth_percentage` | float | `0.0 – 100.0` | Academic Foundation Baseline |
| `twelfth_percentage` | float | `0.0 – 100.0` | Academic Foundation Baseline |
| `aptitude_score` | float | `0.0 – 100.0` | Screening Test Predictor |
| `technical_score` | float | `0.0 – 100.0` | Core Technical Assessment |
| `communication_score`| float | `0.0 – 100.0` | Verbal & Presentation Skills |
| `programming_score` | float | `0.0 – 100.0` | Coding & Data Structures (High Driver) |
| `internships` | integer | `>= 0` | Practical Experience Multiplier |
| `projects` | integer | `>= 0` | Major Project Capstones |
| `certifications` | integer | `>= 0` | Industry Verified Credentials |
| `hackathon_participation`| integer | `>= 0` | Practical Innovation Driver |
| `backlogs` | integer | `>= 0` | Strong Negative Gatekeeper Arrears |
| `attendance_percentage` | float | `0.0 – 100.0` | Behavioral & Engagement Metric |
| `interview_score` | float | `0.0 – 100.0` | Placement Mock Interview Performance |
| `extracurricular_activities`| integer | `>= 0` | Holistic Candidate Factor |
| `placed` | integer | `0` or `1` | Ground-Truth Binary Target (1 = Placed) |

---

## 5. FastAPI Backend API Contract

CampusHire is architected with a typed abstraction layer in `src/api/client.ts`. To wire this frontend to a live FastAPI / Scikit-learn backend, implement the following endpoints:

### 1. `POST /predict`
Evaluates a single student profile and returns probability, binary classification label, confidence band, SHAP factor impacts, and actionable suggestions.

#### Request Body (`application/json`):
```json
{
  "department": "CSE",
  "gender": "Female",
  "cgpa": 8.45,
  "tenth_percentage": 90.0,
  "twelfth_percentage": 88.5,
  "aptitude_score": 82.0,
  "technical_score": 85.0,
  "communication_score": 78.0,
  "programming_score": 88.0,
  "internships": 2,
  "projects": 3,
  "certifications": 2,
  "hackathon_participation": 1,
  "backlogs": 0,
  "attendance_percentage": 91.0,
  "interview_score": 80.0,
  "extracurricular_activities": 2
}
```

#### Response (`200 OK`):
```json
{
  "probability": 0.884,
  "label": "Placed",
  "confidence_band": "High",
  "readiness_score": 87,
  "top_factors": [
    {
      "feature": "cgpa",
      "impact": 0.22,
      "direction": "positive",
      "readableName": "Cumulative GPA (CGPA)",
      "category": "Academics"
    },
    {
      "feature": "programming_score",
      "impact": 0.18,
      "direction": "positive",
      "readableName": "Coding & Data Structures",
      "category": "Technical"
    },
    {
      "feature": "backlogs",
      "impact": 0.08,
      "direction": "positive",
      "readableName": "Clean Record (Zero Arrears)",
      "category": "Academics"
    }
  ],
  "suggestions": [
    "Maintain strong academic momentum and focus on domain-specific system design interview rounds.",
    "Prepare tailored presentations for your capstone project and highlight leadership experiences."
  ]
}
```

### 2. `GET /students`
Query directory students with pagination, sorting, search, and multi-filters.

#### Query Parameters:
- `search` (string): matches name, email, or student_id
- `department` (string): `ECE | EEE | CSE | IT | MECH | CIVIL | ALL`
- `gender` (string): `Male | Female | Other | ALL`
- `placed` (string): `ALL | PLACED | NOT_PLACED`
- `backlogs` (string): `ALL | CLEAN | HAS_BACKLOGS`
- `batch` (string): `ALL | 2024 | 2025`
- `riskLevel` (string): `ALL | AT_RISK | SAFE` (at-risk: probability < 0.40)
- `sortField` (string): field name to sort on
- `sortOrder` (string): `asc | desc`
- `page` (integer): default 1
- `pageSize` (integer): default 10

#### Response (`200 OK`):
```json
{
  "data": [ /* Array of StudentRecord objects */ ],
  "total": 360,
  "page": 1,
  "pageSize": 10,
  "totalPages": 36
}
```

### 3. `GET /students/{id}`
Returns full record and mentoring history for a single candidate.

### 4. `POST /students/{id}/notes`
Logs a new counseling or faculty mentoring note.
```json
{
  "author": "Prof. Sunita Rao",
  "authorRole": "Department Coordinator",
  "category": "Backlog Clearance",
  "note": "Advised daily revision schedule with remedial coaching.",
  "actionItem": "Submit study plan signed by subject faculty",
  "status": "In Progress"
}
```

### 5. `GET /analytics/summary`
Returns aggregate statistics, KPI benchmarks, department conversion rates, score distributions, and conversion funnel.

#### Query Parameters:
- `department` (string, optional)
- `batch` (string, optional)

#### Response (`200 OK`):
```json
{
  "totalStudents": 360,
  "placedCount": 211,
  "historicalPlacementRate": 0.586,
  "predictedPlacementRate": 0.586,
  "atRiskCount": 74,
  "averageCgpa": 7.28,
  "modelAccuracy": 0.848,
  "placementByDepartment": [
    { "department": "CSE", "total": 115, "placed": 76, "rate": 0.66, "benchmarkRate": 0.65 }
  ],
  "scoreDistributions": [ /* Binned histograms */ ],
  "backlogImpact": [
    { "backlogs": "0 Backlogs", "total": 278, "placedRate": 0.76 },
    { "backlogs": "1 Backlog", "total": 52, "placedRate": 0.38 },
    { "backlogs": "2 Backlogs", "total": 20, "placedRate": 0.16 },
    { "backlogs": "3+ Backlogs", "total": 10, "placedRate": 0.05 }
  ],
  "placementFunnel": [
    { "stage": "Total Cohort", "count": 360, "percentage": 100 },
    { "stage": "Criteria Eligible", "count": 298, "percentage": 83 },
    { "stage": "Assessment Shortlisted", "count": 242, "percentage": 67 },
    { "stage": "Offers Extended (Placed)", "count": 211, "percentage": 59 }
  ]
}
```

### 6. `GET /model/metrics`
Returns validation evaluation metrics, confusion matrix, feature importances (MDI vs Permutation), and demographic parity fairness auditing.

---

## 6. Swapping Mock Data for Live FastAPI Backend

To switch from the client-side simulation engine to a live FastAPI service:

1. Create a `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
2. In `src/api/client.ts`, toggle the backend fetch implementation:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

   export const campusApi = {
     async predict(request: PredictionRequest): Promise<PredictionResponse> {
       if (API_BASE_URL) {
         const res = await fetch(`${API_BASE_URL}/predict`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(request),
         });
         return res.json();
       }
       return runModelInference(request);
     },
     // Same for getStudents, getAnalyticsSummary, and getModelMetrics...
   };
   ```

---

## 7. Next Testing & Verification Roadmap

### Usability Checks
1. **Student Self-Improvement Loop**: Test whether a student exploring the Prediction Studio understands how to move from 48% to 75% odds by testing realistic improvements (e.g., +1 internship, clearing 1 backlog).
2. **Faculty Actionability**: Verify that Department Coordinators can filter at-risk students, view the exact reason chips (e.g. "2 active backlogs"), and log an action note in under 30 seconds.
3. **Role Switching Experience**: Ensure seamless transition between Placement Officer, Faculty, and Student personas without broken states.

### Accessibility Audit (WCAG AA Compliance)
1. **Screen Reader Verification**: Test all SVG gauges (`role="meter"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`) with NVDA or VoiceOver.
2. **Color Blindness Simulation**: Confirm that charts and status badges remain fully distinguishable using Protanopia and Deuteranopia filters (utilizing shape patterns, badges, and textual labels in addition to colors).
3. **Keyboard Navigability**: Verify full tab navigation across data tables, slide-over drawer focus traps, and slider inputs.

### Edge Cases
1. **Extreme Academic Outliers**: High CGPA (9.8) with 3 active backlogs (should trigger high-risk gatekeeper flag despite high grades).
2. **Zero Experience Profiles**: Candidate with zero internships, zero projects, and zero certifications (evaluates fallback baseline guidance).
3. **Empty Filter Sets**: Filtering by combinations yielding 0 results renders clear empty state cards with a single-click "Reset Filters" action.

