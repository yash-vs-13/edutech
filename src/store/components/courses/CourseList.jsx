import React, { memo, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CourseCard from './courseCard';
import Loading from '../common/Loading';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Card from '../common/Card';
import { Link, useNavigate } from 'react-router-dom';
import { deleteCourse, deleteCourses } from '../../slices/courseSlice';
import { addEnrollment, deleteEnrollments } from '../../slices/enrollmentSlice';
import defaultThumbnail from '../../../assets/default-course-thumbnail.png';

const COURSES_PER_PAGE = 6;

const CourseList = memo(({ onEdit, onCreate, onDelete, onEnroll, showEnroll = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const enrollments = useSelector((state) => state.enrollments?.enrollments || []);

  // State for search and filters inputs (pending application)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Active filters (actually applied)
  const [activeFilters, setActiveFilters] = useState({
    searchQuery: '',
    category: '',
    difficulty: '',
    sortOrder: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkRemoveModal, setShowBulkRemoveModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [courseToRemove, setCourseToRemove] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Get unique categories and difficulties
  const categories = useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    const cats = new Set();
    courses.forEach((course) => {
      if (course.category) cats.add(course.category);
    });
    return Array.from(cats).sort();
  }, [courses]);

  const difficulties = useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    const diffs = new Set();
    courses.forEach((course) => {
      if (course.difficulty) diffs.add(course.difficulty);
      else if (course.level) diffs.add(course.level);
    });
    return Array.from(diffs).sort();
  }, [courses]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    let filtered = [...courses];

    // Search filter
    if (activeFilters.searchQuery.trim()) {
      const query = activeFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (activeFilters.category) {
      filtered = filtered.filter((course) => course.category === activeFilters.category);
    }

    // Difficulty filter
    if (activeFilters.difficulty) {
      filtered = filtered.filter(
        (course) =>
          course.difficulty === activeFilters.difficulty ||
          course.level === activeFilters.difficulty
      );
    }

    // Sort - default to creation date (newest first), then by sort order if specified
    if (activeFilters.sortOrder) {
      filtered.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        if (activeFilters.sortOrder === 'a-z') {
          return titleA.localeCompare(titleB);
        } else if (activeFilters.sortOrder === 'z-a') {
          return titleB.localeCompare(titleA);
        }
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
  }, [courses, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCourses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const paginatedCourses = filteredAndSortedCourses.slice(startIndex, endIndex);

  // Reset page when active filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

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

  // Handle select all on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSet = new Set(selectedCourses);
      paginatedCourses.forEach((course) => newSet.add(course.id));
      setSelectedCourses(newSet);
    } else {
      const newSet = new Set(selectedCourses);
      paginatedCourses.forEach((course) => newSet.delete(course.id));
      setSelectedCourses(newSet);
    }
  };

  // Check if all on current page are selected
  const allSelectedOnPage =
    paginatedCourses.length > 0 &&
    paginatedCourses.every((course) => selectedCourses.has(course.id));

  // Handle single delete
  const handleDeleteClick = (id) => {
    const course = (courses && Array.isArray(courses)) ? courses.find(c => c.id === id) : null;
    setCourseToDelete(course);
  };

  const confirmSingleDelete = () => {
    if (courseToDelete) {
      dispatch(deleteCourse(courseToDelete.id));
      setSelectedCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseToDelete.id);
        return newSet;
      });
      if (onDelete) onDelete();
      setCourseToDelete(null);
    }
  };

  const handleBulkAction = () => {
    if (selectedCourses.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = () => {
    dispatch(deleteCourses(Array.from(selectedCourses)));
    setSelectedCourses(new Set());
    setShowBulkDeleteModal(false);
    setCurrentPage(1);
    if (onDelete) onDelete();
  };

  const confirmBulkRemove = () => {
    const selectedEnrollmentIds = enrollments
      .filter(e => selectedCourses.has(e.courseId) && e.userId === user?.id)
      .map(e => e.id);

    dispatch(deleteEnrollments(selectedEnrollmentIds));
    setSelectedCourses(new Set());
    setShowBulkRemoveModal(false);
    if (onEnroll) onEnroll(); // reuse enroll callback for refresh if needed
  };

  const handleRemoveClick = (id) => {
    const course = (courses && Array.isArray(courses)) ? courses.find(c => c.id === id) : null;
    setCourseToRemove(course);
  };

  const confirmSingleRemove = () => {
    if (courseToRemove) {
      const enrollment = enrollments.find(e => e.courseId === courseToRemove.id && e.userId === user?.id);
      if (enrollment) {
        dispatch(deleteEnrollments([enrollment.id]));
      }
      setSelectedCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseToRemove.id);
        return newSet;
      });
      setCourseToRemove(null);
    }
  };

  const applyFilters = () => {
    setActiveFilters({
      searchQuery,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      sortOrder
    });
  };

  const resetFilters = () => {
    // Reset inputs
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortOrder('');

    // Reset active filters
    setActiveFilters({
      searchQuery: '',
      category: '',
      difficulty: '',
      sortOrder: ''
    });

    setCurrentPage(1);
  };

  const hasPendingChanges =
    searchQuery !== activeFilters.searchQuery ||
    selectedCategory !== activeFilters.category ||
    selectedDifficulty !== activeFilters.difficulty ||
    sortOrder !== activeFilters.sortOrder;

  const hasActiveFilters =
    activeFilters.searchQuery ||
    activeFilters.category ||
    activeFilters.difficulty ||
    activeFilters.sortOrder;

  if (loading) {
    return <Loading size="lg" className="py-12" />;
  }

    return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Filter Header - No sticky needed as it will be in a flex column */}
      <div className="flex-none bg-gray-50 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 shadow-sm border-b border-gray-200 z-20 space-y-4">
        {/* Header Row: Title & Add Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
          {onCreate && (
            <Button variant="primary" onClick={onCreate}>
              + Add Course
            </Button>
          )}
        </div>

        {courses.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

            <div className="flex flex-1 gap-4 w-full lg:w-auto items-center">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white h-[42px]"
                />
              </div>

              {/* View Toggle (Desktop) */}
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

            <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-[42px] ${selectedCategory ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-gray-900">
                    {cat}
                  </option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-[42px] ${selectedDifficulty ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <option value="">All Levels</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff} className="text-gray-900">
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-[42px] ${sortOrder ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <option value="" disabled hidden>
                  Sort By
                </option>
                <option value="a-z" className="text-gray-900">A-Z</option>
                <option value="z-a" className="text-gray-900">Z-A</option>
              </select>

              {/* Apply & Reset Buttons */}
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
            onClick={handleBulkAction}
          >
            Delete Course(s)
          </Button>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Results Count & Select All */}
        {courses && Array.isArray(courses) && courses.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {paginatedCourses.length} of {filteredAndSortedCourses.length} courses
            </p>
            {paginatedCourses.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 rounded outline-none cursor-pointer"
                />
                <span className="text-sm text-gray-600">Select all on page</span>
              </label>
            )}
          </div>
        )}

        {/* Content Area */}
        {paginatedCourses.length === 0 ? (
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
              {courses.length === 0 ? "No courses found" : "No courses match your filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {courses.length === 0
                ? "There are no courses available at the moment. Please check back later."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {courses.length === 0 ? (
              onCreate && (
                <Button variant="primary" onClick={onCreate}>
                  Create First Course
                </Button>
              )
            ) : (
              <Button variant="secondary" onClick={resetFilters}>
                Reset All Filters
              </Button>
            )}
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isSelected={selectedCourses.has(course.id)}
                    onSelect={handleSelectCourse}
                    showEnroll={showEnroll}
                    onEnroll={onEnroll}
                  />
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
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lessons
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCourses.map((course) => {
                      const isEnrolled = enrollments.some(
                        (e) => e.courseId === course.id && e.userId === user?.id
                      );
                      return (
                        <tr
                          key={course.id}
                          className={`cursor-pointer hover:bg-gray-50 ${selectedCourses.has(course.id) ? 'bg-primary-50' : ''}`}
                          onClick={() => navigate(`/courses/${course.id}`, { state: { from: '/courses' } })}
                        >
                          <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedCourses.has(course.id)}
                              onChange={(e) => handleSelectCourse(course.id, e.target.checked)}
                              className="w-4 h-4 text-primary-600 rounded outline-none cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                              {course.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase tracking-wider">
                            {course.difficulty || course.level || 'Beginner'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase tracking-wider">
                            {course.sections?.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0) || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-start gap-4">
                              {showEnroll && (
                                <Button
                                  variant={isEnrolled ? "secondary" : "primary"}
                                  size="xs"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (user && !isEnrolled) {
                                      dispatch(addEnrollment({
                                        userId: user.id,
                                        courseId: course.id,
                                        progress: {
                                          completedLessons: [],
                                          lastAccessedAt: new Date().toISOString(),
                                        },
                                      }));
                                      if (onEnroll) onEnroll();
                                    }
                                  }}
                                  disabled={isEnrolled}
                                  className="min-w-[70px]"
                                >
                                  {isEnrolled ? 'Enrolled' : 'Enroll'}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>    {/* Bulk Delete Confirmation Modal logic remains same... */}
      {/* Individual Delete Confirmation Modal */}
      <Modal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        title="Delete Course"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong className="text-gray-900">{courseToDelete?.title}</strong>?
            This action <strong className="text-red-600">cannot be undone</strong> and will remove the course for all enrolled users.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setCourseToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={confirmSingleDelete}
            >
              Delete Course
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Delete Multiple Courses"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong className="text-gray-900">{selectedCourses.size}</strong> courses?
            This action <strong className="text-red-600">cannot be undone</strong> and will remove these courses for all enrolled users.
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowBulkDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={confirmBulkDelete}
            >
              Delete All Selected
            </Button>
          </div>
        </div>
      </Modal>

      {/* Individual Remove Confirmation Modal */}
      <Modal
        isOpen={!!courseToRemove}
        onClose={() => setCourseToRemove(null)}
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
              onClick={() => setCourseToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={confirmSingleRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Remove Confirmation Modal */}
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
              onClick={confirmBulkRemove}
            >
              Remove All Selected
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

CourseList.displayName = 'CourseList';

export default CourseList;
