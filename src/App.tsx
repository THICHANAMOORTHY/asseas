import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthRoleProvider, useAuthRole } from './context/AuthRoleContext';
import { FilterProvider } from './context/FilterContext';

// Layout components
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { SyntheticBanner } from './components/shared/SyntheticNotice';
import { StudentDetailDrawer } from './components/student/StudentDetailDrawer';
import { StudentRecord } from './api/types';

// Route-level code splitting with React.lazy
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const RegisterStudent = lazy(() => import('./pages/RegisterStudent'));
const LoginRoleSelect = lazy(() => import('./pages/LoginRoleSelect').then(m => ({ default: m.LoginRoleSelect })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const StudentDirectory = lazy(() => import('./pages/StudentDirectory').then(m => ({ default: m.StudentDirectory })));
const StudentProfile = lazy(() => import('./pages/StudentProfile').then(m => ({ default: m.StudentProfile })));
const PredictionStudio = lazy(() => import('./pages/PredictionStudio').then(m => ({ default: m.PredictionStudio })));
const AtRiskMentoring = lazy(() => import('./pages/AtRiskMentoring').then(m => ({ default: m.AtRiskMentoring })));
const ModelInsights = lazy(() => import('./pages/ModelInsights').then(m => ({ default: m.ModelInsights })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const CampusDrives = lazy(() => import('./pages/CampusDrives').then(m => ({ default: m.CampusDrives })));
const SupabaseCloudHub = lazy(() => import('./pages/SupabaseCloudHub').then(m => ({ default: m.SupabaseCloudHub })));
const SettingsDataDict = lazy(() => import('./pages/SettingsDataDict').then(m => ({ default: m.SettingsDataDict })));
const CareerRecommendations = lazy(() => import('./pages/CareerRecommendations').then(m => ({ default: m.CareerRecommendations })));
const PredictionHistory = lazy(() => import('./pages/PredictionHistory').then(m => ({ default: m.PredictionHistory })));

const queryClient = new QueryClient();

// Class ErrorBoundary to catch any React rendering crash and present a friendly recover UI
interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CampusHire UI Caught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F6FC] text-[#1D1745] flex items-center justify-center p-6">
          <div className="bg-white border border-[#E8E5F5] rounded-3xl p-8 max-w-lg w-full shadow-xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-[#D94343] flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-[#29136F]">CampusHire AI Recovery Screen</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An unexpected render issue was safely intercepted:
            </p>
            <pre className="p-3 bg-gray-50 text-left font-mono text-[11px] text-rose-600 rounded-xl overflow-x-auto border border-gray-100 max-h-40">
              {this.state.error?.message || 'Unknown runtime error'}
            </pre>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  localStorage.removeItem('campushire_active_user');
                  window.location.href = '/';
                }}
                className="px-4 py-2 rounded-xl bg-[#29136F] text-[#FFC20E] font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Reset Session & Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-gray-100 text-[#1D1745] font-semibold text-xs hover:bg-gray-200 transition-colors"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageLoader: React.FC = () => (
  <div className="p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
    <div className="h-9 bg-secondary/80 rounded w-1/4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-secondary/60 rounded-xl" />
      ))}
    </div>
    <div className="h-80 bg-secondary/50 rounded-xl" />
  </div>
);

// Dynamic Home Route: student sees profile directly, officer/faculty sees analytics dashboard
const HomeRoute: React.FC<{ onOpenDrawer?: (s: StudentRecord) => void }> = ({ onOpenDrawer }) => {
  const { isStudent } = useAuthRole();
  if (isStudent) {
    return <StudentProfile />;
  }
  return <Dashboard onSelectStudent={onOpenDrawer} />;
};

// Main Layout Shell with responsive Sidebar, TopBar, and Drawer
const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global student drawer state for quick search lookup
  const [drawerStudent, setDrawerStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenStudentDrawer = (student: StudentRecord) => {
    setDrawerStudent(student);
    setDrawerOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top persistent synthetic educational alert */}
        <SyntheticBanner />

        {/* Header TopBar */}
        <TopBar
          onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenStudentDetail={handleOpenStudentDrawer}
        />

        {/* Scrollable Viewport with Suspense fallback and Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet context={{ onOpenDrawer: handleOpenStudentDrawer }} />
          </Suspense>
        </main>
      </div>

      {/* Slide-over Detail Drawer triggered by global search or row click */}
      <StudentDetailDrawer
        student={drawerStudent}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthRoleProvider>
          <FilterProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Standalone Full-Page Routes */}
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/login-quick" element={<LoginRoleSelect />} />
                  <Route path="/register" element={<RegisterStudent />} />

                  {/* Main App Layout Shell Routes with Outlet */}
                  <Route element={<AppLayout />}>
                    <Route index element={<HomeRoute />} />
                    <Route path="students" element={<StudentDirectory />} />
                    <Route path="students/:id" element={<StudentProfile />} />
                    <Route path="student-profile" element={<StudentProfile />} />
                    <Route path="predict" element={<PredictionStudio />} />
                    <Route path="recommendations" element={<CareerRecommendations />} />
                    <Route path="history" element={<PredictionHistory />} />
                    <Route path="at-risk" element={<AtRiskMentoring />} />
                    <Route path="model" element={<ModelInsights />} />
                    <Route path="drives" element={<CampusDrives />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="cloud-status" element={<SupabaseCloudHub />} />
                    <Route path="settings" element={<SettingsDataDict />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </FilterProvider>
        </AuthRoleProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
