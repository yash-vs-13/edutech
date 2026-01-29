# EduTech (Course Management System)

A Vite + React + Redux Toolkit single-page app for managing courses, enrollments, lessons, and basic authentication flows (localStorage-based).

## Tech stack

- **Frontend**: React 18, React Router DOM
- **State**: Redux Toolkit + React Redux
- **Styling**: Tailwind CSS
- **Charts (optional pages/components)**: Recharts
- **Rich text**: React Quill
- **Sanitization**: DOMPurify (via `src/utils/sanitize.js`)
- **Build tool**: Vite

## Getting started

### Prerequisites

- Node.js 18+ (recommended)
- npm (comes with Node)

### Install

```bash
npm install
```

### Run (development)

```bash
npm run dev
```

Vite will start the dev server (see `vite.config.js` for the configured port/open behavior).

## Scripts

Defined in `package.json`:

- **dev**: start Vite dev server

## Key features

- **Authentication (local demo)**:
  - Sign up / sign in
  - Forgot password (OTP simulation)
  - Profile update
  - Change password (via forgot password flow when launched from Profile)
  - Delete account (with redirect to Sign In)
- **Courses**:
  - Browse courses (All Courses)
  - Course details page with sections/lessons
  - Enroll/unenroll
  - My Courses list with filtering/search and progress display
- **Lessons**:
  - Lesson details pop-up (from course details)
  - Attached file: View only (no Download in pop-up)
  - Content: shown only when the lesson has actual text (empty/whitespace content is hidden); View only (no Download as HTML)

## Routing overview

Routes are defined in `src/App.jsx` using React Router.

Common routes:

- **/signin**: Sign In
- **/signup**: Sign Up
- **/forgot-password**: Forgot/Reset Password (supports navigation from Profile via `state.from`)
- **/terms**: Terms
- **/privacy-policy**: Privacy Policy
- **/**: Dashboard (protected)
- **/courses**: All Courses (protected)
- **/my-courses**: My Courses (protected)
- **/courses/:id**: Course Detail (protected)
- **/courses/:courseId/lessons/:lessonId**: Lesson View (protected; may be used for “open in new tab” flows if enabled)
- **/profile**: My Profile (protected)
- **/help**: Help (protected)
- **/faq**: FAQ (protected)

## Data storage model (important)

This project uses **browser storage** as a lightweight backend replacement:

- **Users**: stored in `localStorage` under `cms_users`
- **Auth state**: handled in Redux (`src/store/slices/authSlice.js`) and persisted via `src/utils/localstorage.js`
- **Courses / enrollments**: stored and managed in Redux slices (see below)

Because of this:

- Data will vary per browser/profile.
- Clearing browser storage resets the app’s data.

## Project structure (high level)

```text
src/
  components/              Shared app-level components (ProtectedRoute, ErrorBoundary, ScrollToTop)
  pages/                   Route-level pages (Dashboard, Courses, MyCourses, Profile, etc.)
  store/
    components/            UI components used across pages (common/) and course components (courses/)
    slices/                Redux slices (authSlice, courseSlice, enrollmentSlice)
    index.js               Redux store setup
  utils/                   Helpers (sanitize, localstorage persistence)
```

## Recent flow-related changes

- **Course create/update form (lesson files)**  
  Lesson file selection is kept in memory only: `File` objects are stripped before persisting courses to localStorage, so after a refresh or re-opening a course for edit, the "Lesson file" section will show no selected file. The form only displays "Selected: …" when a real file is present (avoids "Selected: undefined" from stale data).

- **Lesson details pop-up**  
  - The **Content** block (heading + View + prose) is shown only when the lesson has visible text; content that is empty or only tags/whitespace (e.g. `<p><br></p>`) does not show this section.  
  - **Download** has been removed: attached files and lesson content support **View** only (no Download link/button in the pop-up).

## Notes on “Change Password” flow

From **My Profile**, the “Change Password” button navigates to `/forgot-password` with:

```js
navigate('/forgot-password', { state: { from: '/profile' } })
```

When the reset completes successfully, the app redirects back to:

- **/profile** if launched from Profile
- otherwise **/signin**

## Troubleshooting

### Search input border looks “missing” while typing

The Search inputs in All Courses / My Courses are styled with Tailwind. If you want a visible focus border or no focus highlight, update the input classes in:

- `src/store/components/courses/CourseList.jsx` (All Courses)
- `src/pages/MyCourses.jsx` (My Courses)

### Windows build error: `Error: spawn EPERM` (esbuild/Vite)

On some Windows setups, Vite/esbuild can fail with `spawn EPERM` due to antivirus/permissions/locked files.

Things to try:

- Close other Node/Vite processes and retry
- Run the terminal as Administrator
- Ensure the project folder is not blocked by antivirus/Defender “Controlled folder access”
- Delete and reinstall dependencies:

If the issue persists, try moving the project to a simpler path (e.g. `C:\dev\edutech`) to avoid long path/permission edge cases.

## Contributing

- Keep UI changes consistent with Tailwind patterns already used in the project.
- Prefer reusing shared components in `src/store/components/common/`.
- When adding HTML content rendering, sanitize with `sanitizeHtml()` to avoid XSS.

