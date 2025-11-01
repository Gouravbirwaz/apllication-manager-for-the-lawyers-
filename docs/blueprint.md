# **App Name**: LawTrackPro

## Core Features:

- Secure Authentication: Enable user authentication via Email/Password and Google Sign-In, leveraging Firebase Authentication. Store profile pictures in Firebase Storage.
- Case Management: Create, read, update, and delete cases with role-based access control (lawyer, client, assistant, admin). Cases stored in Cloud Firestore.
- Document Management: Upload, store, and manage documents related to cases in Firebase Storage, with metadata stored in Cloud Firestore.
- Hearing Management: Schedule and track court hearings with reminders. Hearing data stored in Cloud Firestore.
- Task Management: Assign and track tasks related to cases, with due dates and status updates. Task data stored in Cloud Firestore.
- Automated Notifications: Send push notifications for upcoming hearings and new documents, leveraging Firebase Cloud Messaging.
- Intelligent Document Summary: Automatically generate summaries of uploaded legal documents using OCR and a large language model tool via Cloud Functions, making key information quickly accessible.

## Style Guidelines:

- Primary color: Deep Blue (#1E3A8A) to convey trust, security, and professionalism, vital for legal applications.
- Background color: Light Gray (#F9FAFB), a desaturated version of the primary color, to provide a clean and unobtrusive backdrop.
- Accent color: Gold (#D4AF37), an analogous color to blue, used sparingly for highlighting key actions and information to create contrast.
- Headline font: 'Belleza', a humanist sans-serif font suited for the design/art/fashion field. Body text font: 'Alegreya', a serif typeface suited for long texts. Note: currently only Google Fonts are supported.
- Use simple, professional icons from a consistent set (e.g., Material Icons) to represent case types, document actions, and user roles.
- Maintain a clean, well-organized layout with clear visual hierarchy, using cards and tables to present information in a structured manner.
- Incorporate subtle animations for loading states and transitions to provide feedback and enhance user experience without being distracting.