describe('Create Reservations', () => {
  beforeEach(() => {
    cy.cleanSession()
  })

  afterEach(() => {
    cy.logout()
  })

  describe('TC1: Common user reserves a slot successfully', () => {
    it('should allow common user to create a reservation on available slot', () => {
      // Step 1: Login with common user credentials
      cy.visit('/')
      cy.checkLoginFormLoaded()
      cy.loginAsUser()
      
      // Verify login success and calendar view is displayed
      cy.homeLoaded()      
      // Step 2: Find and click on a day with capacity for new reservations in all teh time slots
      
      const userEmail = Cypress.env('USER_EMAIL')

      cy.get('[data-test="calendar-days"] [data-test^="calendar-day-"]')
        .filter((_, el) => {
          const $el = Cypress.$(el)

          // Skip disabled days
          if ($el.hasClass('disabled')) return false

          // Total capacity gate (e.g., 6 per day)
          const totalTxt = $el.find('[data-test^="reservation-indicator-"]').text()
          const totalReservations = totalTxt ? parseInt(totalTxt.match(/\d+/)?.[0] || '0', 10) : 0
          if (totalReservations >= 6) return false

          // Logged-in user's per-day count: look for "user@domain (n)"
          const $userItems = $el.find('[data-test^="user-name-"]')
          let myCount = 0
          $userItems.each((i, item) => {
            const txt = Cypress.$(item).text().trim()
            if (txt.toLowerCase().startsWith(String(userEmail).toLowerCase())) {
              const m = txt.match(/\((\d+)\)/)
              if (m) myCount = parseInt(m[1], 10)
            }
          })

          // Valid only if user has < 3 (i.e., at least one period left: morning/afternoon/evening)
          return myCount < 3
        })
        .first()
        .should('exist')
        .scrollIntoView()
        .click()

      // Verify slot view is opened

      cy.get('[data-test="date-header"]').should('be.visible')
      cy.get('[data-test="back-to-month-button"]').should('be.visible')
      cy.get('[data-test="date-picker"]').should('be.visible')
      //Slots
      cy.get('[data-test="slot-grid"]').should('be.visible')
      cy.get('[data-test="date-picker"]').should('be.visible')


      cy.get('[data-test="slot-cell-morning"]').should('be.visible').contains('Morning (8AM - 12PM)')
      cy.get('[data-test="slot-cell-afternoon"]').should('be.visible').contains('Afternoon (1PM - 5PM)')
      cy.get('[data-test="slot-cell-evening"]').should('be.visible').contains('Evening (6PM - 10PM)')
      
      // Step 3: Click on "Click to reserve" link for available slot
      cy.get('[data-test="slot-grid"]').within(() => {
  cy.get('[data-test^="slot-cell-"].available')
    .filter((_, el) => Cypress.$(el).find('[data-test^="click-to-reserve-"]:visible').length > 0)
    .first()
    .scrollIntoView()
    .click()
})
      
      // Verify reservation creation success
      cy.checkToast('Reservation created successfully!')
      
      // Verify postconditions
      // - Reservation should be visible in slot view
      cy.get('[data-test="slot-grid"]')
        .should('contain.text', Cypress.env('USER_EMAIL'))
      
      // -@TODO: Calendar view should show updated count
 
    })
  })


describe('TC4: Common user can create reservations in all slots on same day', () => {
  it('should allow user to create reservations in morning, afternoon, and evening slots', () => {
    // Step 1: Login with common user credentials
    cy.visit('/')
    cy.checkLoginFormLoaded()
    cy.loginAsUser()
    cy.homeLoaded()

    // --- Helpers ---
    const userEmail = String(Cypress.env('USER_EMAIL') || '').toLowerCase()
    const DAY_CAPACITY = Cypress.env('DAY_CAPACITY') ?? 6

    const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const getMyCountFromDayEl = ($el, email) => {
      const re = new RegExp(`^${escapeRe(String(email).trim())}\\s*\\((\\d+)\\)$`, 'i')
      let myCount = 0
      $el.find('[data-test^="user-name-"]').each((_, item) => {
        const txt = Cypress.$(item).text().trim()
        const m = re.exec(txt)
        if (m) myCount = parseInt(m[1], 10)
      })
      return myCount
    }

    // Step 2: Find a day where user has 0 reservations AND there's room for three more (cap - 3)
    cy.get('[data-test="calendar-days"] [data-test^="calendar-day-"]').then(($days) => {
      const $candidates = $days.filter((_, el) => {
        const $el = Cypress.$(el)

        // Skip disabled days
        if ($el.hasClass('disabled')) return false
        if ($el.hasClass('has-reservations')) return false

        // Total reservations on the day (e.g., "3 reservations")
        const totalTxt = $el.find('[data-test^="reservation-indicator-"]').text()
        const total = totalTxt ? parseInt(totalTxt.match(/\d+/)?.[0] || '0', 10) : 0

        // Need room for 3 new reservations
        if (total > DAY_CAPACITY - 3) return false

        // Exact user count "email (n)" must be 0
        const myCount = getMyCountFromDayEl($el, userEmail)
        return myCount === 0
      })

      expect($candidates.length, 'a day with userCount=0 and space for 3').to.be.greaterThan(0)

      const $candidate = $candidates.eq(0)

      // Capture day id & total-before to assert later
      const dataTest = $candidate.attr('data-test') // "calendar-day-YYYY-MM-DD"
      const dayId = dataTest?.replace('calendar-day-', '').trim()
      const totalTxt = $candidate.find('[data-test^="reservation-indicator-"]').text()
      const totalBefore = totalTxt ? parseInt(totalTxt.match(/\d+/)?.[0] || '0', 10) : 0

      cy.wrap({ dayId, totalBefore }).as('dayData')

      cy.wrap($candidate).scrollIntoView().click()
    })

    // Verify slot view is opened
    cy.get('[data-test="slot-grid"]').should('be.visible')

    ;['morning','afternoon','evening'].forEach(period => {
      cy.get(`[data-test="slot-cell-${period}"]`)
        .should('be.visible')
        .and('have.class','available')
        .within(() => {
          cy.get(`[data-test="click-to-reserve-${period}"]`).should('be.visible')
        })
    })

    // Helper: reserve a period
    const reservePeriod = (period) => {
      cy.get(`[data-test="slot-cell-${period}"]`)
        .should('be.visible')
        .and('have.class', 'available')
        .within(() => {
          cy.get(`[data-test="click-to-reserve-${period}"]`).click()
        })
      cy.checkToast('Reservation created successfully!')
    }

    // Step 3: Reserve Morning, Afternoon, Evening (one each)
    reservePeriod('morning')
    reservePeriod('afternoon')
    reservePeriod('evening')

    // Step 4: Back to calendar and assert counts updated and user shows (3)
    //@TODO

  })
})

  describe('TC5: Admin user reserves a slot successfully', () => {
    it('should allow admin user to create a reservation on available slot', () => {
      // Step 1: Login with admin user credentials
      cy.visit('/')
      cy.checkLoginFormLoaded()
      cy.loginAsAdmin()
      
      // Verify login success and calendar view is displayed
      cy.adminIsLoggedIn()
      cy.homeLoaded()

      const adminEmail = String(Cypress.env('ADMIN_EMAIL') || '').toLowerCase()
      const DAY_CAPACITY = Cypress.env('DAY_CAPACITY') ?? 6
      
      // Step 2: Find and click on a day with capacity for new reservations
      cy.get('[data-test="calendar-days"] [data-test^="calendar-day-"]').then($days => {
        const $filtered = $days.filter((_, el) => {
          const $el = Cypress.$(el)

          // Skip disabled days
          if ($el.hasClass('disabled')) return false
          if ($el.hasClass('has-reservations')) return false

          // Total reservations on the day
          const totalTxt = $el.find('[data-test^="reservation-indicator-"]').text()
          const total = totalTxt ? parseInt(totalTxt.match(/\d+/)?.[0] || '0', 10) : 0
          if (total >= DAY_CAPACITY) return false

          // Current admin's count on the day
          let myCount = 0
          $el.find('[data-test^="user-name-"]').each((i, item) => {
            const txt = Cypress.$(item).text().trim().toLowerCase()
            if (txt.startsWith(adminEmail)) {
              const m = txt.match(/\((\d+)\)/)
              if (m) myCount = parseInt(m[1], 10)
            }
          })

          // Valid if admin has < 3 reservations (room for at least one more)
          return myCount < 3
        })

        expect($filtered.length, 'a day with space for admin reservation').to.be.greaterThan(0)

        const $candidate = $filtered.eq(0)
        cy.wrap($candidate).scrollIntoView().click()
      })
      
      // Verify slot view is opened
      cy.get('[data-test="date-header"]').should('be.visible')
      cy.get('[data-test="back-to-month-button"]').should('be.visible')
      cy.get('[data-test="date-picker"]').should('be.visible')
      cy.get('[data-test="slot-grid"]').should('be.visible')

      cy.get('[data-test="slot-cell-morning"]').should('be.visible').contains('Morning (8AM - 12PM)')
      cy.get('[data-test="slot-cell-afternoon"]').should('be.visible').contains('Afternoon (1PM - 5PM)')
      cy.get('[data-test="slot-cell-evening"]').should('be.visible').contains('Evening (6PM - 10PM)')
      
      // Step 3: Click on "Click to reserve" link for available slot
      cy.get('[data-test="slot-grid"]').within(() => {
        cy.get('[data-test^="slot-cell-"].available')
          .filter((_, el) => Cypress.$(el).find('[data-test^="click-to-reserve-"]:visible').length > 0)
          .first()
          .scrollIntoView()
          .click()
      })
      
      // Verify reservation creation success
      cy.checkToast('Reservation created successfully!')
      
      // Verify postconditions
      // - Reservation should be visible in slot view
      cy.get('[data-test="slot-grid"]')
        .should('contain.text', Cypress.env('ADMIN_EMAIL'))
    })
  })
})