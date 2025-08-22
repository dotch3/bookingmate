
// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  const loginEmail = email || Cypress.env('ADMIN_EMAIL')
  const loginPassword = password || Cypress.env('ADMIN_PASSWORD')
  
  cy.visit('/login')
  cy.get('[data-test="email-input"]').type(loginEmail)
  cy.get('[data-test="password-input"]').type(loginPassword)
  cy.get('[data-test="submit-button"]').click()
})

// Custom command for admin login
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'))
})

// Custom command for user login
Cypress.Commands.add('loginAsUser', () => {
  cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'))
})

// Custom command to clean session data
Cypress.Commands.add('cleanSession', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })
})

// Custom command to check if login form is loaded
Cypress.Commands.add('checkLoginFormLoaded', () => {
  cy.get('[data-test="login-card"]').should('be.visible')
  cy.get('[data-test="email-input"]').should('be.visible')
  cy.get('[data-test="password-input"]').should('be.visible')
  cy.get('[data-test="submit-button"]').should('be.visible')
})

// Custom command for logout
Cypress.Commands.add('logout', () => {
  // Check if user is logged in first
  cy.get('body').then(($body) => {
    if ($body.find('[data-test="logout-button"]').length > 0) {
      cy.get('[data-test="logout-button"]').click()
    } else if ($body.find('[data-test="user-menu"]').length > 0) {
      // If there's a user menu, click it first then logout
      cy.get('[data-test="user-menu"]').click()
      cy.get('[data-test="logout-button"]').click()
    }
  })
  
  // Clear all session data
  cy.cleanSession()
})

// Custom command to check toast messages
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  cy.get(`[data-cy="toast-${type}"]`).should('be.visible').and('contain', message)
})

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-cy="loading"]').should('not.exist')
})