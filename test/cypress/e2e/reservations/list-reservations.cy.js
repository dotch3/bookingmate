describe('List Reservations', () => {
  beforeEach(() => {
    cy.cleanSession()
  })

  afterEach(() => {
    cy.logout()
  })

  describe('TC10: Common user gets the list of its reservations', () => {
    it('should display user\'s reservations in My Reservations page', () => {
      // Step 1: Login with common user credentials
      cy.visit('/')
      cy.checkLoginFormLoaded()
      cy.loginAsUser()
      
      cy.homeLoaded()
      cy.headerLoaded()
      
      // Step 2: Click on "My Reservations" button in header
      cy.get('[data-test="reservations-nav-link"]')
        .should('be.visible')
        .click()
      
      // Verify /reservations page is opened
      cy.url().should('include', '/reservations')

      cy.get('[data-test="reservation-list-card"]')
        .should('be.visible')

      cy.get('[data-test="reservation-list-title"]')
        .should('be.visible')
        .contains('My Reservations')

      cy.get('[data-test="reservation-list-header"]')
        .should('be.visible')

      cy.get('[data-test="reservation-list-subtitle"]')
        .should('be.visible')
        .contains('Manage your reservations')
      
      // Step 3: Review "My Reservations" section
      cy.get('[data-test="reservation-list-items"]')
        .should('be.visible')
        //getting all the items, reseravtions inside the list
        // the ids are created based on reservatuionId, so we will use partial identifier
        .within(()=>{
          // Verify reservations made by the user are listed
          cy.get('[data-testid^="reservation-"]')
            .should('be.visible')
            .each(($reservation) => {
              console.log(`Reservation: ${$reservation.text()}`)
              // Each reservation should belong to the logged-in user
              cy.wrap($reservation)
                .should('contain.text', Cypress.env('USER_EMAIL'))
            })
        })
    })
  })

  describe('TC11: Admin user gets the list of its reservations', () => {
    //TC failing because BUG010
    //Admin user has its role changed to “user” and the “displayName” 
    // cleared out every time it performs login
    it('should display admin\'s reservations in My Reservations page', () => {
      // Step 1: Login with admin user credentials
      cy.visit('/')
      cy.checkLoginFormLoaded()
      cy.loginAsAdmin()
      
      cy.homeLoaded()
      cy.headerLoaded()
      
      // Step 2: Click on "My Reservations" button in header
      cy.get('[data-test="reservations-nav-link"]')
        .should('be.visible')
        .click()
      
      // Verify /reservations page is opened
      cy.url().should('include', '/reservations')

      cy.get('[data-test="reservation-list-card"]')
        .should('be.visible')

      cy.get('[data-test="reservation-list-title"]')
        .should('be.visible')
        .contains('My Reservations')

      cy.get('[data-test="reservation-list-header"]')
        .should('be.visible')

      cy.get('[data-test="reservation-list-subtitle"]')
        .should('be.visible')
        .contains('Manage your reservations')

      cy.adminIsLoggedIn()
      
      // Step 3: Review "My Reservations" section
      cy.get('[data-test="reservation-list-items"]')
        .should('be.visible')
        //getting all the items, reservations inside the list
        // the ids are created based on reservationId, so we will use partial identifier
        .within(()=>{
          // Verify reservations made by the admin are listed
          cy.get('[data-testid^="reservation-"]')
            .should('be.visible')
            .each(($reservation) => {
              console.log(`Reservation: ${$reservation.text()}`)
              // Each reservation should belong to the logged-in admin
              cy.wrap($reservation)
                .should('contain.text', Cypress.env('ADMIN_EMAIL'))
            })
        })
    })
  })
})