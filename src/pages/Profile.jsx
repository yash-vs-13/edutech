import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, changePassword, deleteAccount, clearError } from '../store/slices/authSlice';
import Button from '../store/components/common/Button';
import Card from '../store/components/common/Card';
import Loading from '../store/components/common/Loading';
import Modal from '../store/components/common/Modal';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profileImage: '',
  });
  const [originalFormData, setOriginalFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profileImage: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStep, setPasswordStep] = useState(1); // 1: OTP, 2: password change
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Split name into firstName and lastName if needed
      const nameParts = (user.name || '').split(' ');
      const firstName = user.firstName || nameParts[0] || '';
      const lastName = user.lastName || nameParts.slice(1).join(' ') || '';

      const initialData = {
        firstName,
        lastName,
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      };
      setFormData(initialData);
      setOriginalFormData(initialData);
    }
    return () => {
      dispatch(clearError());
      setSuccess('');
    };
  }, [user, dispatch]);

  const handleEditClick = () => {
    setIsEditMode(true);
    setFormErrors({});
    setSuccess('');
    dispatch(clearError());
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData(originalFormData);
    setFormErrors({});
    setSuccess('');
    dispatch(clearError());
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        dispatch({ type: 'auth/setError', payload: 'Image size should be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: '',
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    dispatch(clearError());
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    dispatch(clearError());
    setSuccess('');
  };

  const validateProfile = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (passwordData.newPassword.length > 50) {
      errors.newPassword = 'Password must not exceed 50 characters';
    } else {
      const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
      const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
      const hasNumeric = /[0-9]/.test(passwordData.newPassword);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumeric || !hasSpecialChar) {
        errors.newPassword = 'Password must contain at least 1 uppercase, 1 lowercase, 1 numeric, and 1 special character';
      }
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();

    if (otp.trim() === '0000') {
      setOtpError('');
      setPasswordStep(2); // Move to password change step
    } else {
      setOtpError('Invalid OTP. Please enter 0000');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (validateProfile()) {
      const result = await dispatch(updateUserProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        profileImage: formData.profileImage || undefined,
      }));

      if (result && result.success) {
        setSuccess('Profile updated successfully!');
        setOriginalFormData({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || '',
          profileImage: formData.profileImage || '',
        });
        setIsEditMode(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (validatePassword()) {
      // Get current user's password from localStorage
      const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
      const currentUser = users.find(u => u.id === user?.id && u.email === user?.email);
      const currentPassword = currentUser?.password || '';

      const result = await dispatch(changePassword(
        currentPassword,
        passwordData.newPassword
      ));

      if (result && result.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordStep(1);
        setOtp('');
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password to confirm');
      return;
    }

    setDeleteError('');
    const result = await dispatch(deleteAccount(deletePassword));

    if (result && result.success) {
      setShowDeleteModal(false);
      navigate('/signin');
    }
  };

  useEffect(() => {
    if (error && showDeleteModal) {
      setDeleteError(error);
    }
  }, [error, showDeleteModal]);

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError('');
    dispatch(clearError());
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const getInitials = () => {
    if (formData.firstName || formData.lastName) {
      const firstInitial = formData.firstName?.[0]?.toUpperCase() || '';
      const lastInitial = formData.lastName?.[0]?.toUpperCase() || '';
      return (firstInitial + lastInitial) || user?.email?.[0]?.toUpperCase() || 'U';
    } else if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('profile');
                setIsEditMode(false);
                setFormData(originalFormData);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => {
                setActiveTab('password');
                setIsEditMode(false);
                setPasswordStep(1);
                setOtp('');
                setOtpError('');
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                setPasswordErrors({});
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0 relative">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-medium border-2 border-gray-200">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  {isEditMode && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading}
                        >
                          {formData.profileImage ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                        {formData.profileImage && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={handleRemoveImage}
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        JPG, PNG or GIF. Max size 5MB
                      </p>
                    </div>
                  )}
                </div>
                {!isEditMode && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleProfileChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                      } ${!isEditMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                    placeholder="Enter your first name"
                    disabled={loading || !isEditMode}
                    readOnly={!isEditMode}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleProfileChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                      } ${!isEditMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                    placeholder="Enter your last name"
                    disabled={loading || !isEditMode}
                    readOnly={!isEditMode}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email (Non-editable) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              {/* Category (Non-editable) */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={user?.category ? user.category.charAt(0).toUpperCase() + user.category.slice(1) : 'Not set'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">Category cannot be changed</p>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.phone ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="Enter your phone number"
                  disabled={loading || !isEditMode}
                  readOnly={!isEditMode}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              {isEditMode && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loading size="sm" className="mr-2" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              )}
            </form>

            {!isEditMode && (
              <div className="pt-4 border-t border-gray-200 mt-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={openDeleteModal}
                    disabled={loading}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <>
            {passwordStep === 1 ? (
              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setOtpError('');
                    }}
                    maxLength={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest ${otpError ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="0000"
                    disabled={loading}
                  />
                  {otpError && (
                    <p className="mt-1 text-sm text-red-600">{otpError}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Enter the OTP: <span className="font-semibold">0000</span>
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    Verify OTP
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      maxLength={50}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter your new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      maxLength={50}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Confirm your new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordStep(1);
                      setOtp('');
                      setOtpError('');
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Back to OTP
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loading size="sm" className="mr-2" />
                        Changing...
                      </span>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Warning: This action cannot be undone
                </h3>
                <p className="text-sm text-red-700">
                  This will permanently delete your account and all associated data.
                  You will need to create a new account to use the platform again.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your password to confirm <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="deletePassword"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeleteError('');
                dispatch(clearError());
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${deleteError ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Enter your password"
              disabled={loading}
              autoFocus
            />
            {deleteError && (
              <p className="mt-1 text-sm text-red-600">{deleteError}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeDeleteModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={loading || !deletePassword.trim()}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loading size="sm" className="mr-2" />
                  Deleting...
                </span>
              ) : (
                'Delete Account'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
