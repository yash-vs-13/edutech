import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../common/Card';
import Button from '../common/Button';
import { addEnrollment } from '../../slices/enrollmentSlice';
import defaultThumbnail from '../../../assets/default-course-thumbnail.png';

const CourseCard = memo(({ course, onEdit, onDelete, onEnroll, isSelected, onSelect, showEnroll = false }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const enrollments = useSelector((state) => state.enrollments?.enrollments || []);

  const isEnrolled = enrollments.some(
    (e) => e.courseId === course.id && e.userId === user?.id
  );

  const handleEnroll = (e) => {
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
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800',
    ];
    const index = category ? category.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 relative ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(course.id, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer shadow-sm bg-white"
          />
        </div>
      )}

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
          <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
            {course.title}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {course.category && (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                  course.category
                )}`}
              >
                {course.category}
              </span>
            )}
            {course.difficulty && (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                  course.difficulty
                )}`}
              >
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </span>
            )}
            {course.level && !course.difficulty && (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                  course.level
                )}`}
              >
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
            )}
          </div>

          {/* Additional Info */}
          {course.duration && (
            <p className="text-sm text-gray-600 mb-1">
              Duration: {course.duration} hours
            </p>
          )}
          {course.price !== undefined && (
            <p className="text-lg font-bold text-primary-600 mb-4">
              ${parseFloat(course.price).toFixed(2)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link to={`/courses/${course.id}`} state={{ from: '/courses' }} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              View Info
            </Button>
          </Link>
          {showEnroll && (
            <Button
              variant={isEnrolled ? "secondary" : "primary"}
              size="sm"
              onClick={handleEnroll}
              className="flex-1"
              disabled={isEnrolled}
            >
              {isEnrolled ? 'Enrolled' : 'Enroll'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
