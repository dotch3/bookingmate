# Test Execution Guidelines

## Overview
This document provides detailed guidelines for executing test activities, including manual test execution, exploratory testing, documentation, and automation planning.

## Step-by-Step Execution Guide

### Step 1: Pre-Execution Setup ⚙️

**1.1 Environment Preparation**
- Ensure the application is running locally (`npm run dev`)
- Verify all features are accessible
- Prepare test data (user accounts, sample reservations)
- Set up screen recording tools for defect documentation

**1.2 Document Templates Preparation**
- Create a table template for test execution results, see [TestExecutionTemplate.md](./wiki/TestExecutionTemplate.md)
- Create a table template for exploratory session reports, see [ExploratorySessionReportTemplate.md](./wiki/ExploratorySessionReportTemplate.md)
- Create a table template for defect reports, see [DefectReportTemplate.md](./wiki/DefectReportTemplate.md)

### Step 2: Manual Test Case Execution 🧪

**2.1 Status Definitions**
- **Passed**: Test executed successfully, expected results achieved
- **Failed**: Test failed due to defect, defect report created
- **Blocked**: Test cannot be executed due to dependency/environment issue

---

**2.2 Execute 21 Test Cases**
- Reference: [TestCases.md](./wiki/TestCases.md) for complete test case details
- Execute each test case systematically
- Document results in a table format:

| TC ID | Priority | Title                                                                                   | Status | Defect ID | Notes |
|-------|----------|-----------------------------------------------------------------------------------------|--------|-----------|-------|
| TC1   | High     | Common user reserves a slot successfully                                                | Failed | BUG001    | Reservation's day displayed in reservations list is incorrect |
| TC2   | High     | Common user cannot create a new reservation if the slot is full (2 reservations already created on the slot) | Passed |           |       |
| TC3   | High     | Common user cannot create a second reservation on the same slot for the same day        | Passed |           | The previous reservation is cancelled on the second click |
| TC4   | High     | Common user can create reservations in all the slots on same day when slots have capacity | Passed | BUG002    | User can have 6 reservations if the day selected has capacity and 6 reservations in total per day (2 per slot) * 3 slots (morning, afternoon, evening). The mousepointer is showing the "Forbidden" icon when user wants to add a second reservation on a slot with another user's reservation. |
| TC5   | High     | Admin user reserves a slot successfully                                                  | Failed | BUG001    |       |
| TC6   | High     | Admin user cannot create a new reservation if the slot is full (2 reservations already created on the slot) | Passed |           |       |
| TC7   | High     | Common user cancels its own reservation                                                  | Passed |           |       |
| TC8   | High     | Admin user cancels its own reservation                                                   | Passed |           |       |
| TC9   | High     | Admin user cancels another user's reservation from calendar view                         | Failed | BUG003    | Admin cannot cancel from the Calendar slot view, only from the reservation panel - not specified the scope for deletions for the admin - Question for P.O |
| TC10  | Medium   | Common user gets the list of its reservations                                            | Failed | BUG004    | My reservations list other user's reservations too |
| TC11  | Medium   | Admin user gets the list of its reservations                                             | Failed | BUG004    | My reservations list other user's reservations too. The admin probably should get the list of other user's reservations only on Admin panel/reservations table - Question for P.O |
| TC12  | Low      | Common user without reservations gets a message of no reservations                       | Passed |           |       |
| TC13  | High     | Admin user can create new user with role "user"                                          | Passed | BUG007    |       |
| TC14  | High     | Admin user can create new user with role "admin"                                         | Passed | BUG007    |       |
| TC15  | High     | Admin user can edit the role of another user                                             | Passed |           |       |
| TC16  | High     | Admin user can edit the data of another user                                             | Passed |           |       |
| TC17  | High     | Admin user deletes another user                                                          | Passed | BUG008    |       |
| TC18  | Medium   | Common user should not have access to the Admin panel                                    | Passed |           | Common user has not access to the /admin page |
| TC19  | High     | Admin user can edit another user's reservation                                           | Passed |           |       |
| TC20  | High     | Admin user can delete another user's reservation                                         | Passed |           |       |
| TC21  | Medium   | Common user cannot delete another user's reservation                                     | Passed |           | Common user has not access to the /admin page |

---


**2.3 Test Execution Priority Order**
1. **High Priority (13 test cases)**: TC01-TC09, TC13-TC17, TC19-TC20
2. **Medium Priority (7 test cases)**: TC10-TC11, TC18, TC21
3. **Low Priority (1 test case)**: TC12


### Step 3: Exploratory Testing with Charters

**3.1 Exploratory Testing Sessions**
Execute exploratory testing using these charters:

> **Legend:** 
> (I) = Information  
> (R) = Risk

### Testing Charters 🗺️

| Charter | Description |
|---------|-------------|
| **Charter 1: Create reservations (common user and admin)** | Explore the reservation creation flow as a common user applying the heuristic "Testing wisdom - One test is an experiment designed to reveal information." Cover available time slots (morning, afternoon, evening) and error handling when slots are unavailable. |
| **Charter 2: Manage users (admin)** | Explore user creation, edition, and deletion as an admin using heuristics "CRUD" and "Strings." Try long names, special characters, blank fields, duplicate emails, and invalid inputs. Verify role assignment (user/admin) and confirm common users cannot access user management. |
| **Charter 3: Cancel reservations (common user and admin)** | Explore cancelation of reservations applying the heuristic "Risk Testing – imagine a problem and then look for it." Include common user canceling their own reservations, and admin canceling both their own and other users' reservations. |
| **Charter 4: View reservations (common user and admin)** | Explore the navigation and display of reservations applying the heuristic "Navigation." Verify that a common user only sees their own reservations (or a message if none exist), and that an admin can list and manage reservations for all users. |
| **Charter 5: Manage reservations (admin)** | Explore editing and deleting reservations as an admin using heuristics "CRUD" and "Error Guessing." Verify successful updates, consistent deletion behavior, and correct feedback messages on the interface. |
---

### Exploratory Session Report

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

**Mission:** 
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
- None

---

**Charter 2: Manage users (admin)**
**Mission:** 
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
1. None

---

**Charter 3: Cancel reservations (common user and admin)**

**Mission:**  
Explore reservation cancellation functionality for both user types  
With common user account with existing reservations and admin account with access to all reservations  
To find out, confirm, validate cancellation works correctly for own and other users' reservations  

**Duration:** 10 minutes

**Notes**  
- (I) The Toast message is displayed when the reservation is deleted. Cool  
- (I) The reservation is deleted from database `/reservations` collection  
- (R) The admin cannot delete reservations from the Calendar Slot view. This is something to confirm with P.O  

**Defects**
1. None

**Questions**
1. Should the admin have the capability to delete reservations of other users from the Calendar Slot view page? A defect was reported for tracking `BUG003`

---

**Charter 4: View reservations (common user and admin)**

**Mission:**  
Explore reservation viewing and navigation functionality  
With common user account with some reservations and admin account with system-wide access  
To find out, confirm, validate proper display and navigation of reservations based on user role  

**Duration:** 8 minutes

**Notes**  
- (I) I’ve confirmed the user can see the reservations in the Calendar page and in the Slot page too, it shows the “email”  
- (I) The reservations in the list of reservations have already bugs reported: `BUG004`, `BUG005`, `BUG006`  
- (I) The Toast message is displayed when the reservation is deleted. Cool  

**Defects**
1. None

**Questions**
1. None

---

**Charter 5: Manage reservations (admin)**

**Mission:**  
Explore reservation editing and deletion functionality for admin users  
With admin account with full permissions and existing reservations from multiple users  
To find out, confirm, validate admin can successfully edit and delete any user's reservations  

**Duration:** 10 minutes

**Notes**  
- (I) I’ve confirmed the “Delete” action has a confirmation modal before deleting the reservation with the reservation data in the message. The modal can cancel or proceed  
- (I) The admin can change/edit the slot time for the reservation from the admin panel  
- (I) The date picker on Edit reservation has the same bug reported in `BUG005`  
- (I) There is no key event for cancelling on the modal component. For example, pressing `ESC` should close the modal  

**Defects**
1. None

**Questions**
1. Should we have key events on the Create user, Edit user, Delete User, Edit reservation, and Delete reservation modals?

---
### Step 4: Automation Testing 🤖 
Identify the candidates for automation testing based on the test cases and exploratory sessions.
- Test cases with high priority and repeated actions
-Based on the resultant table of tes case execution,lets add a column: Candidate for Automation ? Yes/No answer
 
 | TC ID | Priority | Title                                                                                   | Status | Defect ID | Notes | Candidate for automation? |
|-------|----------|-----------------------------------------------------------------------------------------|--------|-----------|-------|----------------------------|
| TC1   | High     | Common user reserves a slot successfully                                                | Failed | BUG001    | Reservation's day displayed in reservations list is incorrect | ✅ Yes |
| TC2   | High     | Common user cannot create a new reservation if the slot is full                         | Passed |           |       | ✅ Yes |
| TC3   | High     | Common user cannot create a second reservation on the same slot for the same day        | Passed |           | The previous reservation is cancelled on the second click | ✅ Yes |
| TC4   | High     | Common user can create reservations in all slots on same day when slots have capacity   | Passed | BUG002    | Forbidden icon when user tries to add a second reservation on a slot with another user's reservation | ✅ Yes |
| TC5   | High     | Admin user reserves a slot successfully                                                  | Failed | BUG001    |       | ✅ Yes |
| TC6   | High     | Admin user cannot create a new reservation if the slot is full                          | Passed |           |       | ✅ Yes |
| TC7   | High     | Common user cancels its own reservation                                                  | Passed |           |       | ✅ Yes |
| TC8   | High     | Admin user cancels its own reservation                                                   | Passed |           |       | ✅ Yes |
| TC9   | High     | Admin user cancels another user's reservation from calendar view                         | Failed | BUG003    | Admin cannot cancel from the calendar view | ✅ Yes |
| TC10  | Medium   | Common user gets the list of its reservations                                            | Failed | BUG004    | Lists other users' reservations too | ✅ Yes |
| TC11  | Medium   | Admin user gets the list of its reservations                                             | Failed | BUG004    | Same issue as TC10 | ✅ Yes |
| TC12  | Low      | Common user without reservations gets message of no reservations                         | Passed |           |       | ❌ No |
| TC13  | High     | Admin user can create new user with role "user"                                          | Passed | BUG007    |       | ✅ Yes |
| TC14  | High     | Admin user can create new user with role "admin"                                         | Passed | BUG007    |       | ✅ Yes |
| TC15  | High     | Admin user can edit the role of another user                                             | Passed |           |       | ✅ Yes |
| TC16  | High     | Admin user can edit the data of another user                                             | Passed |           |       | ✅ Yes |
| TC17  | High     | Admin user deletes another user                                                          | Passed | BUG008    |       | ✅ Yes |
| TC18  | Medium   | Common user should not have access to the Admin panel                                    | Passed |           | Common user has not access to the /admin page | ❌ No |
| TC19  | High     | Admin user can edit another user's reservation                                           | Passed |           |       | ✅ Yes |
| TC20  | High     | Admin user can delete another user's reservation                                         | Passed |           |       | ✅ Yes |
| TC21  | Medium   | Common user cannot delete another user's reservation                                     | Passed |           | Common user has not access to the /admin page | ❌ No |


---

### Step 5: Final Documentation and Reporting

**3.1 Completion Checklist**
- [x] All 21 test cases executed and documented
- [x] 5 exploratory testing sessions completed
- [x] All defects documented and reported
- [x] Word documents created and moved to source-documents
- [x] Markdown files created in wiki
- [x] Automation candidate list prepared
- [x] Test summary report completed
- [x] Documentation updated

## Success Criteria
- 100% test case execution coverage
- Complete exploratory testing coverage
- All defects properly documented
- Clear automation roadmap established
- Comprehensive documentation in both Word and Markdown formats