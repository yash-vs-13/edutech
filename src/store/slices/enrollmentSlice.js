import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '../../utils/localstorage';

const ENROLLMENTS_STORAGE_KEY = 'cms_enrollments';

const initialState = loadState(ENROLLMENTS_STORAGE_KEY) || {
  enrollments: [],
  loading: false,
  error: null,
};

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addEnrollment: (state, action) => {
      const newEnrollment = {
        id: Date.now().toString(),
        ...action.payload,
        enrolledAt: new Date().toISOString(),
        status: action.payload.status || 'active',
        progress: action.payload.progress || {
          completedLessons: [],
          lastAccessedAt: new Date().toISOString(),
        },
      };
      state.enrollments.push(newEnrollment);
      saveState(ENROLLMENTS_STORAGE_KEY, state);
    },
    updateProgress: (state, action) => {
      const { courseId, userId, lessonId, completed } = action.payload;
      const enrollment = state.enrollments.find(
        (e) => e.courseId === courseId && e.userId === userId
      );
      if (enrollment) {
        if (!enrollment.progress) {
          enrollment.progress = { completedLessons: [], lastAccessedAt: new Date().toISOString() };
        }
        if (completed) {
          if (!enrollment.progress.completedLessons.includes(lessonId)) {
            enrollment.progress.completedLessons.push(lessonId);
          }
        } else {
          enrollment.progress.completedLessons = enrollment.progress.completedLessons.filter(
            (id) => id !== lessonId
          );
        }
        enrollment.progress.lastAccessedAt = new Date().toISOString();
        saveState(ENROLLMENTS_STORAGE_KEY, state);
      }
    },
    updateEnrollment: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.enrollments.findIndex(enrollment => enrollment.id === id);
      if (index !== -1) {
        state.enrollments[index] = {
          ...state.enrollments[index],
          ...updates,
        };
        saveState(ENROLLMENTS_STORAGE_KEY, state);
      }
    },
    deleteEnrollment: (state, action) => {
      state.enrollments = state.enrollments.filter(enrollment => enrollment.id !== action.payload);
      saveState(ENROLLMENTS_STORAGE_KEY, state);
    },
    deleteEnrollments: (state, action) => {
      const idsToDelete = action.payload;
      state.enrollments = state.enrollments.filter(enrollment => !idsToDelete.includes(enrollment.id));
      saveState(ENROLLMENTS_STORAGE_KEY, state);
    },
    setEnrollments: (state, action) => {
      state.enrollments = action.payload;
      saveState(ENROLLMENTS_STORAGE_KEY, state);
    },
  },
});

export const { setLoading, setError, addEnrollment, updateEnrollment, deleteEnrollment, deleteEnrollments, setEnrollments, updateProgress } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;