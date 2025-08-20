# 📝 Test Cases for BookMate

> **Test Cases based on ISO-29119-3 Standard**
---
This document contains all test cases developed for the BookingMate application, organized by functionality and priority. Each test case follows the ISO-29119-3 structure with detailed steps, expected results, and postconditions.

---

## Test Case Overview

**Total Test Cases**: 20  
**High Priority**: 12 cases  
**Medium Priority**: 8 cases  
**User Story Coverage**: 100% (5/5 user stories)

---

## Test Case: TC1

**Title:** Common user reserves a slot successfully  
**Priority:** High  
**User Story:** JIRA-1001 Make reservations  
**Preconditions:**  
- Common user’s credentials  
- A Day with capacity for new reservations  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Search in the Calendar the day with capacity for new reservations and click on it | The Slot view belonging to the day selected should be opened |
| 3 | Click on the “Click to reserve” link on the slot selected for the new reservation | The reservation should be created for the user logged in. A toast message should be displayed “Reservation created successfully!” |

**Postconditions:**  
- The reservation created is in the database  
- The Slot cell should have the list of reservation updated listing the email of the user representing the new reservation created  
- The counting of reservations on the Calendar view should be updated increasing in +1  
- The e-mail of the user should be displayed on the Slot Cell on the Calendar view  

---

## Test Case: TC2

**Title:** Common user cannot create a new reservation if the slot is full (2 reservations already created on the slot)  
**Priority:** High  
**User Story:** JIRA-1001 Make reservations  
**Preconditions:**  
- Common user’s credentials  
- A Day with 2 reservations already created on the morning slot  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Search on the Calendar the day with the 2 reservations already created on the morning slot and click on it | The Slot view should be opened |
| 3 | Search for the slot morning and Notice there is a message “Slot is full” and when mouseover the slot the “forbidden” icon is set as a mouse pointer | N/A |
| 4 | Click on the morning slot | No reservation is created and the error toast message “This slot is full (maximum 2 reservations)” |

**Postconditions:**  
- Reservation is NOT created  

---

## Test Case: TC3

**Title:** Common user cannot create a second reservation on the same slot for the same day  
**Priority:** High  
**User Story:** JIRA-1001 Make reservations  
**Preconditions:**  
- Common user’s credentials  
- A Day with 1 reservation already created on the morning slot  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Search on the Calendar the day with the reservation already created on the morning slot and click on it | The Slot view should be opened and list the first reservation created by the user |
| 3 | Click on the morning slot where the user has already a reservation | The first reservation should be cancelled, and a toast message should be displayed “Reservation cancelled successfully” |

**Postconditions:**  
- Second reservation is NOT created  
- The counting of reservations on the Calendar view should be updated increasing in +3  
- The e-mail of the user should be displayed on the Slot Cell on the Calendar view with the (3) indicating that exists 3 reservations by that user  

---

## Test Case: TC4

**Title:** Common user can create reservations in all the slots on same day when slots have capacity  
**Priority:** High  
**User Story:** JIRA-1001 Make reservations  
**Preconditions:**  
- Common user’s credentials  
- A Day with no reservations  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Search on the Calendar the day with no reservations and click on it | The Slot view should be opened and list zero reservations in the slots |
| 3 | Click on the morning, afternoon and evening slots | The three reservations should be created success toast message should be displayed for each reservation. |

**Postconditions:**  
- Three reservations are created in database  
- The first reservation is cancelled, and the Slot Cell view shows no reservation scheduled  

---

## Test Case: TC14

**Title:** Admin user can create new user with role “admin”  
**Priority:** High  
**User Story:** JIRA-1004 – Manage users  
**Preconditions:**  
- Admin user’s credentials  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Click on “Admin Panel “button located at the header | The /admin page should be opened |
| 3 | Notice the “User Management” section is displayed and contains the “Users Directory” table | N/A |
| 4 | Click on “New user” button | The “Create new user” modal should be opened |
| 5 | Fulfill the form with valid data<br>email: admintest@test.com<br>password: 123456<br>Display name: admin test user<br>Select the role: “admin” | N/A |
| 6 | Click on “Create user” button | Success toast message is displayed “New user created!”<br>The user should be listed on the “User management” table with role “admin” |

**Postconditions:**  
- Database for users should have a new record belonging to the user recently created  

---

## Test Case: TC15

**Title:** Admin user can edit the role of another user  
**Priority:** High  
**User Story:** JIRA-1004 – Manage users  
**Preconditions:**  
- Admin user’s credentials  
- A user to be edited  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Click on “Admin Panel “button located at the header | The /admin page should be opened |
| 3 | Notice the “User Management” section is displayed and contains the “Users Directory” table | N/A |
| 4 | Find in the users table the email of the user to be edited and take note of the row | The row of the user to be edited should be listed |
| 5 | Click on the dropdown on role column and change it. From user to admin or vice versa | The new role selected should be updated on the “Role” column. Success toast message is displayed indicating user was updated |

**Postconditions:**  
- The role of the user should be updated in the database  
- The users table should show the new role updated  

---

## Test Case: TC16

**Title:** Admin user can edit the data of another user  
**Priority:** High  
**User Story:** JIRA-1004 – Manage users  
**Preconditions:**  
- Admin user’s credentials  
- A user to be edited  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Click on “Admin Panel “button located at the header | The /admin page should be opened |
| 3 | Notice the “User Management” section is displayed and contains the “Users Directory” table | N/A |
| 4 | Find in the users table the email of the user to be edited and click on “Edit” button | The Edit user modal should be opened |
| 5 | Update the user’s data:<br>email: new-email@test.com<br>display name: Updated user<br>Role: from user to admin or vice versa | N/A |
| 6 | Click on “Update user” button | A Success toast message should be displayed, and the user’s table should show the new data for the user edited |

**Postconditions:**  
- The data in the database should be updated properly  

---

## Test Case: TC17

**Title:** Admin user deletes another user  
**Priority:** High  
**User Story:** JIRA-1004 – Management of users  
**Preconditions:**  
- Admin user’s credentials  
- A user to be deleted  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Click on “Admin Panel “button located at the header | The /admin page should be opened |
| 3 | Notice the “User Management” section is displayed and contains the “Users Directory” table | N/A |
| 4 | Find in the users table the email of the user to be edited and click on “Delete” button | The Delete user modal should be opened |
| 5 | Read the text in the warning | No typos should exist, and the text should be understandable |
| 6 | Click on “Delete user” button | A Success toast message should be displayed, and the user should not be listed on the user’s table anymore |

**Postconditions:**  
- The user should be deleted from the database “users” collection  

---

## Test Case: TC17

**Title:** Common user should not have access to the “Admin panel”  
**Priority:** Medium  
**User Story:** JIRA-1004 - Manage users  
**Preconditions:**  
- Common user’s credentials  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Notice that “Admin Panel” button is not available at the header | The /admin page should not be visible |
| 3 | Edit the URL adding the “/admin” to the domain. Ex: http://mydomain/admin | The browser should redirect the user to the Home page |

---

## Test Case: TC18

**Title:** Admin user can edit another user’s reservation  
**Priority:** High  
**User Story:** JIRA-1005 – Manage reservations  
**Preconditions:**  
- Admin user’s credentials  
- A reservation to edit  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Notice that “Admin Panel “is available at the header and click on it | The /admin page should be opened |
| 3 | Notice the “Reservations” button is show and click on it | The reservations table should be displayed |
| 4 | Find the row of the reservation to edit and click on its “Edit “button | The “Edit reservation” modal should be opened |
| 5 | Change the date, the time slot and click on “Update reservation” | The success toast message. “Reservation updated successfully” should be displayed<br>The reservation data should be updated |

**Postconditions:**  
- The Day and time slot data of the reservation should be updated in the /reservations collection  

---

## Test Case: TC19

**Title:** Admin user can delete another user’s reservation  
**Priority:** High  
**User Story:** JIRA-1005 – Manage reservations  
**Preconditions:**  
- Admin user’s credentials  
- A reservation to delete  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Notice that “Admin Panel “is available at the header and click on it | The /admin page should be opened |
| 3 | Notice the “Reservations” button is show and click on it | The reservations table should be displayed |
| 4 | Find the row of the reservation to delete and click on its “Delete “button | The “Delete reservation” modal should be opened |
| 5 | Notice the information in the modal is displayed and this should not have any typo or misinformation | N/A |
| 6 | Click on “Delete reservation” button | The success toast message. “Reservation deleted successfully” should be displayed<br>The reservation data should be deleted |

**Postconditions:**  
- The reservation should be deleted from the /reservations collection  

---

## Test Case: TC20

**Title:** Common user cannot delete another user’s reservation  
**Priority:** Medium  
**User Story:** JIRA-1005 – Manage reservations  
**Preconditions:**  
- Common user’s credentials  
- A reservation to delete  

**Steps:**

| Step | Action | Expected results |
|------|--------|------------------|
| 1 | Log into the BookMate app with the user credentials | Login succeeded and the Calendar view is displayed |
| 2 | Notice that “Admin Panel “is not available at the header and click on it | The /admin page should not be visible |
| 3 | Edit the URL adding the “/admin” to the domain. Ex: http://mydomain/admin | The browser should redirect the user to the Home page |

---
