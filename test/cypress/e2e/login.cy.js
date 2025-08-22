describe('Login Tests', () => {

  const commonUser = {
    email: Cypress.env('USER_EMAIL'),
    password: Cypress.env('USER_PASSWORD')
  }

  beforeEach(() => {
    cy.cleanSession()
  })

  afterEach(() => {
    cy.logout()
  })
  
  it('Login with common user', () => {

    cy.visit('/')
    cy.checkLoginFormLoaded()

    //login
    cy.loginAsUser()

    //Checking the dashboard elements
    // cy.get('[data-test="dashboard-card"]').should('be.visible')
    cy.get('[data-test="header-left"]').should('be.visible')
    cy.get('[data-test="user-email"]').should('have.text', commonUser.email)


    //Calendar
    cy.get('[data-test="monthly-calendar"]').should('be.visible')

    //error message
    // cy.get('[data-test="error-message"]')
    
    // Session will be closed in afterEach hook
  })
})