import React, { memo, useState, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCourse, updateCourse } from '../store/slices/courseSlice';
import CourseList from '../store/components/courses/CourseList';
import CourseForm from '../store/components/courses/CourseForm';
import Modal from '../store/components/common/Modal';
import Button from '../store/components/common/Button';
import Loading from '../store/components/common/Loading';

const Courses = memo(() => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleSubmit = (formData) => {
    if (editingCourse) {
      dispatch(updateCourse({ id: editingCourse.id, ...formData }));
      setToast({ show: true, message: 'Course updated successfully!', type: 'success' });
    } else {
      dispatch(addCourse(formData));
      setToast({ show: true, message: 'Course created successfully!', type: 'success' });
    }
    setIsModalOpen(false);
    setEditingCourse(null);

    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleDelete = () => {
    setToast({ show: true, message: 'Course deleted successfully!', type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleEnroll = () => {
    setToast({ show: true, message: 'Course added to My Courses list!', type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Suspense fallback={<div className="h-full flex items-center justify-center"><Loading size="lg" /></div>}>
        <div className="flex-1 h-full min-h-0">
          <CourseList
            onEdit={handleEdit}
            onCreate={() => {
              setEditingCourse(null);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
            onEnroll={handleEnroll}
            showEnroll={true}
          />
        </div>
      </Suspense>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        size="xl"
      >
        <CourseForm
          course={editingCourse}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      {toast.show && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 animate-slide-in">
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

Courses.displayName = 'Courses';

export default Courses;