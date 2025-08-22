# Test Case Execution Tracking

This document tracks the execution status of all test cases for the BookingMate application during Phase 3 testing.

## Test Execution Summary

- **Total Test Cases**: 21
- **Priority Distribution**: 13 High, 7 Medium, 1 Low
- **Execution Progress**: 21/21 (100%)
- **Pass Rate**: 71% (15 passed, 6 failed)
- **Detailed Results**: See [TestCaseExecution_Summary.xlsx](../source-documents/TestCaseExecution_Summary.xlsx)

## Test Case Status 
> 100% of test cases were executed

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



- **Not Started**: Test execution has not begun
- **In Progress**: Test is currently being executed
- **Passed**: Test executed successfully with expected results
- **Failed**: Test executed with unexpected results or errors
- **Blocked**: Test cannot be executed due to dependencies
- **Deferred**: Test execution postponed to a later phase

## Defect Reporting

When a test case fails, create a defect report using the [DefectReportTemplate.md](DefectReportTemplate.md) template and reference the defect ID in the table above.

## Test Execution Guidelines

Refer to [TEST_EXECUTION_GUIDELINES.md](../TEST_EXECUTION_GUIDELINES.md) for detailed instructions on test execution procedures and best practices.