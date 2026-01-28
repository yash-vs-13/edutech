export const loadState = (key) => {
    try {
      const serializedState = localStorage.getItem(key);
      if (serializedState === null) {
        return undefined;
      }
      const parsed = JSON.parse(serializedState);
      // Return undefined if parsed result is null or not an object
      if (parsed === null || typeof parsed !== 'object') {
        return undefined;
      }
      return parsed;
    } catch (err) {
      console.error('Error loading state from localStorage:', err);
      // Clear corrupted data
      try {
        localStorage.removeItem(key);
      } catch (clearErr) {
        console.error('Error clearing corrupted localStorage:', clearErr);
      }
      return undefined;
    }
  };
  
  export const saveState = (key, state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(key, serializedState);
    } catch (err) {
      console.error('Error saving state to localStorage:', err);
    }
  };
  
  export const clearState = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error('Error clearing state from localStorage:', err);
    }
  };