import React, { memo, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Card from '../store/components/common/Card';
import Modal from '../store/components/common/Modal';
import Button from '../store/components/common/Button';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// Custom Tooltip that follows cursor position - only shows when hovering directly on bar
const CustomTooltip = ({ active, payload, coordinate }) => {
  // Only show tooltip if active, payload exists, and has valid data with a value > 0
  if (active && payload && payload.length && payload[0] && payload[0].value > 0) {
    const categoryName = payload[0].payload?.name || '';
    const courseCount = payload[0].value || 0;

    // Get the chart container to calculate absolute position
    const chartContainer = document.querySelector('[class*="recharts-wrapper"]');
    let left = coordinate?.x || 0;
    let top = coordinate?.y || 0;

    if (chartContainer && coordinate) {
      const rect = chartContainer.getBoundingClientRect();
      left = rect.left + coordinate.x + 15; // Offset to the right of cursor
      top = rect.top + coordinate.y - 10; // Offset above cursor
    }

    return (
      <div
        className="bg-white rounded-lg shadow-lg border-none p-3 z-[999]"
        style={{
          position: 'fixed',
          left: `${left}px`,
          top: `${top}px`,
          transform: 'translateY(-100%)',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          pointerEvents: 'none',
        }}
      >
        <p className="text-sm font-semibold text-slate-800">
          {categoryName} : {courseCount} {courseCount === 1 ? 'course' : 'courses'}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = memo(() => {
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const enrollments = useSelector((state) => state.enrollments?.enrollments || []);
  const [showAllCoursesModal, setShowAllCoursesModal] = useState(false);
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);

  // 1. STATS CALCULATIONS
  const totalCourses = useMemo(() => (courses && Array.isArray(courses)) ? courses.length : 0, [courses]);

  const enrolledCoursesWithProgress = useMemo(() => {
    if (!user || !courses || !Array.isArray(courses) || courses.length === 0) return [];
    const userEnrollments = enrollments.filter((e) => e.userId === user.id);

    return courses
      .filter((course) => userEnrollments.some((e) => e.courseId === course.id))
      .map((course) => {
        const enrollment = userEnrollments.find((e) => e.courseId === course.id);
        const progress = enrollment?.progress || { completedLessons: [] };
        const totalLessons = course.sections?.reduce((total, s) => total + (s.lessons?.length || 0), 0) || 0;
        const completedLessons = progress.completedLessons?.length || 0;
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const isComplete = totalLessons > 0 && completedLessons === totalLessons;
        const lastAccessedAt = progress.lastAccessedAt || enrollment?.enrolledAt || null;

        return {
          ...course,
          enrollment,
          progress: { progressPercentage, totalLessons, completedLessons, isComplete },
          lastAccessedAt
        };
      })
      .sort((a, b) => b.progress.progressPercentage - a.progress.progressPercentage);
  }, [courses, enrollments, user]);

  // Recent courses sorted by last accessed date/time (most recent first)
  const recentCoursesWithProgress = useMemo(() => {
    return [...enrolledCoursesWithProgress]
      .sort((a, b) => {
        const dateA = a.lastAccessedAt ? new Date(a.lastAccessedAt) : new Date(0);
        const dateB = b.lastAccessedAt ? new Date(b.lastAccessedAt) : new Date(0);
        return dateB - dateA; // Most recent first
      })
      .slice(0, 3); // Get top 3 most recently accessed
  }, [enrolledCoursesWithProgress]);

  const myEnrolledCount = enrolledCoursesWithProgress.length;
  const completedCount = enrolledCoursesWithProgress.filter(c => c.progress.isComplete).length;
  const inProgressCount = myEnrolledCount - completedCount;

  // 2. CATEGORY DATA
  const categoryData = useMemo(() => {
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return [];
    }
    const counts = {};
    courses.forEach(c => {
      const cat = c.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [courses]);

  // 3. LEVEL DATA
  const levelData = useMemo(() => {
    const counts = { 'Beginner': 0, 'Intermediate': 0, 'Advanced': 0 };
    if (courses && Array.isArray(courses) && courses.length > 0) {
      courses.forEach(c => {
        const l = (c.difficulty || c.level || 'Beginner').toLowerCase();
        if (l.includes('beginner')) counts['Beginner']++;
        else if (l.includes('inter')) counts['Intermediate']++;
        else if (l.includes('adv')) counts['Advanced']++;
        else counts['Beginner']++; // Default
      });
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [courses]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const LEVEL_COLORS = { 'Beginner': '#10b981', 'Intermediate': '#f59e0b', 'Advanced': '#ef4444' };

  return (
    <div className="space-y-6 p-6 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, {user?.name || 'Explorer'}! Here's your current progress.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/courses">
            <Button variant="primary" size="sm" className="shadow-sm">Browse Courses</Button>
          </Link>
          <Link to="/my-courses">
            <Button variant="secondary" size="sm" className="shadow-sm">My Courses</Button>
          </Link>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="All Courses" value={totalCourses} icon="📚" color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="My Courses" value={myEnrolledCount} icon="🎓" color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatCard title="Completed" value={completedCount} icon="✅" color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard title="In Progress" value={inProgressCount} icon="⏳" color="text-amber-600" bgColor="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="border-b border-slate-50 flex justify-between items-center bg-white">
              <h2 className="font-bold text-slate-800">Recent Course Progress</h2>
              {enrolledCoursesWithProgress.length > 3 && (
                <button
                  onClick={() => setShowAllCoursesModal(true)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  View Full List
                </button>
              )}
            </div>
            <div className="p-0 bg-white">
              {enrolledCoursesWithProgress.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500 text-sm">You haven't started any courses yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentCoursesWithProgress.map(course => (
                    <div key={course.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <Link to={`/courses/${course.id}`} className="font-semibold text-sm text-slate-800 hover:text-primary-600 break-words max-w-[30ch] mr-4">
                          {course.title}
                        </Link>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.progress.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-100 text-primary-700'}`}>
                          {course.progress.isComplete ? 'COMPLETED' : `${course.progress.progressPercentage}%`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${course.progress.isComplete ? 'bg-emerald-500' : 'bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.3)]'}`}
                          style={{ width: `${course.progress.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Category Bar Chart */}
          <Card className="border-none shadow-sm p-4 bg-white flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800">Course Categorization</h2>
              {categoryData.length > 3 && (
                <button
                  onClick={() => setShowAllCategoriesModal(true)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  View Full List
                </button>
              )}
            </div>
            <div className="flex-1 w-full min-h-[180px]">
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No course categories available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.slice(0, 3)} layout="vertical" margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={false}
                      wrapperStyle={{ zIndex: 999 }}
                      isAnimationActive={false}
                      allowEscapeViewBox={{ x: true, y: true }}
                      shared={false}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                      isAnimationActive={false}
                    >
                      {categoryData.slice(0, 3).map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Level Distribution & Quick Actions */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm p-4 bg-white">
            <h2 className="font-bold text-slate-800 mb-2 text-center">Course Levels</h2>
            <div className="h-[240px] w-full relative">
              {levelData.length === 0 || levelData.every(entry => entry.value === 0) ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No course levels available
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={levelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {levelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={LEVEL_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 999 }}
                        wrapperStyle={{ zIndex: 999 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800">{totalCourses}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">Total Courses</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {levelData.map(l => (
                <div key={l.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: LEVEL_COLORS[l.name] }} />
                    <span className="text-slate-600 font-medium">{l.name}</span>
                  </div>
                  <span className="text-slate-400 font-bold">{l.value} courses</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-primary-600 to-indigo-700 p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Want to learn more?</h3>
              <p className="text-primary-100 text-xs mb-4 leading-relaxed">Explore courses and expand your skill set with guided paths.</p>
              <Link to="/courses">
                <button className="bg-white text-primary-600 px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-primary-50 transition-colors">
                  Explore Courses
                </button>
              </Link>
            </div>
            <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 rotate-12">🎓</div>
          </Card>
        </div>
      </div>

      <div className="pb-6"></div>

      {/* Progress Modal */}
      <Modal
        isOpen={showAllCoursesModal}
        onClose={() => setShowAllCoursesModal(false)}
        title="Full Enrollment Progress"
        size="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {enrolledCoursesWithProgress.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No enrollment data found.</p>
          ) : (
            <div className="space-y-4">
              {enrolledCoursesWithProgress.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800 text-sm">{c.title}</h4>
                    <span className="text-xs font-bold text-primary-600">{c.progress.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${c.progress.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{c.progress.completedLessons} / {c.progress.totalLessons} Lessons</span>
                    {c.progress.isComplete && <span className="text-emerald-600 font-bold">✓ COMPLETED</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Categories Modal */}
      <Modal
        isOpen={showAllCategoriesModal}
        onClose={() => setShowAllCategoriesModal(false)}
        title="All Course Categories"
        size="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {categoryData.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No category data found.</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <h4 className="font-bold text-slate-800 text-sm">{cat.name}</h4>
                  </div>
                  <span className="text-xs font-bold text-primary-600">{cat.value} course{cat.value !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
});

// Helper Components
const StatCard = ({ title, value, icon, color, bgColor }) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-white">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
        <p className={`text-2xl font-black ${color} leading-none`}>{value}</p>
      </div>
    </div>
  </Card>
);

Dashboard.displayName = 'Dashboard';

export default Dashboard;
