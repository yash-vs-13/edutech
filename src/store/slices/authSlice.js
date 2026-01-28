import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState, clearState } from '../../utils/localstorage';

const AUTH_STORAGE_KEY = 'cms_auth';

// Helper to safely load and validate auth state
const getInitialAuthState = () => {
  const savedState = loadState(AUTH_STORAGE_KEY);
  
  // Validate saved state structure
  if (savedState && typeof savedState === 'object') {
    // Ensure all required fields exist and state is valid
    if (savedState.isAuthenticated && savedState.user && savedState.token) {
      return {
        user: savedState.user,
        token: savedState.token,
        isAuthenticated: true,
        loading: false, // Always set loading to false on initial load
        error: null,
      };
    }
  }
  
  // Return default state if saved state is invalid or missing
  // Always ensure loading is false on initial state
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false, // Always false on initial load
    error: null,
  };
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    signInSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      saveState(AUTH_STORAGE_KEY, state);
    },
    signUpSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      saveState(AUTH_STORAGE_KEY, state);
    },
    signOut: (state) => {
      // Clear chatbot shown flag for this user session before clearing user
      const userId = state.user?.id;
      if (userId) {
        sessionStorage.removeItem(`chatbot_shown_${userId}`);
        // Note: We keep the last read message ID in localStorage so it persists across sessions
        // This way, if user logs back in, they won't see red dot for old messages
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearState(AUTH_STORAGE_KEY);
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
      state.error = null;
      saveState(AUTH_STORAGE_KEY, state);
    },
  },
});

export const { 
  setLoading, 
  setError, 
  signInSuccess, 
  signUpSuccess, 
  signOut, 
  clearError,
  updateProfile
} = authSlice.actions;

// Async thunks for authentication
export const signIn = (email, password) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Simulate API call - in production, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      dispatch(setError('Account does not exist. Please check your email or sign up for a new account.'));
      return { success: false };
    }
    
    if (user.password !== password) {
      dispatch(setError('Incorrect password. Please try again.'));
      return { success: false };
    }
    
    // User exists and password is correct
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    dispatch(signInSuccess({
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || ''),
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        category: user.category || 'student',
      },
      token,
    }));
    return { success: true };
  } catch (error) {
    dispatch(setError('An error occurred during sign in. Please try again.'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const signUp = (firstName, lastName, email, password, category) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Simulate API call - in production, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      dispatch(setError('An account with this email address already exists. Please sign in or use a different email address.'));
      return { success: false };
    } else {
      const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        password, // In production, this should be hashed
        category: category || 'student',
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      localStorage.setItem('cms_users', JSON.stringify(users));
      
      // Don't automatically sign in - just return success
      return { success: true, message: 'Account created successfully!' };
    }
  } catch (error) {
    dispatch(setError('An error occurred during sign up'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Simulate API call - in production, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user) {
      // Generate a reset token (in production, this would be sent via email)
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
      
      // Store reset token in localStorage (in production, this would be in a database)
      const resetTokens = JSON.parse(localStorage.getItem('cms_reset_tokens') || '[]');
      // Remove old tokens for this email
      const filteredTokens = resetTokens.filter(t => t.email !== email);
      filteredTokens.push({
        email: email,
        token: resetToken,
        expiresAt: resetExpiry,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('cms_reset_tokens', JSON.stringify(filteredTokens));
      
      // In production, send password reset email with the token via email service
      // For demo purposes: The reset token has been generated and stored
      // In a real application, you would integrate with an email service (SendGrid, AWS SES, etc.)
      // to send: `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
      
      dispatch(setError(null));
      return { success: true, message: 'Password reset link sent to your email', resetToken: resetToken };
    } else {
      dispatch(setError('No account found with this email'));
      return { success: false };
    }
  } catch (error) {
    dispatch(setError('An error occurred'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateUserProfile = (profileData) => async (dispatch, getState) => {
  // Avoid toggling global auth.loading here so we don't show a full-page loader
  // for a simple profile update; the Profile page manages its own saving state.
  dispatch(clearError());

  try {
    // Simulate API call - in production, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const { auth } = getState();
    const userId = auth.user?.id;

    if (!userId) {
      dispatch(setError('User not found'));
      return { success: false };
    }

    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      // If firstName or lastName is updated, also update the name field
      const updatedData = { ...profileData };
      if (updatedData.firstName || updatedData.lastName) {
        const firstName = updatedData.firstName || users[userIndex].firstName || '';
        const lastName = updatedData.lastName || users[userIndex].lastName || '';
        updatedData.name = `${firstName} ${lastName}`.trim();
      }

      users[userIndex] = {
        ...users[userIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('cms_users', JSON.stringify(users));

      // Update Redux state
      dispatch(updateProfile(updatedData));

      return { success: true, message: 'Profile updated successfully' };
    } else {
      dispatch(setError('User not found'));
      return { success: false };
    }
  } catch (error) {
    dispatch(setError('An error occurred while updating profile'));
    return { success: false };
  }
};

export const changePassword = (currentPassword, newPassword) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Simulate API call - in production, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { auth } = getState();
    const userId = auth.user?.id;
    const userEmail = auth.user?.email;
    
    if (!userId || !userEmail) {
      dispatch(setError('User not found'));
      return { success: false };
    }
    
    // Check current password
    const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
    const user = users.find(u => u.id === userId && u.email === userEmail);
    
    if (!user) {
      dispatch(setError('User not found'));
      return { success: false };
    }
    
    if (user.password !== currentPassword) {
      dispatch(setError('Current password is incorrect'));
      return { success: false };
    }
    
    // Update password
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        password: newPassword, // In production, this should be hashed
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('cms_users', JSON.stringify(users));
      
      return { success: true, message: 'Password changed successfully' };
    } else {
      dispatch(setError('User not found'));
      return { success: false };
    }
  } catch (error) {
    dispatch(setError('An error occurred while changing password'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteAccount = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Simulate API call - in production, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { auth } = getState();
    const userId = auth.user?.id;
    const userEmail = auth.user?.email;
    
    if (!userId || !userEmail) {
      dispatch(setError('User not found'));
      return { success: false };
    }
    
    // Verify user exists
    const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
    const user = users.find(u => u.id === userId && u.email === userEmail);
    
    if (!user) {
      dispatch(setError('User not found'));
      return { success: false };
    }
    
    // Delete user from localStorage
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('cms_users', JSON.stringify(updatedUsers));
    
    // Let the caller handle sign-out and navigation so it can show a toast first
    return { success: true, message: 'Account deleted successfully!' };
  } catch (error) {
    dispatch(setError('An error occurred while deleting account'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;
