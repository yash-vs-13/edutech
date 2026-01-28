import React, { memo } from 'react';
import Card from '../store/components/common/Card';

const Help = memo(() => {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Get Help</h2>
        <p className="text-gray-600 mb-4">
          If you need assistance with the Course Management System, please contact our support team.
        </p>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
            <p className="text-gray-600">support@edutech.com</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Phone Support</h3>
            <p className="text-gray-600">1-800-234-5678</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Business Hours</h3>
            <p className="text-gray-600">Monday - Friday, 9:00 AM - 6:00 PM IST</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Common Issues</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Can't create a course?</h3>
            <p className="text-gray-600">
              Make sure all required fields are filled and the title is between 10-60 characters.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Image not uploading?</h3>
            <p className="text-gray-600">
              Ensure the image is less than 5MB and in a supported format (PNG, JPG, GIF).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
});

Help.displayName = 'Help';

export default Help;
