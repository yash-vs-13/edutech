import React, { memo, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '../common/Button';
import defaultThumbnail from '../../../assets/default-course-thumbnail.png';
import { sanitizeInput, sanitizeHtml } from '../../../utils/sanitize';

const CourseForm = memo(({ course, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    difficulty: 'beginner',
    sections: [],
  });

  const [errors, setErrors] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);

  const categories = [
    'Information Technology',
    'Mechanical',
    'Civil',
    'Aeronautics',
    'Biotech',
    'Others',
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  useEffect(() => {
    if (course) {
      const thumbnail = course.thumbnail || '';


      setFormData({
        title: course.title || '',
        description: course.description || '',
        thumbnail: thumbnail,
        category: course.category || '',
        difficulty: course.difficulty || course.level || 'beginner',
        sections: course.sections || [],
      });
    }
  }, [course]);

  const validateTitle = (title) => {
    if (!title || title.trim().length === 0) {
      return 'Title is required';
    }
    if (title.length < 10) {
      return 'Title must be at least 10 characters';
    }
    if (title.length > 60) {
      return 'Title must not exceed 60 characters';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate title on change
    if (name === 'title') {
      const error = validateTitle(value);
      setErrors((prev) => ({
        ...prev,
        title: error,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));

    // Clear description error when user types
    if (errors.description) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
  };

  const handleThumbnailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      thumbnail: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: 'Please select a valid image file',
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        thumbnail: 'Image size must be less than 5MB',
      }));
      return;
    }

    setUploadedFile(file);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.thumbnail;
      return newErrors;
    });

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: reader.result,
      }));
    };
    reader.onerror = () => {
      setErrors((prev) => ({
        ...prev,
        thumbnail: 'Failed to read the image file',
      }));
    };
    reader.readAsDataURL(file);
  };



  const removeThumbnail = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: '',
    }));
    setUploadedFile(null);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.thumbnail;
      return newErrors;
    });
  };

  // Section Management
  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: '',
      lessons: [],
    };
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setEditingSection(newSection.id);
  };

  const updateSection = (sectionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      ),
    }));
  };

  const deleteSection = (sectionId) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
    if (editingSection === sectionId) {
      setEditingSection(null);
    }
  };

  // Lesson Management
  const addLesson = (sectionId) => {
    // Find the section
    const section = formData.sections.find(s => s.id === sectionId);

    // Check if there are existing lessons with empty title or description
    if (section && section.lessons.length > 0) {
      const hasEmptyLessons = section.lessons.some(
        lesson => !lesson.title || lesson.title.trim() === '' || !lesson.description || lesson.description.trim() === ''
      );

      if (hasEmptyLessons) {
        setErrors({ lessons: 'Please complete all existing lessons before adding a new one' });
        return;
      }
    }

    // Clear any previous lesson errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.lessons;
      return newErrors;
    });

    const newLesson = {
      id: Date.now().toString(),
      title: '',
      content: '',
      description: '',
      file: null,
      durationMinutes: null,
    };
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, lessons: [...section.lessons, newLesson] }
          : section
      ),
    }));
    setEditingLesson({ sectionId, lessonId: newLesson.id });
  };

  const updateLesson = (sectionId, lessonId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            lessons: section.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            ),
          }
          : section
      ),
    }));
  };

  const deleteLesson = (sectionId, lessonId) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
          }
          : section
      ),
    }));
    if (editingLesson?.lessonId === lessonId) {
      setEditingLesson(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate title
    const titleError = validateTitle(formData.title);
    if (titleError) {
      setErrors({ title: titleError });
      return;
    }

    // Validate required fields
    if (!formData.description || formData.description.trim() === '' || formData.description === '<p><br></p>') {
      setErrors({ description: 'Description is required' });
      return;
    }

    if (!formData.category) {
      setErrors({ category: 'Category is required' });
      return;
    }

    // Validate sections
    const hasEmptySections = formData.sections.some(
      (section) => !section.title || section.title.trim() === ''
    );
    if (hasEmptySections) {
      setErrors({ sections: 'All sections must have a title' });
      return;
    }

    if (formData.sections.length === 0) {
      setErrors({ sections: 'At least one section is required' });
      return;
    }

    // Validate lessons
    const hasEmptyLessons = formData.sections.some((section) => {
      if (section.lessons.length === 0) return true;
      return section.lessons.some(
        (lesson) =>
          !lesson.title ||
          lesson.title.trim() === '' ||
          !lesson.description ||
          lesson.description.trim() === ''
      );
    });
    if (hasEmptyLessons) {
      setErrors({ lessons: 'All sections must have at least one lesson, and all lessons must have a title and short description' });
      return;
    }

    const sanitizedData = {
      ...formData,
      title: sanitizeInput(formData.title.trim()),
      description: sanitizeHtml(formData.description),
      sections: formData.sections.map((section) => ({
        ...section,
        title: sanitizeInput(section.title.trim()),
        lessons: section.lessons.map((lesson) => ({
          ...lesson,
          title: sanitizeInput(lesson.title.trim()),
          content: sanitizeHtml(lesson.content),
        })),
      })),
    };

    onSubmit(sanitizedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Title <span className="text-gray-500 text-xs">(10-60 characters)</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Complete Python Bootcamp"
          className={`w-full px-4 py-2 border rounded-lg outline-none ${errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <div className={`border rounded-lg overflow-hidden ${errors.description ? 'border-red-500' : 'border-gray-300'}`}>
          <ReactQuill
            value={formData.description}
            onChange={handleDescriptionChange}
            theme="snow"
            placeholder="Write a detailed description of the course..."
            modules={{
              toolbar: false,
            }}
            className="bg-white border-0"
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail (Optional)
        </label>

        {/* Method Selection */}


        {/* URL Input */}


        {/* File Upload */}
        {/* File Upload */}
        <div>
          <label className="block">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors cursor-pointer">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </label>
          {uploadedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
          {errors.thumbnail && (
            <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
          )}
        </div>

        {/* Preview */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              {formData.thumbnail ? 'Preview:' : 'Default Thumbnail (will be used if none uploaded):'}
            </p>
            {formData.thumbnail && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={removeThumbnail}
              >
                Remove
              </Button>
            )}
          </div>
          <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
            <img
              src={formData.thumbnail || defaultThumbnail}
              alt="Thumbnail preview"
              className="max-w-full h-auto max-h-48 rounded-lg object-contain mx-auto"
              onError={(e) => {
                if (e.target.src !== defaultThumbnail) {
                  e.target.src = defaultThumbnail;
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Category and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg outline-none h-[42px] ${errors.category ? 'border-red-500' : 'border-gray-300'} ${formData.category ? 'text-gray-900' : 'text-gray-400'
              }`}
          >
            <option value="" disabled hidden>
              Select a category
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-gray-900">
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level
          </label>
          <div className="flex gap-4 items-center h-[42px]">
            {difficulties.map((diff) => (
              <label key={diff.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value={diff.value}
                  checked={formData.difficulty === diff.value}
                  onChange={handleChange}
                  className="mr-2 text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{diff.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sections & Lessons */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Sections & Lessons
          </label>
          {formData.sections.length > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={addSection}
            >
              + Add Section
            </Button>
          )}
        </div>

        {errors.sections && (
          <p className="mb-2 text-sm text-red-600">{errors.sections}</p>
        )}
        {errors.lessons && (
          <p className="mb-2 text-sm text-red-600">{errors.lessons}</p>
        )}



        <div className="space-y-4">
          {formData.sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Section Title
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section.id, 'title', e.target.value)
                    }
                    placeholder="e.g., Introduction"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="ml-4 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Lessons ({section.lessons.length})
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => addLesson(section.id)}
                  >
                    + Add Lesson
                  </Button>
                </div>

                {section.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                  >
                    {editingLesson?.sectionId === section.id &&
                      editingLesson?.lessonId === lesson.id ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-700">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(
                                section.id,
                                lesson.id,
                                'title',
                                e.target.value
                              )
                            }
                            placeholder="e.g., Setting up the environment"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-700">
                            Short Description
                          </label>
                          <textarea
                            value={lesson.description}
                            onChange={(e) =>
                              updateLesson(
                                section.id,
                                lesson.id,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder="Briefly describe what this lesson covers..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-700">Lesson File (Optional)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.mp4,.mp3"
                            onChange={(e) =>
                              updateLesson(
                                section.id,
                                lesson.id,
                                'file',
                                e.target.files[0]
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                          />
                          <p className="text-xs text-gray-500">
                            Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, ZIP, MP4, MP3
                          </p>
                          {lesson.file && (
                            <div className="flex items-center justify-between mt-2 p-2 bg-gray-50 rounded-lg border border-gray-300">
                              <p className="text-xs text-gray-700 flex-1 truncate">
                                Selected: {lesson.file.name}
                              </p>
                              <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                onClick={() =>
                                  updateLesson(
                                    section.id,
                                    lesson.id,
                                    'file',
                                    null
                                  )
                                }
                                className="ml-2"
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-700">
                            Duration (Optional)
                          </label>
                          <select
                            value={lesson.durationMinutes ?? ''}
                            onChange={(e) =>
                              updateLesson(
                                section.id,
                                lesson.id,
                                'durationMinutes',
                                e.target.value ? parseInt(e.target.value, 10) : null
                              )
                            }
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none ${lesson.durationMinutes ? 'text-gray-900' : 'text-gray-400'}`}
                          >
                            <option value="" disabled hidden>
                              Select duration
                            </option>
                            <option value="15" className="text-gray-900">15 minutes</option>
                            <option value="30" className="text-gray-900">30 minutes</option>
                            <option value="45" className="text-gray-900">45 minutes</option>
                            <option value="60" className="text-gray-900">60 minutes</option>
                          </select>
                          <p className="text-xs text-gray-500">
                            This helps learners understand how long this lesson will take.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Content (Optional)
                          </label>
                          <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <ReactQuill
                              value={lesson.content}
                              onChange={(value) =>
                                updateLesson(
                                  section.id,
                                  lesson.id,
                                  'content',
                                  value
                                )
                              }
                              theme="snow"
                              placeholder="Write the full lesson content here..."
                              modules={{
                                toolbar: false,
                              }}
                              className="bg-white border-0"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingLesson(null)}
                          >
                            Done
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              deleteLesson(section.id, lesson.id)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {lesson.title || `Lesson ${lessonIndex + 1}`}
                            </h4>
                            {lesson.description && (
                              <p className="text-xs text-gray-500">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              setEditingLesson({
                                sectionId: section.id,
                                lessonId: lesson.id,
                              })
                            }
                          >
                            Edit
                          </Button>
                        </div>
                        {lesson.content && (
                          <div
                            className="text-sm text-gray-600 mt-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: lesson.content.substring(0, 100) + '...',
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {section.lessons.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No lessons yet. Click "Add Lesson" to get started.
                  </p>
                )}
              </div>
            </div>
          ))}

          {formData.sections.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-2">No sections added yet.</p>
              <Button
                type="button"
                variant="primary"
                onClick={addSection}
              >
                + Add Your First Section
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {course ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
});

CourseForm.displayName = 'CourseForm';

export default CourseForm;
