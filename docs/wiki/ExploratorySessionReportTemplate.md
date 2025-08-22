**Exploratory Session Report Template**

| Start date and time | Tester        | Module        | Charter     | Duration    | Environment       |
|---------------------|---------------|----------------|-------------|-------------|-------------------|
| DD/MM/YYYY HH:MM    | [Your Name]   | [Module Name]  | Charter X   | XX minutes  | [e.g. Local/Staging/Prod] |

**Charter X: [Charter Title]**  
**Mission:**  
- Explore <goal>[Describe what is being explored in this charter.]  
- With <resources> [Mention user roles or test data used required to test this mission.]  
- To discover <goal> [validations, confirmations and any other relevant expectations of this mission]  

*Duration:* XX minutes  

---

### **Notes**  
- (I) [Information or confirmation observed during testing.]  
- (I)  
- (R) [Potential risks or usability issues found.]  
- (R)  

*(Legend: (I) = Information, (R) = Risk)*

---

### **Defects**  
1. [Short defect description] – `BUGXXX` reported  
2.  

---

### **Questions**  
- [Open questions or things to clarify with PO/Dev/QA Lead]  
 

--- 

**Exploratory Session Report Example**

### Session Report
| Start date and time | Tester | Module | Charter | Duration | Environment |
|---------------------|--------|--------|---------|----------|-------------|
| 21/08/2025 | Jorge Mercado | Reservations | Charter 1 | 12 minutes | Local environment |

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
- None
