# Test Execution Guidelines

## Overview
This document provides detailed guidelines for executing test activities, including manual test execution, exploratory testing, documentation, and automation planning.

## Step-by-Step Execution Guide

### Step 1: Pre-Execution Setup

**1.1 Environment Preparation**
- Ensure the application is running locally (`npm run dev`)
- Verify all features are accessible
- Prepare test data (user accounts, sample reservations)
- Set up screen recording tools for defect documentation

**1.2 Document Templates Preparation**
- Create Word document template for test execution results
- Create Word document template for exploratory session reports
- Create Word document template for defect reports

### Step 2: Manual Test Case Execution

**2.1 Execute 21 Test Cases**
- Reference: `docs/wiki/testCases.md` for complete test case details
- Execute each test case systematically
- Document results in Word table format:

| TC ID | Title | Status | Defect ID | Notes |
|-------|-------|--------|-----------|-------|
| TC01 | User Registration with Valid Data | Passed/Failed/Blocked | DEF-001 (if applicable) | Additional observations |

**2.2 Test Execution Priority Order**
1. **High Priority (13 test cases)**: TC01-TC09, TC13-TC17, TC19-TC20
2. **Medium Priority (7 test cases)**: TC10-TC11, TC18, TC21
3. **Low Priority (1 test case)**: TC12

**2.3 Status Definitions**
- **Passed**: Test executed successfully, expected results achieved
- **Failed**: Test failed due to defect, defect report created
- **Blocked**: Test cannot be executed due to dependency/environment issue

### Step 3: Exploratory Testing with Charters

**3.1 Exploratory Testing Sessions**
Execute exploratory testing using these charters:

> **Legend:**  
> (I) = Information  
> (R) = Risk

### Testing Charters

| Charter | Description |
|---------|-------------|
| **Charter 1: Create reservations (common user and admin)** | Explore the reservation creation flow as a common user applying the heuristic "Testing wisdom - One test is an experiment designed to reveal information." Cover available time slots (morning, afternoon, evening) and error handling when slots are unavailable. |
| **Charter 2: Manage users (admin)** | Explore user creation, edition, and deletion as an admin using heuristics "CRUD" and "Strings." Try long names, special characters, blank fields, duplicate emails, and invalid inputs. Verify role assignment (user/admin) and confirm common users cannot access user management. |
| **Charter 3: Cancel reservations (common user and admin)** | Explore cancelation of reservations applying the heuristic "Risk Testing – imagine a problem and then look for it." Include common user canceling their own reservations, and admin canceling both their own and other users' reservations. |
| **Charter 4: View reservations (common user and admin)** | Explore the navigation and display of reservations applying the heuristic "Navigation." Verify that a common user only sees their own reservations (or a message if none exist), and that an admin can list and manage reservations for all users. |
| **Charter 5: Manage reservations (admin)** | Explore editing and deleting reservations as an admin using heuristics "CRUD" and "Error Guessing." Verify successful updates, consistent deletion behavior, and correct feedback messages on the interface. |
---

### Session Report

| Start date and time | Tester | Module | Charter | Duration | Environment |
|---------------------|--------|--------|---------|----------|-------------|
| 21/08/2025 | Jorge Mercado | Reservations | Charter 1 | 12 minutes | Local environment |
| 22/08/2025 | Jorge Mercado | Users | Charter 2 | 15 minutes | Local environment |
| 23/08/2025 | Jorge Mercado | Reservations | Charter 3 | 10 minutes | Local environment |
| 24/08/2025 | Jorge Mercado | Users | Charter 4 | 12 minutes | Local environment |
| 25/08/2025 | Jorge Mercado | Reservations | Charter 5 | 15 minutes | Local environment |

---

#### Missions
**Charter 1: Create reservations (common user and admin)**

**Mission 1:**
    Explore reservation creation flow for common users and admins  
    With common user account with no existing reservations and admin account with various permission levels  
    To find out, confirm, validate it is possible to create reservations on morning, afternoon, and evening slots  

*Duration:* 12 minutes  

**Notes**  
- (I) I’ve logged into the BookingMate system, and it is possible to create the reservation as common and admin user.  
- (I) The UI looks pretty and friendly in the login, Calendar and Slot views, very intuitive.  
- (I) The color of the slot changes from green (empty), blue (1 reservation) and red (when full slot). This is expected.  
- (I) Notice the defect `BUG001` which is already reported.  
- (I) Tested with 1 and two reservations per slot in 1, 2 and 3 slots.  
- (R) The responsiveness could be affected due to the components of the calendar.  
- (R) The Calendar title text has no contrast; it is difficult to see and thus read.  


**Defects**  
1. The selection of a date from the date picker on Slot view selects a date -1 day erroneously for any user (common, admin) – `BUG005` reported  
2. System throws an error message “Invalid time value” when selecting the “Clean” option from the date picker on the Slot view page – `BUG006` reported  

**Questions**  
- N/A

---

**Charter 2: Manage users (admin)**
**Mission 2:**
  Explore user creation, edition, and deletion functionality for admin users
  With admin account with full permissions and test data including various user types
  To find out, confirm, validate admin can successfully manage users with CRUD operations and string validation
*Duration:* 15 minutes
**Notes**  
- (I) I’ve confirmed the “Delete” action has a confirmation modal before deleting the user, with the user's email shown in the message. The modal allows canceling or proceeding with the deletion.  
- (I) The user is deleted from the database `/users` collection.  
- (R) The user is deleted but their reservations are not deleted on cascade; they still remain in the `/reservations` collection.  
- (I) Using techniques and heuristics for testing the inputs of the “Create User” form.  
- (R) The email and displayName fields have no validations. They accept any size of characters and could be vulnerable to injection attacks.  
- (R) Because of `BUG008`, the admin user has its role changed to “user”.  


**Defects**  
1. After deletion of a user, there is no toast message indicating if the deletion succeeded or failed – `BUG007` reported  
2. Reservations are not deleted on cascade when the owner user is deleted – `BUG008` reported  
3. No validation in the “email” and “displayName” input fields in "Create New User" and "Edit User" modals – `BUG009`  
4. Logging in as admin causes the role to change to “user” and erases the `displayName` in the `/users` collection – `BUG010`  

**Questions**  
- N/A


---

--- 
 @TODO:
**Charter 3: Cancel reservations (common user and admin)**
Mission 3:
  Explore reservation cancellation functionality for both user types
  With common user account with existing reservations and admin account with access to all reservations
  To find out, confirm, validate cancellation works correctly for own and other users' reservations
Duration: 10 minutes
Notes: 

Defects: 

Questions: 


---

**Charter 4: View reservations (common user and admin)**
Mission 4:
  Explore reservation viewing and navigation functionality
  With common user account with some reservations and admin account with system-wide access
  To find out, confirm, validate proper display and navigation of reservations based on user role
Duration: 8 minutes
Notes: 

Defects: 

Questions: 

---

**Charter 5: Manage reservations (admin)**
Mission 5:
  Explore reservation editing and deletion functionality for admin users
  With admin account with full permissions and existing reservations from multiple users
  To find out, confirm, validate admin can successfully edit and delete any user's reservations
Duration: 10 minutes
Notes: 

Defects: 

Questions: 

---


### Step 4: Documentation Management

**5.1 Word Documents Creation**
- Create `Test_Execution_Results.docx`
- Create `Exploratory_Testing_Sessions.docx`
- Create `Defect_Reports.docx` (if defects found)

**5.2 Move to Source Documents**
- Place all Word documents in `docs/source-documents/phase-3/`
- Organize by document type and date

**5.3 Convert to Markdown**
- Create corresponding `.md` files in `docs/wiki/`:
  - `TestExecutionResults.md`
  - `ExploratoryTestingSessions.md`
  - `DefectReports.md`
- Ensure proper formatting for wiki display
- Include tables, links, and references

### Step 6: Automation Planning

**6.1 Test Case Analysis for Automation**
Evaluate each test case against automation criteria:

**Automation Suitability Criteria:**
- Repetitive test cases
- Stable functionality
- Clear pass/fail criteria
- No complex user judgment required
- High business value
- Regression testing candidates

**6.2 Automation Candidate Classification**
Create automation readiness matrix:

| TC ID | Title | Automation Suitable | Priority | Complexity | Notes |
|-------|-------|-------------------|----------|------------|-------|
| TC01 | User Registration | Yes | High | Medium | Good candidate for form automation |
| TC02 | User Login | Yes | High | Low | Simple form validation |

**6.3 Automation Test Suite Planning**
- **High Priority for Automation**: Login, Registration, Basic Reservation Flow
- **Medium Priority**: Calendar Navigation, Admin Functions
- **Low Priority**: Complex UI interactions, Visual validations

**6.4 Cypress Test Structure Planning**
Prepare test organization:
```
cypress/
├── e2e/
│   ├── auth/
│   │   ├── login.cy.js
│   │   └── registration.cy.js
│   ├── reservations/
│   │   ├── create-reservation.cy.js
│   │   └── manage-reservation.cy.js
│   └── admin/
│       └── admin-panel.cy.js
├── fixtures/
└── support/
```

### Step 7: Final Documentation and Reporting

**7.1 Test Summary Report**
Create comprehensive summary including:
- Total test cases executed
- Pass/Fail/Blocked statistics
- Defect summary and severity breakdown
- Exploratory testing insights
- Automation recommendations
- Overall quality assessment

**7.2 Completion Checklist**
- [ ] All 21 test cases executed and documented
- [ ] 5 exploratory testing sessions completed
- [ ] All defects documented and reported
- [ ] Word documents created and moved to source-documents
- [ ] Markdown files created in wiki
- [ ] Automation candidate list prepared
- [ ] Test summary report completed
- [ ] Documentation updated

## Estimated Timeline
- **Manual Test Execution**: 2-3 days
- **Exploratory Testing**: 2 days
- **Documentation**: 1 day
- **Automation Planning**: 1 day
- **Total**: 6-7 days

## Success Criteria
- 100% test case execution coverage
- Complete exploratory testing coverage
- All defects properly documented
- Clear automation roadmap established
- Comprehensive documentation in both Word and Markdown formats

## Templates and Resources

### Test Execution Results Template
```
Test Execution Summary
Date: [Date]
Tester: [Name]
Environment: [Browser/OS]

| TC ID | Title | Status | Defect ID | Execution Time | Notes |
|-------|-------|--------|-----------|----------------|-------|
| TC01  |       |        |           |                |       |
```

### Defect Report Template
```
Defect Report

Defect ID: DEF-XXX
Title: [Brief description]
Severity: [Critical/High/Medium/Low]
Priority: [High/Medium/Low]
Reported By: [Name]
Date: [Date]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Environment:
- Browser: [Browser version]
- OS: [Operating system]
- Application Version: [Version]

Attachments:
- [Screenshots/Videos]

Workaround:
[If available]
```

This document serves as the comprehensive guide for systematic test execution and documentation.