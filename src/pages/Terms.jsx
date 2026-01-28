import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../store/components/common/Card';
import AuthBackground from '../components/AuthBackground';

const Terms = () => {
  return (
    <AuthBackground>
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm shadow-2xl">
        <div className="p-8">
          <div className="mb-6">
            <Link
              to="/signup"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm mb-4 inline-block"
            >
              ← Back to Sign Up
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose max-w-none space-y-4 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing and using EduTech, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Use License</h2>
              <p>
                Permission is granted to temporarily access the materials on EduTech's website for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. User Account</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Course Content</h2>
              <p>
                All course materials, including but not limited to text, graphics, logos, images, and software, are the property of EduTech and are protected by copyright laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Prohibited Uses</h2>
              <p>
                You may not use the service in any way that violates any applicable laws or regulations, or in any manner that could damage, disable, or impair the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Limitation of Liability</h2>
              <p>
                EduTech shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Changes to Terms</h2>
              <p>
                EduTech reserves the right to modify these terms at any time. Your continued use of the service after any changes constitutes acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </Card>
    </AuthBackground>
  );
};

export default Terms;
