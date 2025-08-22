const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: parseInt(process.env.CYPRESS_VIEWPORT_WIDTH) || 1280,
    viewportHeight: parseInt(process.env.CYPRESS_VIEWPORT_HEIGHT) || 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    BASE_URL: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    ADMIN_EMAIL: process.env.CYPRESS_ADMIN_EMAIL || 'admin@bookingmate.com',
    ADMIN_PASSWORD: process.env.CYPRESS_ADMIN_PASSWORD || 'admin123',
    USER_EMAIL: process.env.CYPRESS_USER_EMAIL || 'user1@bookingmate.com',
    USER_PASSWORD: process.env.CYPRESS_USER_PASSWORD || 'user123'
  }
})