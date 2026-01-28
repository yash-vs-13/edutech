import React, { memo, useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Card from '../store/components/common/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = memo(() => {
  const { courses } = useSelector((state) => state.courses);
  const { enrollments } = useSelector((state) => state.enrollments);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('cms_users') || '[]');
    setUsers(storedUsers);
  }, []);

  const coursePriceData = useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    return courses.map((course) => ({
      name: course.title?.substring(0, 15) || 'Course',
      price: course.price || 0,
    }));
  }, [courses]);

  const enrollmentTrend = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return [];
    const monthlyData = {};
    enrollments.forEach((enrollment) => {
      const date = new Date(enrollment.enrolledAt || enrollment.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return Object.entries(monthlyData).map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  const categoryDistribution = useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    const categoryCount = {};
    courses.forEach((course) => {
      categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
    });
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  }, [courses]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Course Prices</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coursePriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="price" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Enrollment Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <span className="font-medium">Total Courses</span>
              <span className="text-2xl font-bold text-primary-600">{(courses && Array.isArray(courses)) ? courses.length : 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <span className="font-medium">Total Users</span>
              <span className="text-2xl font-bold text-green-600">{(users && Array.isArray(users)) ? users.length : 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <span className="font-medium">Total Enrollments</span>
              <span className="text-2xl font-bold text-purple-600">{(enrollments && Array.isArray(enrollments)) ? enrollments.length : 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <span className="font-medium">Average Course Price</span>
              <span className="text-2xl font-bold text-orange-600">
                ${(courses && Array.isArray(courses) && courses.length > 0)
                  ? (courses.reduce((sum, c) => sum + (c.price || 0), 0) / courses.length).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

Analytics.displayName = 'Analytics';

export default Analytics;