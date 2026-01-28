import React, { memo, useState, useMemo } from 'react';
import Card from '../store/components/common/Card';
import Button from '../store/components/common/Button';
import Modal from '../store/components/common/Modal';
import { sanitizeInput } from '../utils/sanitize';

const Users = memo(() => {
  const [users, setUsers] = useState(() => {
    // Load users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('cms_users') || '[]');
    return storedUsers;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: '',
  });

  const saveUsers = (updatedUsers) => {
    localStorage.setItem('cms_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUsers = [...users];

    if (editingUser) {
      // Update existing user
      const index = updatedUsers.findIndex(u => u.id === editingUser.id);
      if (index !== -1) {
        updatedUsers[index] = {
          ...updatedUsers[index],
          ...formData,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          updatedAt: new Date().toISOString(),
        };
        saveUsers(updatedUsers);
      }
    } else {
      // Add new user (this would typically be done through signup, but keeping for consistency)
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        password: '', // Password should be set through signup
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedUsers.push(newUser);
      saveUsers(updatedUsers);
    }

    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', category: '' });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      category: user.category || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== id);
      saveUsers(updatedUsers);
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [users]);

  const usersByCategory = useMemo(() => {
    const categories = {};
    users.forEach(user => {
      const category = user.category || 'student';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered users</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingUser(null);
            setFormData({ firstName: '', lastName: '', email: '', phone: '', category: '' });
            setIsModalOpen(true);
          }}
        >
          + Add User
        </Button>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Total Users</span>
            <span className="text-2xl font-bold text-primary-600">{users.length}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Students</span>
              <span className="text-lg font-semibold text-green-600">{usersByCategory.student || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Employed</span>
              <span className="text-lg font-semibold text-blue-600">{usersByCategory.employed || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {users.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No users found. Users will appear here after they sign up.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedUsers.map((user) => (
            <Card key={user.id}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User'}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${user.category === 'employed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                      }`}>
                      {user.category ? user.category.charAt(0).toUpperCase() + user.category.slice(1) : 'Student'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(user)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: sanitizeInput(e.target.value) })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: sanitizeInput(e.target.value) })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: sanitizeInput(e.target.value) })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: sanitizeInput(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="" disabled>Select a category</option>
              <option value="student">Student</option>
              <option value="employed">Employed</option>
            </select>
          </div>
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

Users.displayName = 'Users';

export default Users;