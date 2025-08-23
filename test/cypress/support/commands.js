// Command for the validation of the page loaded and elements rendered 
Cypress.Commands.add('homeLoaded', () => {
  cy.get('[data-test="monthly-calendar"]').should('be.visible')
  cy.get('[data-test="calendar-title"]')
    .should('be.visible')
    .contains('Booking Calendar')
  cy.get('[data-test="calendar-subtitle"]')
    .should('be.visible')
    .contains('Select a date to view and manage your reservations')
})


//Admin Panel loaded
Cypress.Commands.add('adminPanelLoaded', () => {
  cy.get('[data-test="admin-nav-link"]').should('be.visible')
  // Verify /admin page is opened
  cy.url().should('include', '/admin')
  cy.get('[data-test="admin-panel-title"]')
    .should('be.visible')
    .contains('Admin Panel')
  cy.get('[data-test="user-management-tab"]')
    .should('be.visible')
    .contains('User Management')
  cy.get('[data-test="reservations-tab"]')
    .should('be.visible')
    .contains('Reservations')
})
// custom command to see adminIs logged in
Cypress.Commands.add('adminIsLoggedIn', () => {
  cy.get('[data-test="admin-nav-link"]').
  should('be.visible')
  .contains('Admin Panel')

})


// Custom command to check if login form is loaded
Cypress.Commands.add('checkLoginFormLoaded', () => {
  cy.get('[data-test="login-page"]').should('be.visible')
  cy.get('[data-test="login-card"]').should('be.visible')
  cy.get('[data-test="email-input"]').should('be.visible')
  cy.get('[data-test="password-input"]').should('be.visible')
  cy.get('[data-test="submit-button"]').should('be.visible')
})


Cypress.Commands.add('headerLoaded', () => {
  cy.get('[data-test="header"]').should('be.visible')
  cy.get('[data-test="header-left"]').should('be.visible')
  cy.get('[data-test="calendar-nav-link"]').should('be.visible')
  cy.get('[data-test="reservations-nav-link"]').should('be.visible')
  cy.get('[data-test="user-info"]').should('be.visible')
  cy.get('[data-test="user-email"]').should('be.visible')
  cy.get('[data-test="logout-button"]').should('be.visible')
})


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

// Custom command for logout
Cypress.Commands.add('logout', () => {
  const logoutButton = Cypress.$('[data-test="logout-button"]')
  if (logoutButton.length > 0 && logoutButton.is(':visible')) {
    logoutButton.click()
  }
  cy.cleanSession()
})


// Custom command to check toast messages
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  // react-toastify uses CSS classes for different toast types
  const toastSelector = type === 'success' ? '.Toastify__toast--success' : 
                       type === 'error' ? '.Toastify__toast--error' : 
                       type === 'info' ? '.Toastify__toast--info' : 
                       '.Toastify__toast'
  
  cy.get(toastSelector, { timeout: 10000 })
    .should('be.visible')
    .and('contain', message)
})

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-test="loading"]').should('not.exist')
})

// Custom command to get the next slot for editing reservations
Cypress.Commands.add('getNextSlot', (currentSlot) => {
  const slotRotation = {
    'morning': 'afternoon',
    'afternoon': 'evening', 
    'evening': 'morning'
  }
  
  const nextSlot = slotRotation[currentSlot] || 'afternoon'
  cy.log(`Current slot: ${currentSlot}, Next slot: ${nextSlot}`)
  return cy.wrap(nextSlot)
})