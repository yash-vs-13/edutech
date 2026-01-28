import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Only remove HTML tags, preserve spaces (trim only on submit)
  return input.replace(/[<>]/g, '');
};