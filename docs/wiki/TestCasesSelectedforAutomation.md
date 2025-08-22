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
