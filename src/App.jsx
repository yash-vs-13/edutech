import React, { lazy, Suspense, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './store/components/common/Layout';
import Loading from './store/components/common/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Terms = lazy(() => import('./pages/Terms'));
const PrivacyPolicy = lazy(() => import('./pages/Privacy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const CourseDetail = lazy(() => import('./store/components/courses/CourseDetail'));
const LessonView = lazy(() => import('./pages/LessonView'));
const Profile = lazy(() => import('./pages/Profile'));
const Help = lazy(() => import('./pages/Help'));
const FAQ = lazy(() => import('./pages/FAQ'));

// Component to redirect authenticated users away from auth pages
const PublicRoute = memo(({ children, allowAuth = false }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Only redirect if authenticated and auth is not allowed for this route
  if (isAuthenticated && !allowAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
});

PublicRoute.displayName = 'PublicRoute';

const App = memo(() => {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public routes (auth pages) */}
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <Suspense fallback={<Loading size="lg" fullPage={true} />}>
                  <SignIn />
                </Suspense>
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Suspense fallback={<Loading size="lg" fullPage={true} />}>
                  <SignUp />
                </Suspense>
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute allowAuth={true}>
                <Suspense fallback={<Loading size="lg" fullPage={true} />}>
                  <ForgotPassword />
                </Suspense>
              </PublicRoute>
            }
          />
          <Route
            path="/terms"
            element={
              <Suspense fallback={<Loading size="lg" fullPage={true} />}>
                <Terms />
              </Suspense>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <Suspense fallback={<Loading size="lg" fullPage={true} />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <Suspense fallback={<Loading size="lg" fullPage={true} />}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/my-courses" element={<MyCourses />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                        <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;