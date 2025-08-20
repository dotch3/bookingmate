# Getting Started with BookingMate

This guide will help you set up and run the BookingMate application locally. ⚙️

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/dotch3/bookingmate.git
cd bookingmate
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install Firebase Functions dependencies
```bash
cd functions
npm install
cd ..
```

## Firebase Setup

### 1. Create a Firebase project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Enable Authentication (Email/Password provider)
- Create a Firestore database

### 2. Configure Firebase
- Install Firebase CLI: `npm install -g firebase-tools`
- Login: `firebase login`
- Initialize: `firebase init` (select Firestore, Functions, Hosting)

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Running the Application

### 1. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 2. Deploy Firebase Functions (optional)
```bash
firebase deploy --only functions
```

### 3. Build for production
```bash
npm run build
```

## Default Admin User

After setting up Firebase Auth:
1. Create a user account through the application
2. Manually add the `admin` field to their role in the user document in Firestore
3. Set the role value to `"admin"`

For detailed user seeding instructions, see [USER_SEEDING.md](../USER_SEEDING.md).

## Troubleshooting

### Common Issues

1. **Firebase configuration errors**
   - Ensure all environment variables are correctly set
   - Verify Firebase project settings match your `.env.local` file

2. **Authentication issues**
   - Check that Email/Password provider is enabled in Firebase Auth
   - Verify Firestore security rules allow authenticated users

3. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify Firebase configuration
3. Ensure all dependencies are installed
4. Review the project documentation in the `/docs` folder

## Next Steps

Once the application is running:
1. Create user accounts for testing
2. Set up admin users as needed
3. Explore the calendar and reservation features
4. Review the test documentation for understanding the expected behavior