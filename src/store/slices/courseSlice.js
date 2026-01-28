import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '../../utils/localstorage';

const COURSES_STORAGE_KEY = 'cms_courses';

const initialState = loadState(COURSES_STORAGE_KEY) || {
  courses: [],
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addCourse: (state, action) => {
      const newCourse = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.courses.push(newCourse);
      saveState(COURSES_STORAGE_KEY, state);
    },
    updateCourse: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.courses.findIndex(course => course.id === id);
      if (index !== -1) {
        state.courses[index] = {
          ...state.courses[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveState(COURSES_STORAGE_KEY, state);
      }
    },
    deleteCourse: (state, action) => {
      state.courses = state.courses.filter(course => course.id !== action.payload);
      saveState(COURSES_STORAGE_KEY, state);
    },
    deleteCourses: (state, action) => {
      const idsToDelete = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.courses = state.courses.filter(course => !idsToDelete.includes(course.id));
      saveState(COURSES_STORAGE_KEY, state);
    },
    setCourses: (state, action) => {
      state.courses = action.payload;
      saveState(COURSES_STORAGE_KEY, state);
    },
  },
});

export const { setLoading, setError, addCourse, updateCourse, deleteCourse, deleteCourses, setCourses } = courseSlice.actions;
export default courseSlice.reducer;