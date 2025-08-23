describe('Login Tests', () => {

  const commonUser = {
    email: Cypress.env('USER_EMAIL'),
    password: Cypress.env('USER_PASSWORD')
  }

  const adminUser = {
    email: Cypress.env('ADMIN_EMAIL'),
    password: Cypress.env('ADMIN_PASSWORD')
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

    cy.get('[data-test="header-left"]').should('be.visible')
    cy.get('[data-test="user-email"]').should('have.text', commonUser.email)
    
    //header
    cy.headerLoaded()
    
    //Calendar
    cy.get('[data-test="monthly-calendar"]').should('be.visible')
    cy.homeLoaded()
  }),
  it('Login with admin user', () => {
    cy.visit('/')
    cy.checkLoginFormLoaded()

    //login
    cy.loginAsAdmin()


    cy.get('[data-test="user-email"]').should('have.text', adminUser.email)
    
    //header
    cy.headerLoaded()
    cy.adminIsLoggedIn()
    
    //Calendar
    cy.homeLoaded()
  })
})