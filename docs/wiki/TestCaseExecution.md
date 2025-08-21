# Test Case Execution Tracking

This document tracks the execution status of all test cases for the BookingMate application during Phase 3 testing.

## Test Execution Summary

- **Total Test Cases**: 21
- **Priority Distribution**: 13 High, 7 Medium, 1 Low
- **Execution Progress**: 0/21 (0%)
- **Pass Rate**: 0%
- **Detailed Results**: See [TestCaseExecution_Summary.xlsx](/Users/dotch3/Documents/MENTORIAQA2.0/projetos/portfolio-project/TestCaseExecution_Summary.xlsx) for comprehensive metrics

## Test Case Status

| TC ID | Priority | Title | Status | Defect ID | Notes |
|-------|----------|-------|--------|-----------|-------|
| TC1   | High     | Common user reserves a slot successfully | Not Started | | |
| TC2   | High     | Common user cannot create a new reservation if the slot is full (2 reservations already created on the slot) | Not Started | | |
| TC3   | High     | Common user cannot create a second reservation on the same slot for the same day | Not Started | | |
| TC4   | High     | Common user can create reservations in all the slots on same day when slots have capacity | Not Started | | |
| TC5   | High     | Admin user reserves a slot successfully | Not Started | | |
| TC6   | High     | Admin user cannot create a new reservation if the slot is full (2 reservations already created on the slot) | Not Started | | |
| TC7   | High     | Common user cancels its own reservation | Not Started | | |
| TC8   | High     | Admin user cancels its own reservation | Not Started | | |
| TC9   | High     | Admin user cancels another user's reservation | Not Started | | |
| TC10  | Medium   | Common user gets the list of its reservations | Not Started | | |
| TC11  | Medium   | Admin user gets the list of its reservations | Not Started | | |
| TC12  | Low      | Common user without reservations gets a message of no reservations | Not Started | | |
| TC13  | High     | Admin user can create new user with role "user" | Not Started | | |
| TC14  | High     | Admin user can create new user with role "admin" | Not Started | | |
| TC15  | High     | Admin user can edit the role of another user | Not Started | | |
| TC16  | High     | Admin user can edit the data of another user | Not Started | | |
| TC17  | High     | Admin user deletes another user | Not Started | | |
| TC18  | Medium   | Common user should not have access to the Admin panel | Not Started | | |
| TC19  | High     | Admin user can edit another user's reservation | Not Started | | |
| TC20  | High     | Admin user can delete another user's reservation | Not Started | | |
| TC21  | Medium   | Common user cannot delete another user's reservation | Not Started | | |

## Status Definitions

- **Not Started**: Test execution has not begun
- **In Progress**: Test is currently being executed
- **Passed**: Test executed successfully with expected results
- **Failed**: Test executed with unexpected results or errors
- **Blocked**: Test cannot be executed due to dependencies
- **Deferred**: Test execution postponed to a later phase

## Defect Reporting

When a test case fails, create a defect report using the [DefectReports.md](/Users/dotch3/Documents/MENTORIAQA2.0/projetos/portfolio-project/bookingmate/docs/wiki/DefectReports.md) template and reference the defect ID in the table above.

## Test Execution Guidelines

Refer to [TEST_EXECUTION_GUIDELINES.md](/Users/dotch3/Documents/MENTORIAQA2.0/projetos/portfolio-project/bookingmate/docs/TEST_EXECUTION_GUIDELINES.md) for detailed instructions on test execution procedures and best practices.