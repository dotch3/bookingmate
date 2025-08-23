describe('Admin Reservation Management', () => {
  beforeEach(() => {
    cy.cleanSession()
  })

  afterEach(() => {
    cy.logout()
  })

  describe('TC19: Admin user can edit another user\'s reservation', () => {

    //Failing due to BUG005
  it('should allow admin to edit another user\'s reservation', () => {
    // Step 1: Login with admin user credentials
    cy.visit('/')
    cy.checkLoginFormLoaded()
    cy.loginAsAdmin()
    
    // Verify login success and calendar view is displayed
    cy.adminIsLoggedIn()
    cy.homeLoaded()
    
    // Step 2: Click on "Admin Panel" button in header
    cy.get('[data-test="admin-nav-link"]')
      .should('be.visible')
      .click()
    
    // Verify /admin page is opened
    cy.adminPanelLoaded()

    // Step 3: Click on "Reservations" button
    cy.get('[data-test="reservations-tab"]')
      .should('be.visible')
      .click()
    
    // Verify reservations table is displayed
    cy.get('[data-test="reservations-table"]')
      .should('be.visible')
    
    // Step 4: Check if there are any reservations in the table
    cy.get('[data-test="reservations-table-body"]').then(($tbody) => {
      if ($tbody.find('tr').length === 0) {
        // No reservations found, create one first
        cy.log('No reservations found, creating a test reservation first')
        test.skip('No reservations to work with.')
        
      }
    })
    // Now find reservation to edit and click Edit button
    // Select a reservation that doesn't belong to the admin user
    cy.get('[data-test="reservations-table-body"] tr')
      .not(`:contains("${Cypress.env('ADMIN_EMAIL')}")`) // Exclude admin's reservations
      .first() // Get the first non-admin reservation row
      .within(() => {
        // Create an object to store all row data
        const rowData = {};
        
        // Extract each cell's data using data-test attributes
         cy.get('[data-test^="reservation-slot-"]').invoke('text').then((slot) => {
          rowData.slot = slot.trim();
          cy.log('Reservation Slot:', slot.trim());
        });

        cy.get('[data-test^="reservation-creator-"]').invoke('text').then((creator) => {
          rowData.creator = creator.trim();
          cy.log('Reservation Creator:', creator.trim());
        });
        
        cy.get('[data-test^="reservation-date-"]').invoke('text').then((date) => {
          rowData.date = date.trim();
          cy.log('Reservation Date:', date.trim());
        });
        
        cy.get('[data-test^="reservation-created-"]').invoke('text').then((created) => {
          rowData.created = created.trim();
          cy.log('Reservation Created:', created.trim());
        });
        
        cy.get('[data-test^="reservation-updated-"]').invoke('text').then((updated) => {
          rowData.updated = updated.trim();
          cy.log('Reservation Updated:', updated.trim());
        });
    

       // Store the complete object for later use 
       cy.then(() => { 
        cy.log('Complete Reservation Data:', rowData); 
        cy.wrap(rowData).as('oldReservationData'); // Alias for later use 
      });

        // Capture reservationId from edit button
        cy.get('[data-test^="edit-reservation-"]')
          .invoke('attr', 'data-test')
          .then((attr) => {
            const reservationId = attr.replace('edit-reservation-', '').trim()
            rowData.reservationId = reservationId
            cy.wrap(reservationId).as('reservationId')
          })

        // Now click the edit button 
        cy.get('[data-test^="edit-reservation-"]')
          .should('be.visible')
          .scrollIntoView()
          .click();

        // Store the complete object for later use
        cy.then(() => {
          cy.log('Complete Reservation Data:', rowData);
          cy.wrap(rowData).as('oldReservationData'); // Alias for later use
        });
      });

    // Verify "Edit reservation" modal is opened
    cy.get('[data-test="edit-reservation-modal"]').should('be.visible')
    cy.get('[data-test="edit-modal-title"]')
      .scrollIntoView()
      .should('be.visible')
      .and('contain.text', 'Edit Reservation')
    
    // Step 5: Change the date and time slot
    // Select a new date (future date)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 10)
    //Timed out retrying after 4000ms: expected '<td>' to contain text '2025-09-01', but the text was '8/31/2025'
    const formattedDate = futureDate.toISOString().split('T')[0]
    cy.log(`New date to select is: ${formattedDate}`)
    // Format for UI: M/D/YYYY (no leading zeros)
    const uiDateMDYYYY = `${futureDate.getMonth() + 1}/${futureDate.getDate()}/${futureDate.getFullYear()}`
    cy.log(`New date to select (UI): ${uiDateMDYYYY}`)

    cy.get('[data-test="edit-date-input"]')
      .should('be.visible')
      .clear()
      .type(formattedDate)
    
    // Select a different time slot based on current slot
    cy.get('@oldReservationData').then((oldReservationData) => {
      const currentSlot = oldReservationData.slot
      cy.log(`Current slot from oldReservationData: ${currentSlot}`)
      
      cy.getNextSlot(currentSlot).then((nextSlot) => {
        cy.log(`New slot that has been chosen: ${nextSlot}`)
        
        cy.get('[data-test="edit-slot-select"]')
          .should('be.visible')
          .select(nextSlot)

        // Store nextSlot for later verification
        cy.wrap(nextSlot).as('selectedSlot')
      })
    })
    
    // Click on "Update reservation" button
    cy.get('[data-test="edit-modal-save"]')
      .should('be.visible')
      .click()
    
    // Verify success toast message
    cy.checkToast('Reservation updated successfully')
    
    // Verify reservation data is updated in the specific row that was edited
    cy.get('@reservationId').then((reservationId) => {
      cy.get('@selectedSlot').then((selectedSlot) => {
        cy.get(`[data-test="reservation-row-${reservationId}"]`).within(() => {
          // Verify the date was updated in this specific row
          cy.get('[data-test^="reservation-date-"]')
            .should('contain.text', uiDateMDYYYY)
          
          // Verify the slot was updated in this specific row
          cy.get('[data-test^="reservation-slot-"]')
            .should('contain.text', selectedSlot)
        })
      })
    })
    
    // Verify postcondition - modal should close
    cy.get('[data-test="edit-reservation-modal"]').should('not.exist')
  })
})


  describe('TC20: Admin user can delete another user\'s reservation', () => {
    it('should allow admin to delete another user\'s reservation', () => {
      // Step 1: Login with admin user credentials
      cy.visit('/')
      cy.checkLoginFormLoaded()
      cy.loginAsAdmin()
      
      // Verify login success and calendar view is displayed
      cy.adminIsLoggedIn()
      cy.homeLoaded()
      
      // Step 2: Click on "Admin Panel" button in header
      cy.get('[data-test="admin-nav-link"]')
        .should('be.visible')
        .click()
      
      // Verify /admin page is opened
      cy.adminPanelLoaded()
      
      // Step 3: Click on "Reservations" button
      cy.get('[data-test="reservations-tab"]')
        .should('be.visible')
        .click()
      
      // Verify reservations table is displayed
      cy.get('[data-test="reservations-table"]')
        .should('be.visible')
      
      // Step 4: Find reservation to delete and click Delete button
      // Select a reservation that doesn't belong to the admin user
      cy.get('[data-test="reservations-table-body"] tr')
        .not(`:contains("${Cypress.env('ADMIN_EMAIL')}")`) // Exclude admin's reservations
        .first() // Get the first non-admin reservation row
        .within(() => {
          // Create an object to store all row data
          const rowData = {};
          
          // Extract each cell's data using data-test attributes
          cy.get('[data-test^="reservation-creator-"]').invoke('text').then((creator) => {
            rowData.creator = creator.trim();
            cy.log('Reservation Creator:', creator.trim());
          });
          
          cy.get('[data-test^="reservation-date-"]').invoke('text').then((date) => {
            rowData.date = date.trim();
            cy.log('Reservation Date:', date.trim());
          });
          
          cy.get('[data-test^="reservation-slot-"]').invoke('text').then((slot) => {
            rowData.slot = slot.trim();
            cy.log('Reservation Slot:', slot.trim());
          });
          
          // Capture reservationId from delete button
          cy.get('[data-test^="delete-reservation-"]')
            .invoke('attr', 'data-test')
            .then((attr) => {
              const reservationId = attr.replace('delete-reservation-', '').trim()
              rowData.reservationId = reservationId
              cy.wrap(reservationId).as('reservationId')
            })
          
          // Store the complete object for later use
          cy.then(() => {
            cy.log('Complete Reservation Data:', rowData);
            cy.wrap(rowData).as('reservationToDelete'); // Alias for later use
          });
          
          // Now click the delete button
          cy.get('[data-test^="delete-reservation-"]')
            .should('be.visible')
            .scrollIntoView()
            .click();
        })
      
      // Verify "Delete reservation" modal is opened
      cy.get('[data-test="delete-reservation-modal"]')
        .should('be.visible')
      
      // Step 5: Verify information in modal (no typos or misinformation)
      cy.get('[data-test="delete-reservation-warning"]')
        .should('be.visible')
        .and('contain.text', 'Are you sure')
        .and('contain.text', 'delete')
        .and('contain.text', 'reservation')
      
      // Verify reservation details are shown correctly using stored data
      cy.get('@reservationToDelete').then((reservationData) => {
        cy.get('[data-test="delete-reservation-details"]')
          .should('be.visible')
          .and('contain.text', reservationData.creator)
      })
      
      // Step 6: Click on "Delete reservation" button
      cy.get('[data-test="delete-modal-confirm"]')
        .should('be.visible')
        .click()
      
      // Verify success toast message
      cy.checkToast('Reservation deleted successfully')
      
      // Verify reservation is deleted from the table using reservation ID
      cy.get('@reservationId').then((reservationId) => {
        cy.get(`[data-test="reservation-row-${reservationId}"]`).should('not.exist')
      })
      
      // Verify postcondition - modal should close
      cy.get('[data-test="delete-reservation-modal"]').should('not.exist')
    })
  })
})