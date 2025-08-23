describe('Reservation Validation', () => {
  beforeEach(() => {
    cy.cleanSession()
  })

  afterEach(() => {
    cy.logout()
  })

  describe('TC2: Common user cannot create a new reservation if slot is full', () => {
    it('should prevent reservation creation when slot has 2 reservations already', () => {
      // Step 1: Login with common user credentials
      cy.visit('/')
      cy.checkLoginFormLoaded()
      cy.loginAsUser()
      
      // Verify login success and calendar view is displayed
      cy.homeLoaded()
      
      // Step 2: Find and click on a day with 2 reservations in morning slot
      cy.get('[data-test="calendar-days"] [data-test^="calendar-day-"]')
        .not('.disabled')
        .filter((index, element) => {
          const reservationText = Cypress.$(element).find('[data-test^="reservation-indicator-"]').text()
          const totalReservations = reservationText ? parseInt(reservationText.match(/\d+/)?.[0] || '0') : 0
          return totalReservations === 2
        })
        .first()
        .click()
      
      // Verify slot view is opened
      cy.get('[data-test="date-header"]').should('be.visible')
      cy.get('[data-test="back-to-month-button"]').should('be.visible')
      cy.get('[data-test="slot-grid"]').should('be.visible')
      
      // Step 3: Verify morning slot shows "Slot is full" message
      cy.get('[data-test="slot-cell-morning"]')
        .should('contain.text', 'Slot is full')
      
      // Verify forbidden cursor on mouseover
      cy.get('[data-test="slot-cell-morning"]')
        .should('have.css', 'cursor', 'not-allowed')
      
      // Step 4: Attempt to click on the full morning slot
      cy.get('[data-test="slot-cell-morning"]').click()
      
      // Verify error toast message
      cy.checkToast('This slot is full (maximum 2 reservations)')
      
      // Verify postcondition - no reservation is created
      cy.get('[data-test="slot-cell-morning"]').within(() => {
        cy.get('[data-test^="reservation-"]')
          .should('have.length', 2) // Should still have only the original 2 reservations
      })
    })
  })

  describe('TC3: Common user cannot create second reservation on same slot for same day', () => {
    it('should cancel existing reservation when user clicks on slot with their reservation', () => {
      // Step 1: Login with common user credentials
      cy.visit('/')
      cy.checkLoginFormLoaded()
      cy.loginAsUser()
      
      // Verify login success and calendar view is displayed
      cy.homeLoaded()
      
      // Step 2: Find and click on a day with user's existing reservation in morning slot
      cy.get('[data-test="calendar-days"] [data-test^="calendar-day-"]')
        .not('.disabled')
        .filter((index, element) => {
          const userEmail = Cypress.env('USER_EMAIL')
          const userNameItems = Cypress.$(element).find('[data-test^="user-name-"]')
          return userNameItems.toArray().some(item => Cypress.$(item).text().includes(userEmail))
        })
        .first()
        .click()
      
      // Verify slot view shows user's existing reservation
      cy.get('[data-test="date-header"]').should('be.visible')
      cy.get('[data-test="back-to-month-button"]').should('be.visible')
      cy.get('[data-test="slot-grid"]').should('be.visible')
      cy.get('[data-test="slot-cell-morning"]').within(() => {
        cy.get('[data-test^="reservation-"]')
          .should('contain.text', Cypress.env('USER_EMAIL'))
      })
      
      // Step 3: Click on the morning slot where user already has a reservation
      cy.get('[data-test="slot-cell-morning"]').click()
      
      // Verify reservation is cancelled
      cy.checkToast('Reservation cancelled successfully')
      
      // Verify postconditions
      // - Second reservation is NOT created
      // - First reservation is cancelled
      cy.get('[data-test="slot-cell-morning"]').within(() => {
        cy.get('[data-test^="reservation-"]')
          .should('not.contain.text', Cypress.env('USER_EMAIL'))
      })
      
      // - Calendar view should show updated count
      cy.get('[data-test="back-to-month-button"]').click()
      cy.homeLoaded()
    })
  })

  describe('TC6: Admin user cannot create reservation if slot is full', () => {
    it('should prevent admin from creating reservation when slot has 2 reservations', () => {
      // Step 1: Login with admin user credentials
      cy.visit('/')
      cy.checkLoginFormLoaded()
      cy.loginAsAdmin()
      
      // Verify login success and calendar view is displayed
      cy.adminIsLoggedIn()
      cy.homeLoaded()
      
      // Step 2: Find and click on a day with 2 reservations in morning slot
      cy.get('[data-test="calendar-days"] [data-test^="calendar-day-"]')
        .not('.disabled')
        .filter((index, element) => {
          const reservationText = Cypress.$(element).find('[data-test^="reservation-indicator-"]').text()
          const totalReservations = reservationText ? parseInt(reservationText.match(/\d+/)?.[0] || '0') : 0
          return totalReservations === 2
        })
        .first()
        .click()
      
      // Verify slot view is opened
      cy.get('[data-test="date-header"]').should('be.visible')
      cy.get('[data-test="back-to-month-button"]').should('be.visible')
      cy.get('[data-test="slot-grid"]').should('be.visible')
      
      // Step 3: Verify morning slot shows "Slot is full" message and forbidden cursor
      cy.get('[data-test="slot-cell-morning"]')
        .should('contain.text', 'Slot is full')
        .and('have.css', 'cursor', 'not-allowed')
      
      // Step 4: Attempt to click on the full morning slot
      cy.get('[data-test="slot-cell-morning"]').click()
      
      // Verify error toast message
      cy.checkToast('This slot is full (maximum 2 reservations)')
      
      // Verify postcondition - no reservation is created
      cy.get('[data-test="slot-cell-morning"]').within(() => {
        cy.get('[data-test^="reservation-"]')
          .should('have.length', 2) // Should still have only the original 2 reservations
          .and('not.contain.text', Cypress.env('ADMIN_EMAIL'))
      })
    })
  })
})