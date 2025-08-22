# Database Reset Functionality

This document explains the database reset functionality that allows admin users to reset all collections to their initial state.

## Overview

The database reset feature provides a convenient way to:
- Clear all Firestore collections (users, reservations, slotCaps, reservationHistory)
- Remove all Firebase Authentication users (except the current admin)
- Re-seed the database with default users
- Return the application to its initial testing state

## Components

### 1. Reset Utility (`src/utils/resetDatabase.ts`)

Contains the core reset logic:

- **`resetDatabaseToInitialState()`**: Main function that orchestrates the complete reset process
- **`clearFirestoreCollections()`**: Removes all documents from specified collections
- **`clearFirebaseAuthUsers()`**: Handles Firebase Auth user cleanup (requires server-side implementation)
- **`checkAdminPrivileges()`**: Verifies that the current user has admin permissions
- **`getDatabaseStats()`**: Provides statistics about current database state

### 2. DatabaseReset Component (`src/components/DatabaseReset.tsx`)

A React component that provides the user interface for the reset functionality:

- Admin-only access control
- Database statistics display
- Confirmation dialog with detailed information
- Progress indicators during reset process
- Warning messages about data loss

### 3. Integration with AdminUserManagement

The DatabaseReset component is integrated into the Admin User Management page, appearing above the User Seeder component.

## How It Works

### Reset Process

1. **Permission Check**: Verifies the current user has admin privileges
2. **Statistics Loading**: Displays current database state (number of users, reservations, etc.)
3. **Confirmation Dialog**: Shows detailed information about what will be deleted/created
4. **Collection Clearing**: Removes all documents from Firestore collections using batch operations
   - `users` collection (preserves admin@test.com if it exists)
   - `reservations` collection (completely cleared)
   - `slotCaps` collection (completely cleared)
   - `reservationHistory` collection (completely cleared)
5. **Auth Cleanup**: Prepares for Firebase Auth user cleanup (server-side implementation needed)
6. **Re-seeding**: Creates default users using the existing seeding system
7. **Completion**: Shows success message and refreshes statistics

**Important**: The admin@test.com user will be preserved during the reset to maintain system access.

### Default Users Created

After reset, the following default users are created:

| Email | Password | Role | Display Name |
|-------|----------|------|--------------|
| admin@bookingmate.com | admin123 | admin | System Administrator |
| user1@bookingmate.com | user123 | user | John Doe |
| user2@bookingmate.com | user123 | user | Jane Smith |
| manager@bookingmate.com | manager123 | admin | Manager User |

## Usage

### For Administrators

1. **Access**: Log in as an admin user and navigate to User Management
2. **Load Stats**: Click "Load Stats" to see current database state
3. **Initiate Reset**: Click "Reset Database" to open the confirmation dialog
4. **Confirm**: Review the information and click "Reset Database" to proceed
5. **Wait**: The process will show progress indicators during execution
6. **Verify**: Check that the reset completed successfully

### For Testing

This feature is particularly useful for:
- **Test Environment Setup**: Quickly return to a clean state between test runs
- **Demo Preparation**: Reset to default data before demonstrations
- **Development**: Clear test data and start fresh
- **Bug Reproduction**: Ensure consistent starting conditions

## Security Considerations

### Access Control
- Only users with admin role can access the reset functionality
- The component is hidden from non-admin users
- Permission checks are performed before any operations

### Data Protection
- Multiple confirmation steps prevent accidental resets
- Clear warnings about permanent data loss
- The admin@test.com user is specifically preserved during the reset process
- All other user data is permanently deleted

### Production Safety
- **Warning**: This feature should be disabled or restricted in production environments
- Consider implementing additional safeguards for production deployments
- Use environment variables to control availability

## Technical Implementation

### Batch Operations
- Uses Firestore batch operations for efficient deletion
- Handles the 500-operation batch limit automatically
- Provides progress logging for large datasets

### Error Handling
- Comprehensive error catching and logging
- User-friendly error messages via toast notifications
- Graceful degradation if individual operations fail

### State Management
- Loading states for better user experience
- Real-time progress indicators
- Automatic statistics refresh after completion

## Limitations

### Firebase Auth Cleanup
The current implementation has a limitation with Firebase Authentication user cleanup:
- Firebase Client SDK doesn't provide user listing capabilities
- Full implementation requires Firebase Admin SDK on the server side
- Current version logs this limitation and continues with other operations

### Production Considerations
- This feature is designed primarily for development and testing
- Production use requires additional security measures
- Consider implementing server-side validation and logging

## Future Enhancements

### Planned Improvements
1. **Server-side Integration**: Implement Firebase Admin SDK for complete Auth user cleanup
2. **Selective Reset**: Allow resetting specific collections rather than all
3. **Backup Creation**: Automatically create backups before reset
4. **Audit Logging**: Track who performed resets and when
5. **Environment Controls**: Disable in production environments

### Configuration Options
1. **Custom Default Users**: Allow configuration of default users
2. **Reset Scope**: Choose which collections to reset
3. **Confirmation Requirements**: Additional security measures for production

## Troubleshooting

### Common Issues

**Permission Denied**
- Ensure you're logged in as an admin user
- Check Firestore security rules
- Verify user role in the database

**Reset Fails Partially**
- Check browser console for detailed error messages
- Some collections may reset while others fail
- Re-run the reset process if needed

**Authentication Issues**
- Current admin session is preserved
- If logged out, log back in with admin credentials
- Check Firebase Auth configuration

### Support
For issues or questions about the database reset functionality:
1. Check browser console for error messages
2. Review Firestore security rules
3. Verify admin user permissions
4. Contact the development team for assistance