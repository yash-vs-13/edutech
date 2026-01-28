import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../store/components/common/Card';
import AuthBackground from '../components/AuthBackground';

const Privacy = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose max-w-none space-y-4 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including your name, email address, password, and any other information you choose to provide when creating an account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, process your transactions, send you technical notices, and respond to your inquiries.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the circumstances described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cookies</h2>
              <p>
                We use cookies to enhance your experience, analyze site traffic, and personalize content. You can choose to disable cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time through your account settings or by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our support channels.
              </p>
            </section>
          </div>
        </div>
      </Card>
    </AuthBackground>
  );
};

export default Privacy;
