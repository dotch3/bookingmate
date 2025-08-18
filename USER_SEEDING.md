# User Seeding System

This document explains the user seeding system implemented to synchronize Firestore users with the app's user management.

## Overview

The user seeding system ensures that when the app is deployed, it automatically creates default users in both Firebase Authentication and Firestore, making it easy to log in and test the application immediately.

## Components

### 1. Seed Utility (`src/utils/seedUsers.ts`)

Contains the core seeding logic:

- **`defaultUsers`**: Array of default users to be created
- **`seedDefaultUsers()`**: Main function to create all default users
- **`autoSeedUsersIfEmpty()`**: Automatically seeds users if the collection is empty
- **`isUsersCollectionEmpty()`**: Checks if the users collection needs seeding

### 2. UserSeeder Component (`src/components/UserSeeder.tsx`)

A React component for admins to manually manage user seeding:

- Check if users collection is empty
- Manually trigger seeding process
- View list of default users that will be created
- Only visible to admin users

### 3. Auto-Seeding Integration

Integrated into `AuthProvider.tsx` to automatically seed users when the app initializes if the users collection is empty.

## Default Users

The system creates these default users:

| Email | Password | Role | Display Name |
|-------|----------|------|-------------|
| admin@bookingmate.com | admin123 | admin | System Administrator |
| user1@bookingmate.com | user123 | user | John Doe |
| user2@bookingmate.com | user123 | user | Jane Smith |
| manager@bookingmate.com | manager123 | admin | Manager User |

## How It Works

### Automatic Seeding

1. When the app starts, `AuthProvider` calls `autoSeedUsersIfEmpty()`
2. The function checks if the users collection is empty
3. If empty, it automatically creates all default users
4. Each user is created in both Firebase Auth and Firestore

### Manual Seeding

1. Admin users can access the User Seeder component in the User Management page
2. They can check the status of the users collection
3. Manually trigger seeding if needed
4. View the list of users that will be created

### User Creation Process

For each user:

1. Create user in Firebase Authentication using `createUserWithEmailAndPassword`
2. Create corresponding document in Firestore users collection
3. Sign out the newly created user
4. Re-authenticate the admin user (if applicable)

## Security Considerations

⚠️ **Important**: The default passwords are simple and intended for development only. In production:

1. Change all default passwords to strong, unique passwords
2. Consider using environment variables for sensitive data
3. Implement proper user onboarding flow
4. Force password changes on first login

## Usage

### For Development

1. The system automatically seeds users when you first run the app
2. You can log in with any of the default users listed above
3. Use admin accounts to access user management features

### For Production Deployment

1. Update default passwords in `src/utils/seedUsers.ts`
2. Consider disabling auto-seeding in production
3. Use the manual seeding component for controlled user creation

### Accessing the Seeder

1. Log in as an admin user
2. Navigate to User Management page
3. The User Seeder component appears at the top of the page
4. Use the buttons to check status and seed users

## Troubleshooting

### Users Already Exist Error

If you see "email already in use" errors:
- The system will skip existing users and continue
- Check Firebase Console to see existing users
- Use the "Check Users Collection" button to verify status

### Authentication Issues

If seeding fails due to authentication:
- Ensure you're logged in as an admin
- Check Firebase Auth configuration
- Verify Firestore security rules allow user creation

### Permission Errors

If you get permission errors:
- Check Firestore security rules
- Ensure the admin user has proper permissions
- Verify the user's role in Firestore

## Customization

To customize the default users:

1. Edit the `defaultUsers` array in `src/utils/seedUsers.ts`
2. Add or remove users as needed
3. Update roles and display names
4. Test the seeding process

## Files Modified

- `src/utils/seedUsers.ts` - Core seeding logic
- `src/components/UserSeeder.tsx` - Admin seeding component
- `src/admin/AdminUserManagement.tsx` - Added UserSeeder component
- `src/auth/AuthProvider.tsx` - Added auto-seeding on app init