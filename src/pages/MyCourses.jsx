import React, { memo, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteEnrollment, deleteEnrollments } from '../store/slices/enrollmentSlice';
import Modal from '../store/components/common/Modal';
import Button from '../store/components/common/Button';
import Card from '../store/components/common/Card';
import defaultThumbnail from '../assets/default-course-thumbnail.png';

const MyCourses = memo(() => {
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const enrollments = useSelector((state) => state.enrollments?.enrollments || []);
  const dispatch = useDispatch();

  const [courseToRemove, setCourseToRemove] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Active filters (actually applied)
  const [activeFilters, setActiveFilters] = useState({
    searchQuery: '',
    category: '',
    difficulty: '',
    sortOrder: ''
  });

  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [showBulkRemoveModal, setShowBulkRemoveModal] = useState(false);

  // Filter courses that the user is enrolled in and calculate progress
  const enrolledCourses = useMemo(() => {
    if (!user || !courses || courses.length === 0) {
      return [];
    }

    // Get enrolled course IDs for the current user
    const userEnrollments = enrollments.filter((enrollment) => enrollment.userId === user.id);
    const enrolledCourseIds = userEnrollments.map((enrollment) => enrollment.courseId);

    // Return courses with enrollment and progress info
    return courses
      .filter((course) => enrolledCourseIds.includes(course.id))
      .map((course) => {
        const enrollment = userEnrollments.find((e) => e.courseId === course.id);
        const progress = enrollment?.progress || { completedLessons: [] };

        // Calculate total lessons
        const totalLessons = course.sections?.reduce(
          (total, section) => total + (section.lessons?.length || 0),
          0
        ) || 0;

        // Calculate completed lessons
        const completedLessons = progress.completedLessons?.length || 0;

        // Calculate progress percentage
        const progressPercentage = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        return {
          ...course,
          enrollment,
          progress: {
            ...progress,
            totalLessons,
            completedLessons,
            progressPercentage,
          },
        };
      });
  }, [courses, enrollments, user]);

  // Derived categories and difficulties from enrolled courses
  const categories = useMemo(() => {
    const cats = new Set();
    enrolledCourses.forEach((c) => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats).sort();
  }, [enrolledCourses]);

  const difficulties = useMemo(() => {
    const diffs = new Set();
    enrolledCourses.forEach((c) => {
      if (c.difficulty) diffs.add(c.difficulty);
      else if (c.level) diffs.add(c.level);
    });
    return Array.from(diffs).sort();
  }, [enrolledCourses]);

  // Apply filters and sorting
  const myCourses = useMemo(() => {
    let filtered = [...enrolledCourses];

    if (activeFilters.searchQuery.trim()) {
      const query = activeFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.title?.toLowerCase().includes(query));
    }

    if (activeFilters.category) {
      filtered = filtered.filter(c => c.category === activeFilters.category);
    }

    if (activeFilters.difficulty) {
      filtered = filtered.filter(c => c.difficulty === activeFilters.difficulty || c.level === activeFilters.difficulty);
    }

    // Sort - default to creation date (newest first), then by sort order if specified
    if (activeFilters.sortOrder) {
      filtered.sort((a, b) => {
        if (activeFilters.sortOrder === 'a-z') return a.title?.localeCompare(b.title);
        if (activeFilters.sortOrder === 'z-a') return b.title?.localeCompare(a.title);
        // If sortOrder is not a-z or z-a, keep default date sorting
        return 0;
      });
    } else {
      // Default sort by creation date (newest first)
      filtered.sort((a, b) => {
        const dateA = a.createdAt || a.created_at;
        const dateB = b.createdAt || b.created_at;
        
        // If both have dates, sort by date (newest first)
        if (dateA && dateB) {
          return new Date(dateB) - new Date(dateA);
        }
        // If only one has a date, prioritize it
        if (dateA && !dateB) return -1;
        if (!dateA && dateB) return 1;
        // If neither has a date, maintain original order (or sort by ID as fallback)
        return 0;
      });
    }

    return filtered;
  }, [enrolledCourses, activeFilters]);

  const applyFilters = () => {
    setActiveFilters({
      searchQuery,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      sortOrder
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortOrder('');
    setActiveFilters({
      searchQuery: '',
      category: '',
      difficulty: '',
      sortOrder: ''
    });
  };

  const hasPendingChanges =
    searchQuery !== activeFilters.searchQuery ||
    selectedCategory !== activeFilters.category ||
    selectedDifficulty !== activeFilters.difficulty ||
    sortOrder !== activeFilters.sortOrder;

  const hasActiveFilters =
    activeFilters.searchQuery || activeFilters.category || activeFilters.difficulty || activeFilters.sortOrder;

  // Handle course selection
  const handleSelectCourse = (courseId, isSelected) => {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(courseId);
      } else {
        newSet.delete(courseId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSet = new Set(selectedCourses);
      myCourses.forEach((course) => newSet.add(course.id));
      setSelectedCourses(newSet);
    } else {
      const newSet = new Set(selectedCourses);
      myCourses.forEach((course) => newSet.delete(course.id));
      setSelectedCourses(newSet);
    }
  };

  const allSelected = myCourses.length > 0 && myCourses.every((c) => selectedCourses.has(c.id));

  const handleBulkRemoveClick = () => {
    if (selectedCourses.size > 0) {
      setShowBulkRemoveModal(true);
    }
  };

  const handleConfirmBulkRemove = () => {
    const enrollmentIdsToRemove = enrolledCourses
      .filter((c) => selectedCourses.has(c.id))
      .map((c) => c.enrollment.id);

    dispatch(deleteEnrollments(enrollmentIdsToRemove));
    setSelectedCourses(new Set());
    setShowBulkRemoveModal(false);
    setToast({ show: true, message: selectedCourses.size === 1 ? 'Course removed successfully!' : `${selectedCourses.size} courses removed successfully!`, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleRemoveClick = (course) => {
    setCourseToRemove(course);
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = () => {
    if (courseToRemove?.enrollment?.id) {
      dispatch(deleteEnrollment(courseToRemove.enrollment.id));
      setShowConfirmModal(false);
      setCourseToRemove(null);
      setToast({ show: true, message: 'Course removed successfully!', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="flex-none bg-gray-50 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 shadow-sm border-b border-gray-200 z-20 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <Link to="/courses">
            <Button variant="primary">
              + Explore Courses
            </Button>
          </Link>
        </div>

        {enrolledCourses.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full lg:w-auto items-center">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search by title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white h-[42px] focus:outline-none focus:border-gray-300 focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex bg-white rounded-lg border border-gray-300 p-1 h-[42px] items-center">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Table View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters and Sorting */}
            <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg outline-none h-[42px] ${selectedCategory ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <option value="" disabled hidden className="text-gray-400">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg outline-none h-[42px] ${selectedDifficulty ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <option value="" disabled hidden className="text-gray-400">All Levels</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff} className="text-gray-900">{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg outline-none h-[42px] ${sortOrder ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <option value="" disabled hidden className="text-gray-400">Sort By</option>
                <option value="a-z" className="text-gray-900">A-Z</option>
                <option value="z-a" className="text-gray-900">Z-A</option>
              </select>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={applyFilters}
                  disabled={!hasPendingChanges}
                  className="h-[42px]"
                >
                  Apply
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters && !searchQuery && !selectedCategory && !selectedDifficulty && !sortOrder}
                  className="h-[42px]"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedCourses.size > 0 && (
        <div className="flex-none bg-primary-50 px-4 sm:px-6 py-3 border-b border-primary-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-primary-800">
              {selectedCourses.size} selected
            </span>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => setSelectedCourses(new Set())}
            >
              Clear Selection
            </Button>
          </div>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white border-transparent"
            size="sm"
            onClick={handleBulkRemoveClick}
          >
            Remove
          </Button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {myCourses.length > 0 && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              Showing {myCourses.length} of {enrolledCourses.length} courses
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600">Select all on page</span>
            </label>
          </div>
        )}

        {myCourses.length === 0 ? (
          <Card className="p-8 text-center max-w-2xl mx-auto mt-10">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {enrolledCourses.length === 0 ? "No courses enrolled yet" : "No courses match your filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {enrolledCourses.length === 0
                ? "Start exploring and enroll in courses from the All Courses page."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            <Link
              to="/courses"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Browse All Courses
            </Link>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map((course) => (
                  <Card key={course.id} className={`hover:shadow-lg transition-shadow duration-200 relative ${selectedCourses.has(course.id) ? 'ring-2 ring-primary-500' : ''}`}>
                    {/* Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedCourses.has(course.id)}
                        onChange={(e) => handleSelectCourse(course.id, e.target.checked)}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer shadow-sm bg-white"
                      />
                    </div>

                    <div className="flex flex-col h-full">
                      {/* Thumbnail */}
                      <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={course.thumbnail || defaultThumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (e.target.src !== defaultThumbnail) {
                              e.target.src = defaultThumbnail;
                            }
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        {/* Title */}
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 break-words max-w-[30ch]">
                          {course.title}
                        </h3>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{course.progress.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-full bg-primary-600 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress.progressPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {course.progress.completedLessons} of {course.progress.totalLessons} lessons completed
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        <Link to={`/courses/${course.id}`} state={{ from: '/my-courses' }} className="flex-1">
                          <Button variant="primary" className="w-full">
                            {course.progress.completedLessons === 0 ? 'Start Learning' : 'Continue Learning'}
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          className="!text-red-600 hover:!bg-red-50 !border-red-100"
                          onClick={() => handleRemoveClick(course)}
                          title="Remove from My Courses"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <span className="sr-only">Select</span>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myCourses.map((course) => (
                      <tr key={course.id} className={`hover:bg-gray-50 ${selectedCourses.has(course.id) ? 'bg-primary-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCourses.has(course.id)}
                            onChange={(e) => handleSelectCourse(course.id, e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={course.thumbnail || defaultThumbnail}
                                alt=""
                                onError={(e) => {
                                  if (e.target.src !== defaultThumbnail) {
                                    e.target.src = defaultThumbnail;
                                  }
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 break-words max-w-[20ch]">{course.title}</div>
                              <div className="text-xs text-gray-500">{course.progress.completedLessons} of {course.progress.totalLessons} lessons</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 w-40">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress.progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{course.progress.progressPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span className="px-2 inline-block text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 break-words">
                            {course.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {course.difficulty || course.level || 'Beginner'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          <div className="flex justify-start gap-3">
                            <Link to={`/courses/${course.id}`} state={{ from: '/my-courses' }}>
                              <Button variant="primary" size="xs">
                                {course.progress.completedLessons === 0 ? 'Start' : 'Continue'}
                              </Button>
                            </Link>
                            <button
                              onClick={() => handleRemoveClick(course)}
                              className="text-red-500 hover:text-red-700"
                              title="Remove"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Remove Course"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove <strong className="text-gray-900">{courseToRemove?.title}</strong> from your learning list?
            This will also reset your progress for this course.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={handleConfirmRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Removal Confirmation Modal */}
      <Modal
        isOpen={showBulkRemoveModal}
        onClose={() => setShowBulkRemoveModal(false)}
        title="Remove Multiple Courses"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove <strong className="text-gray-900">{selectedCourses.size}</strong> courses from your learning list?
            This will also reset your progress for these courses.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowBulkRemoveModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={handleConfirmBulkRemove}
            >
              Remove All Selected
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Toast */}
      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
          <div className="px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 pointer-events-auto">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
});

MyCourses.displayName = 'MyCourses';

export default MyCourses;
