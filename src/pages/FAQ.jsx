import React, { memo } from 'react';
import Card from '../store/components/common/Card';

const FAQ = memo(() => {
  const faqs = [
    {
      question: 'How do I create a new course?',
      answer: 'Click on the "Courses" menu item, then click the "+ Add Course" button. Fill in all required fields including title (10-60 characters), description, category, and difficulty. Add sections and lessons as needed.',
    },
    {
      question: 'What image formats are supported for thumbnails?',
      answer: 'You can upload PNG, JPG, or GIF images up to 5MB in size. Alternatively, you can use an external image URL.',
    },
    {
      question: 'How do I edit a course?',
      answer: 'Navigate to the Courses page, find the course you want to edit, and click the "Edit" button on the course card.',
    },
    {
      question: 'Can I delete multiple courses at once?',
      answer: 'Yes! Use the checkboxes on course cards to select multiple courses, then click "Delete Selected" to remove them all at once.',
    },
    {
      question: 'How do I add sections and lessons to a course?',
      answer: 'When creating or editing a course, scroll to the "Sections & Lessons" section. Click "+ Add Section" to create a section, then click "+ Add Lesson" within that section to add lessons.',
    },
    {
      question: 'What happens if I delete a course?',
      answer: 'Deleting a course is permanent and cannot be undone. Make sure you want to delete the course before confirming the action.',
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {faq.question}
            </h2>
            <p className="text-gray-600">{faq.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;
