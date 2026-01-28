import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, deleteAccount, clearError, signOut } from '../store/slices/authSlice';
import Button from '../store/components/common/Button';
import Card from '../store/components/common/Card';
import Loading from '../store/components/common/Loading';
import Modal from '../store/components/common/Modal';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [saving, setSaving] = useState(false);
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
      setToast({ show: false, message: '', type: 'success' });
    };
  }, [user, dispatch]);

  const handleEditClick = () => {
    setIsEditMode(true);
    setFormErrors({});
    setToast({ show: false, message: '', type: 'success' });
    dispatch(clearError());
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData(originalFormData);
    setFormErrors({});
    setToast({ show: false, message: '', type: 'success' });
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
    setToast({ show: false, message: '', type: 'success' });
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) return;

    try {
      setSaving(true);
      const result = await dispatch(updateUserProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        profileImage: formData.profileImage || undefined,
      }));

      if (result && result.success) {
        setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
        setOriginalFormData({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || '',
          profileImage: formData.profileImage || '',
        });
        setIsEditMode(false);
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
      }
    } finally {
      setSaving(false);
    }
  };



  const handleDeleteAccount = async () => {
    const result = await dispatch(deleteAccount());

    if (result && result.success) {
      // Close modal
      setShowDeleteModal(false);

      // Persist a flag so SignIn can show a one-time success message
      sessionStorage.setItem('accountDeletedSuccess', 'true');

      // Immediately sign out and redirect away from the app
      dispatch(signOut());
      navigate('/signin');
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    dispatch(clearError());
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
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
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="flex-none bg-white px-6 py-5 shadow-sm border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-6">

            {error && (
              <div className="px-6 mb-6">
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}

            {/* Profile Information Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center justify-between px-6">
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

              <div className="px-6 space-y-6">
                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
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
                      Last Name
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
                      disabled={saving}
                    >
                      {saving ? (
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
              </div>
            </form>

            {!isEditMode && (
              <div className="px-6 pt-4 mt-6">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="danger"
                    onClick={openDeleteModal}
                    disabled={loading}
                  >
                    Delete Account
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/forgot-password', { state: { from: '/profile' } })}
                    disabled={loading}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete your account? This action <strong className="text-red-600">cannot be undone</strong> and will permanently delete your account and all associated data. You will need to create a new account to use the platform again.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end mt-6">
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
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loading size="sm" className="mr-2" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </Modal>

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
};

export default Profile;
