import React, { memo, useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../store/components/common/Button';
import Card from '../store/components/common/Card';
import { sanitizeHtml } from '../utils/sanitize';

const LessonView = memo(() => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { courses } = useSelector((state) => state.courses);

    const course = (courses && Array.isArray(courses)) ? courses.find((c) => c.id === courseId) : null;

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

    const lesson = useMemo(() => {
        if (!course?.sections) return null;
        for (const section of course.sections) {
            if (!section.lessons) continue;
            const foundLesson = section.lessons.find((l) => l.id === lessonId);
            if (foundLesson) return foundLesson;
        }
        return null;
    }, [course, lessonId]);

    const [fileUrl, setFileUrl] = useState(null);

    useEffect(() => {
        if (!lesson?.file) {
            setFileUrl(null);
            return;
        }

        if (typeof lesson.file === 'string') {
            setFileUrl(lesson.file);
            return;
        }

        if (lesson.file instanceof File || lesson.file instanceof Blob) {
            const url = URL.createObjectURL(lesson.file);
            setFileUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [lesson?.file]);

    if (!course || !lesson) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Lesson not found</p>
                <Button onClick={() => navigate(`/courses/${courseId}`)} className="mt-4">
                    Back to Course
                </Button>
            </div>
        );
    }

    const sanitizedContent = sanitizeHtml(lesson.content || '');

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                <p className="text-sm text-gray-500 mt-1">Course: {course.title}</p>
                {typeof lesson.durationMinutes === 'number' && lesson.durationMinutes > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
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

            <Card className="mb-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <div className="text-gray-700">
                            {lesson.description || 'No description available.'}
                        </div>
                    </div>

                    {lesson.file && (
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">Attached File</h3>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                <span className="text-sm text-gray-700 truncate">{lesson.file.name || 'Attached File'}</span>
                                <div className="flex gap-2 ml-4">
                                    {fileUrl && (
                                        <>
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium"
                                            >
                                                Open
                                            </a>
                                            <a
                                                href={fileUrl}
                                                download={lesson.file.name || 'file'}
                                                className="px-3 py-1 text-sm bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 text-white font-medium"
                                            >
                                                Download
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {lesson.content && (
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">Content</h3>
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
});

LessonView.displayName = 'LessonView';

export default LessonView;
