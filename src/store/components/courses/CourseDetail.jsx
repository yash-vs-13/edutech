import React, { memo, useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { sanitizeHtml } from '../../../utils/sanitize';
import { updateProgress } from '../../slices/enrollmentSlice';
import { updateCourse, deleteCourse } from '../../slices/courseSlice';
import Modal from '../common/Modal';
import CourseForm from './CourseForm';
import defaultThumbnail from '../../../assets/default-course-thumbnail.png';

const CourseDetail = memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedLessonFileUrl, setSelectedLessonFileUrl] = useState(null);
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const enrollments = useSelector((state) => state.enrollments?.enrollments || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const course = (courses && Array.isArray(courses)) ? courses.find((c) => c.id === id) : null;

  // Get enrollment and progress for this course
  const enrollment = useMemo(() => {
    return enrollments.find((e) => e.courseId === id && e.userId === user?.id);
  }, [enrollments, id, user]);

  const progress = enrollment?.progress || { completedLessons: [] };
  const completedLessons = progress.completedLessons || [];

  // Show progress controls only if enrolled AND not coming from "All Courses" view
  // When coming from All Courses, never show progress controls regardless of enrollment status
  const showProgressControls = enrollment && location.state?.from !== '/courses';
  
  // When coming from All Courses, always treat as not enrolled for display purposes
  const isFromAllCourses = location.state?.from === '/courses';

  // Calculate total lessons and progress
  const totalLessons = useMemo(() => {
    return course?.sections?.reduce(
      (total, section) => total + (section.lessons?.length || 0),
      0
    ) || 0;
  }, [course]);

  const progressPercentage = totalLessons > 0
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0;

  const totalDurationMinutes = useMemo(() => {
    if (!course?.sections) return 0;
    return course.sections.reduce((total, section) => {
      if (!section.lessons) return total;
      return total + section.lessons.reduce((secTotal, lesson) => {
        const minutes = lesson?.durationMinutes;
        return secTotal + (typeof minutes === 'number' && !Number.isNaN(minutes) ? minutes : 0);
      }, 0);
    }, 0);
  }, [course]);

  const handleLessonToggle = (lessonId) => {
    if (!user || !enrollment) return;

    const isCompleted = completedLessons.includes(lessonId);
    dispatch(updateProgress({
      courseId: id,
      userId: user.id,
      lessonId,
      completed: !isCompleted,
    }));
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const closeModal = () => {
    setSelectedLesson(null);
  };

  /** True when HTML string has actual text (not just tags/whitespace like <p><br></p>). */
  const hasVisibleContent = (html) => {
    if (!html || typeof html !== 'string') return false;
    const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return stripped.length > 0;
  };

  const handleEditSubmit = (formData) => {
    dispatch(updateCourse({ id: course.id, ...formData }));
    setIsEditModalOpen(false);
    setToast({ show: true, message: 'Course updated successfully!', type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteCourse(course.id));
    setShowDeleteConfirm(false);
    // Store success message flag for Courses page to display
    sessionStorage.setItem('courseDeletedSuccess', 'true');
    navigate('/courses');
  };

  useEffect(() => {
    if (!selectedLesson?.file) {
      setSelectedLessonFileUrl(null);
      return;
    }

    if (typeof selectedLesson.file === 'string') {
      setSelectedLessonFileUrl(selectedLesson.file);
      return;
    }

    let url = null;
    if (selectedLesson.file instanceof File || selectedLesson.file instanceof Blob) {
      url = URL.createObjectURL(selectedLesson.file);
      setSelectedLessonFileUrl(url);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [selectedLesson?.file]);

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Course not found</p>
        <Button onClick={() => navigate('/courses')} className="mt-4">
          Back to Courses
        </Button>
      </div>
    );
  }

  const sanitizedDescription = sanitizeHtml(course.description || '');

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="secondary"
          onClick={() => {
            if (location.state?.from) {
              navigate(location.state.from);
            } else {
              // If coming from All Courses, always go back to courses, not my-courses
              navigate(isFromAllCourses ? '/courses' : (enrollment ? '/my-courses' : '/courses'));
            }
          }}
          className=""
        >
          ← {isFromAllCourses
            ? 'Back to Courses'
            : location.state?.from === '/my-courses'
              ? 'Back to My Courses'
              : enrollment && !isFromAllCourses
                ? 'Back to My Courses'
                : 'Back to Courses'}
        </Button>

        {user && location.state?.from === '/courses' && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Course
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              className="!text-red-600 hover:!bg-red-50 !border-red-100 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Course
            </Button>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Course Thumbnail */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
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
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4 break-words max-w-[30ch]">{course.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {course.category && <span>Category: <strong>{course.category}</strong></span>}
                {course.difficulty && <span>Level: <strong className="capitalize">{course.difficulty}</strong></span>}
                {totalDurationMinutes > 0 && (
                  <span>
                    Total Duration:{' '}
                    <strong>
                      {(() => {
                        const hours = Math.floor(totalDurationMinutes / 60);
                        const remaining = totalDurationMinutes % 60;
                        if (hours && remaining) return `${hours}h ${remaining}m`;
                        if (hours) return `${hours}h`;
                        return `${remaining}m`;
                      })()}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar (only in My Courses view) */}
          {showProgressControls && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Your Progress</h3>
                <span className="text-lg font-bold text-primary-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {completedLessons.length} of {totalLessons} lessons completed
              </p>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>
        </div>
      </Card>

      {/* Course Content - Sections and Lessons */}
      {course.sections && course.sections.length > 0 && (
        <Card>
          <h2 className="text-2xl font-semibold mb-6">Course Content</h2>
          <div className="space-y-6">
            {course.sections.map((section, sectionIndex) => (
              <div key={section.id || sectionIndex} className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Section {sectionIndex + 1}: {section.title || 'Untitled Section'}
                </h3>
                {section.lessons && section.lessons.length > 0 ? (
                  <div className="space-y-3 ml-4">
                    {section.lessons.map((lesson, lessonIndex) => {
                      const lessonId = lesson.id || `${course.id}-${sectionIndex}-${lessonIndex}`;
                      // Only show as completed if progress controls are enabled (My Courses view)
                      // When viewing from All Courses, never show completion status
                      const isCompleted = showProgressControls && completedLessons.includes(lessonId);

                      return (
                        <div
                          key={lessonId}
                          onClick={showProgressControls ? () => handleLessonClick(lesson) : undefined}
                          className={`flex items-center p-4 rounded-lg border-2 transition-colors ${showProgressControls ? 'cursor-pointer' : 'cursor-default'} ${isCompleted
                            ? 'bg-green-50 border-green-200'
                            : showProgressControls 
                              ? 'bg-gray-50 border-gray-200 hover:border-primary-300'
                              : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                          <div className="flex items-center flex-1">
                            {showProgressControls ? (
                              <div className="flex items-center mr-3">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() => handleLessonToggle(lessonId)}
                                  onClick={(e) => e.stopPropagation()} // Prevent modal opening when clicking checkbox
                                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer mr-3"
                                />
                                <span className="text-sm font-medium text-gray-500 w-5 text-center">
                                  {lessonIndex + 1}
                                </span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded border-2 border-gray-300 mr-3 flex items-center justify-center">
                                <span className="text-xs text-gray-400">{lessonIndex + 1}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {lesson.title || `Lesson ${lessonIndex + 1}`}
                              </h4>
                              {typeof lesson.durationMinutes === 'number' && lesson.durationMinutes > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Duration:{' '}
                                  {(() => {
                                    const minutes = lesson.durationMinutes;
                                    const hours = Math.floor(minutes / 60);
                                    const remaining = minutes % 60;
                                    if (hours && remaining) return `${hours}h ${remaining}m`;
                                    if (hours) return `${hours}h`;
                                    return `${remaining}m`;
                                  })()}
                                </p>
                              )}
                            </div>
                          </div>
                          {isCompleted && (
                            <span className="ml-3 text-green-600 font-semibold text-sm">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm ml-4">No lessons in this section</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* Lesson Details Modal */}
      {selectedLesson && (
        <Modal
          isOpen={!!selectedLesson}
          onClose={closeModal}
          title={selectedLesson.title}
          size="lg"
        >
          <div className="space-y-4">
            {selectedLesson.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                <p className="text-gray-600">{selectedLesson.description}</p>
              </div>
            )}

            {showProgressControls && selectedLesson.file && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Attached File</h4>
                  {selectedLessonFileUrl && (
                    <div className="flex gap-2">
                      <a
                        href={selectedLessonFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-4">
                    {(() => {
                      if (selectedLesson.file.name) {
                        return selectedLesson.file.name;
                      }
                      if (typeof selectedLesson.file === 'string') {
                        const urlParts = selectedLesson.file.split('/');
                        const fileName = urlParts[urlParts.length - 1].split('?')[0];
                        return fileName || 'Attached File';
                      }
                      return 'Attached File';
                    })()}
                  </span>
                </div>
              </div>
            )}

            {showProgressControls && hasVisibleContent(selectedLesson?.content) && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Content</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const sanitizedContent = sanitizeHtml(selectedLesson.content);
                        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${selectedLesson.title || 'Lesson Content'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .prose { color: #374151; }
    </style>
</head>
<body>
    <div class="prose">${sanitizedContent}</div>
</body>
</html>`;
                        const blob = new Blob([htmlContent], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.click();
                        setTimeout(() => URL.revokeObjectURL(url), 100);
                      }}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </div>
                </div>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(selectedLesson.content),
                  }}
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Course Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Course"
        size="xl"
      >
        <CourseForm
          course={course}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Course"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong className="text-gray-900">{course.title}</strong>?
            This action cannot be undone and all course content will be permanently removed.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={handleDeleteConfirm}
            >
              Delete Permanently
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

CourseDetail.displayName = 'CourseDetail';

export default CourseDetail;