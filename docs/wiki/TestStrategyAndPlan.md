# Test Strategy and Plan

> **Template adapted based on ISO-29119-3**

This document outlines the comprehensive test strategy and plan for the BookingMate application, covering all aspects of test planning, execution strategy, and quality assurance activities.

---

## 1. Epic and Test Effort Estimation

**Creation of users and reservations**  
**Effort**: High

---

## 2. User Stories and Test Effort Estimation

| Code       | Description           | Effort |
|------------|------------------------|--------|
| JIRA-1001  | Make reservations       | High   |
| JIRA-1002  | Cancel reservations     | High   |
| JIRA-1003  | List my reservations    | Medium |
| JIRA-1004  | Manage users            | High   |
| JIRA-1005  | Manage reservations     | High   |

---

## 3. Test Conditions and Coverage Analysis

### JIRA-1001: Make Reservations

| ID | Test Condition | Expected Result | Layer | Priority |
|----|----------------|-----------------|-------|----------|
| 1  | Common user logged in selects morning on a day with <2 reservations | Reservation is created successfully. A succeed (green) toast is displayed. The UI for the slot shows the name of the user in the list of users with reservations | Web | High |
| 2  | Common user logged in selects afternoon on a day with 2 reservations already created | Reservation cannot be created, the UI shows the message "Slot is full" and does not offer the link to create the reservation | Web | High |
| 3  | Common user logged in attempts two reservations in the same slot/day | Second reservation is not possible, the option to cancel the current reservation will be displayed for the user in the UI | Web | High |
| 4  | Admin logged in creates a reservation for himself in a slot with <2 reservations | Reservation is successfully created in the selected slot. A green toast/message is shown. The UI updates to reflect the list of users with reservations | Web | High |
| 5  | Admin logged in attempts to create a reservation for himself in a slot with 2 reservations already created | Reservation cannot be created, the UI shows the message "Slot is full" and does not offer the link to create the reservation | Web | High |
| 6  | Common user logged in reserves 3 different slots on same day | Reservations are created if the slots have capacity | Web | Medium |
| 7  | Admin logged in attempts to create a reservation for another user in a slot without reservations | The admin has not the ability to create reservations for other users | Web | Medium |

### JIRA-1002: Cancel Reservations

| ID | Test Condition | Expected Result | Layer | Priority |
|----|----------------|-----------------|-------|----------|
| 1  | Common user logged in cancels own reservation (morning slot) | Reservation is deleted a success toast message is shown. UI reflects the change in the list of users with reservations | Web | High |
| 2  | An admin user logged in cancel its own reservation | Reservation deleted and a success toast message is shown. UI reflects the change in the list of users with reservations | Web | High |
| 3  | An admin user logged in cancels another user's reservation | Reservation deleted and a success toast message is shown. UI reflects the change in the list of users with reservations | Web | High |

### JIRA-1003: List My Reservations

| ID | Test Condition | Expected Result | Layer | Priority |
|----|----------------|-----------------|-------|----------|
| 1  | Common user logged in with reservations | On "My Reservations" page, all upcoming reservations for the date selected are listed. The date and the slot time is displayed along with a link to cancel the reservation. | Web | Medium |
| 2  | Admin user logged in with a reservation | On "My Reservations" page, all upcoming reservations for the date selected are listed. The date and the slot time is displayed along with a link to cancel the reservation. | Web | Medium |
| 3  | Common user logged in, without reservations | The reservations page should mention that there are no reservations for that user "No reservations found for this date" | Web | Medium |
| 4  | Common user logged in with 3 reservations for a specific date | The 3 reservations should be listed on the specific date selected on "My Reservations" page | Web | Medium |

### JIRA-1004: Management of Users

| ID | Test Condition | Expected Result | Layer | Priority |
|----|----------------|-----------------|-------|----------|
| 1  | Admin logged in creates a new common user | User is created with role "user", and a success toast message is shown. The new user appears in the "User Management" table | Web | High |
| 2  | Admin logged in creates a new "admin" user | User is created with role "admin" success toast message is shown. The new user appears in the "User Management" table | Web | High |
| 3  | Admin logged in edits existent user | Changes (email/display name/role) saved successfully. Confirmation message shown. Changes persist after reloading | Web | Medium |
| 4  | Admin logged in deletes user | User is removed from DB. All their reservations are also removed. Slot capacities update accordingly. UI list of users reflects the removal of the user | Web | Medium |
| 5  | Common user logged in tries to access management page | The common user should not have access to the management of user's page. User should be redirected to home page | Web | Medium |

### JIRA-1005: Manage Reservations

| ID | Test Condition | Expected Result | Layer | Priority |
|----|----------------|-----------------|-------|----------|
| 1  | Admin user logged in edits a reservation to another slot with capacity | The reservation should be updated a success toast message is shown. The UI list of reservations reflect the changes | Web | High |
| 2  | Admin user logged in deletes any reservation | Reservation deleted and a success toast message is shown message displayed. The UI list of reservations reflects the removal of the reservation. The UI calendar page reflects the removal of the reservation | Web | High |
| 3  | Common user tries to edit a reservation | Edition of reservations are in Admin panel, the page is not accessible by the common users /Admin. They should be redirected to home | Web | High |

---

## 4. Exploratory Testing Strategy

### Testing Missions

| Charter | Description |
|---------|-------------|
| **Charter 1: Create reservations (common user and admin)** | Explore the reservation creation flow as a common user applying the heuristic "Testing wisdom - One test is an experiment designed to reveal information." Cover available time slots (morning, afternoon, evening) and error handling when slots are unavailable. |
| **Charter 2: Manage users (admin)** | Explore user creation, edition, and deletion as an admin using heuristics "CRUD" and "Strings." Try long names, special characters, blank fields, duplicate emails, and invalid inputs. Verify role assignment (user/admin) and confirm common users cannot access user management. |
| **Charter 3: Cancel reservations (common user and admin)** | Explore cancelation of reservations applying the heuristic "Risk Testing – imagine a problem and then look for it." Include common user canceling their own reservations, and admin canceling both their own and other users' reservations. |
| **Charter 4: View reservations (common user and admin)** | Explore the navigation and display of reservations applying the heuristic "Navigation." Verify that a common user only sees their own reservations (or a message if none exist), and that an admin can list and manage reservations for all users. |
| **Charter 5: Manage reservations (admin)** | Explore editing and deleting reservations as an admin using heuristics "CRUD" and "Error Guessing." Verify successful updates, consistent deletion behavior, and correct feedback messages on the interface. |

---

## 5. Non-Functional Testing Strategy

| Type | Description | Expected Result |
|------|-------------|----------------|
| **Security Testing** | Attempt unauthorized access, injection attacks | All actions are blocked or sanitized |
| **Cross-browser Testing** | Run BookingMate on Chrome, Firefox, Safari, Edge (latest versions) and verify UI compatibility | BookingMate displays correctly and functions consistently across all tested browsers |
| **Accessibility Testing** | Evaluate BookingMate pages with screen readers, keyboard-only navigation, and color contrast tools | BookingMate meets at least WCAG 2.1 AA compliance for accessibility |
| **Performance Testing** | Validate the login of 100 users concurrently | System handles it without lag and meets (p95 <=100 ms) |

---

## 6. Automated Testing Strategy

| ID | Condition | Expected Result | Layer |
|----|-----------|-----------------|-------|
| 1  | Common user logged in selects morning on a day with < 2 reservations in morning | Reservation is created successfully. A green toast is displayed. UI updates showing user's name in the reservation list. | Web |
| 2  | Common user attempts to create a reservation in a full afternoon slot (2 already created) | Reservation is not created. UI shows "Slot is full" and does not offer the link to reserve. | Web |
| 3  | Admin user cancels another user's reservation | Reservation is deleted. A success toast is shown. UI updates removing the reservation from the list. | Web |
| 4  | Admin edits a reservation to another slot with capacity | Reservation updated. A success toast is shown. UI list reflects the updated slot and time. | Web |

---

## 7. Test Data Management

| Test Data | Type | Responsible | Status |
|-----------|------|-------------|--------|
| Common user with no reservations | Database Record | Jorge Mercado | To do |
| Common user with 3 reservations on a date | Database Record | Jorge Mercado | To do |
| Admin user | Database Record | Jorge Mercado | To do |
| Day with full slot in the afternoon | Database Record | Jorge Mercado | To do |

---

## 8. Known Defects and Risk Assessment

| ID | Defect | Severity | Layer | Defect ID |
|----|--------|----------|-------|----------|
| 1  | Slot availability does not update immediately after deleting a reservation | High | Web | BUG-1005 |
| 2  | Deleted users' reservations still appear in slot UI and "My Reservations" page | High | Web | BUG-1006 |
| 3  | Toast success messages sometimes display even when operation failed | Low | Web | BUG-1007 |
| 4  | The count of the reservations on the calendar slots is wrong | Medium | Web | BUG-1008 |
| 5  | The tooltip on calendar page for the reservation's summary is displayed only in Chrome browser | Low | Web | BUG-1009 |

---

## 9. Test Execution Strategy

### Phase 3 Preparation
This test plan serves as the foundation for Phase 3 test execution activities, which will include:

- **Manual Test Execution**: Execute all 21 test cases systematically
- **Exploratory Testing Sessions**: Conduct 5 chartered exploratory missions
- **Bug Reporting**: Document and track any defects found
- **Test Results Documentation**: Maintain comprehensive test execution records

### Success Criteria
- All high-priority test cases executed successfully
- Critical defects identified and documented
- Test coverage goals achieved (100% user story coverage)
- Exploratory testing sessions completed

## Related Documentation

- **[Detailed Requirements](DetailedRequirements)** - Complete project requirements and specifications
- **[Test Cases](TestCases)** - Detailed test cases and execution procedures
- **[Home](Home)** - Wiki navigation and overview

---

*Material extracted from course "Leadership in Software Testing" with Júlio de Lima.*  
*www.juliodelima.com.br*