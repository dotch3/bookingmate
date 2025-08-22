# BookingMate Cypress Test Suite

This directory contains the Cypress end-to-end test automation for the BookingMate application. This Cypress project automates the test cases identified as candidates for automation of the BookingMate app.

## Test Automation Coverage

The following test cases have been evaluated for automation candidacy:

| TC ID | Priority | Title | Candidate for automation? |
|-------|----------|-------|---------------------------|
| TC1   | High     | Common user reserves a slot successfully | ✅ Yes |
| TC2   | High     | Common user cannot create a new reservation if the slot is full | ✅ Yes |
| TC3   | High     | Common user cannot create a second reservation on the same slot for the same day | ✅ Yes |
| TC4   | High     | Common user can create reservations in all slots on same day when slots have capacity | ✅ Yes |
| TC5   | High     | Admin user reserves a slot successfully | ✅ Yes |
| TC6   | High     | Admin user cannot create a new reservation if the slot is full | ✅ Yes |
| TC7   | High     | Common user cancels its own reservation | ✅ Yes |
| TC8   | High     | Admin user cancels its own reservation | ✅ Yes |
| TC9   | High     | Admin user cancels another user's reservation from calendar view | ✅ Yes |
| TC10  | Medium   | Common user gets the list of its reservations | ✅ Yes |
| TC11  | Medium   | Admin user gets the list of its reservations | ✅ Yes |
| TC12  | Low      | Common user without reservations gets message of no reservations | ❌ No |
| TC13  | High     | Admin user can create new user with role "user" | ✅ Yes |
| TC14  | High     | Admin user can create new user with role "admin" | ✅ Yes |
| TC15  | High     | Admin user can edit the role of another user | ✅ Yes |
| TC16  | High     | Admin user can edit the data of another user | ✅ Yes |
| TC17  | High     | Admin user deletes another user | ✅ Yes |
| TC18  | Medium   | Common user should not have access to the Admin panel | ❌ No |
| TC19  | High     | Admin user can edit another user's reservation | ✅ Yes |
| TC20  | High     | Admin user can delete another user's reservation | ✅ Yes |
| TC21  | Medium   | Common user cannot delete another user's reservation | ❌ No |

**Total Test Cases:** 21  
**Automated Test Cases:** 18  
**Automation Coverage:** 85.7%

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your actual values:
     ```
     CYPRESS_BASE_URL=http://localhost:3000
     CYPRESS_ADMIN_EMAIL=admin@test.com
     CYPRESS_ADMIN_PASSWORD=your_admin_password
     CYPRESS_USER_EMAIL=user@test.com
     CYPRESS_USER_PASSWORD=your_user_password
     ```

3. **Start the BookingMate application:**
   ```bash
   cd ../
   npm run dev
   ```

## Running Tests

### Interactive Mode (Cypress GUI)
```bash
npm run cypress:open
```

### Headless Mode
```bash
npm run cypress:run
```

### Run specific test file
```bash
npx cypress run --spec "cypress/e2e/login.cy.js"
```

## Test Structure

- `cypress/e2e/` - Test specification files
  - `login.cy.js` - Login functionality tests
  - `create-reservations.cy.js` - Reservation creation tests (TC1, TC4, TC5)
  - `reservation-validation.cy.js` - Reservation validation tests (TC2, TC3, TC6)
  - `cancel-reservations.cy.js` - Reservation cancellation tests (TC7, TC8, TC9)
  - `list-reservations.cy.js` - Reservation listing tests (TC10, TC11)
  - `admin/user-management.cy.js` - User management tests (TC13-TC17)
  - `admin/reservation-management.cy.js` - Admin reservation management tests (TC19, TC20)
- `cypress/fixtures/` - Test data files (JSON)
- `cypress/support/` - Custom commands and configuration

## Custom Commands

- `cy.cleanSession()` - Clear session data and cookies
- `cy.checkLoginFormLoaded()` - Verify login form elements are visible
- `cy.login(email, password)` - Login with credentials
- `cy.logout()` - Logout current user
- `cy.checkToast(message)` - Verify toast notifications


## Environment Variables

All Cypress environment variables should be prefixed with `CYPRESS_` and can be accessed in tests using `Cypress.env('VARIABLE_NAME')`.