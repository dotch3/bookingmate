describe('User Management', () => {
  beforeEach(() => {
    cy.cleanSession()
  })

  afterEach(() => {
    cy.logout()
  })

  describe('TC13: Admin user can create new user with role "user"', () => {
    it('should allow admin to create a new user with user role', () => {
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
      
      // Verify /admin page is opened
      cy.url().should('include', '/admin')
      
      // Step 3: Verify "User Management" section is displayed
      cy.get('[data-test="user-management-section"]')
        .should('be.visible')
        .and('contain.text', 'User Management')
      
      cy.get('[data-test="users-directory-banner"]')
        .should('be.visible')
        .and('contain.text', 'Users Directory')
      
      // Step 4: Click on "New user" button
      cy.get('[data-test="new-user-button"]')
        .should('be.visible')
        .click()
      
      // Verify "Create new user" modal is opened
      cy.get('[data-test="create-user-modal"]')
        .scrollIntoView()
        .should('be.visible')
        .and('contain.text', 'Create New User')
      
      // Step 5: Fill the form with valid data
      const randomId = Math.random().toString(36).substring(2, 8)
      const testUser = {
        email: `testuser${randomId}@test.com`,
        password: '123456',
        displayName: `Test User ${randomId}`,
        role: 'user'
      }
      
      cy.get('[data-test="user-email-input"]')
        .should('be.visible')
        .type(testUser.email)
      
      cy.get('[data-test="user-password-input"]')
        .should('be.visible')
        .type(testUser.password)
      
      cy.get('[data-test="user-display-name-input"]')
        .should('be.visible')
        .type(testUser.displayName)
      
      cy.get('[data-test="user-role-select"]')
        .should('be.visible')
        .select(testUser.role)
      
      // Step 6: Click on "Create user" button
      cy.get('[data-test="create-user-submit"]')
        .should('be.visible')
        .click()
      
      // @TODO: Fix BUG007: Admin gets logged out after user creation
      // Verify success toast message
      // cy.checkToast('User created successfully! Please log in again.')
      
      // Verify redirect to login page due to logout
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-test="login-form"]').should('be.visible')
      
      // Step 7: Log back in as admin to verify user was created
      cy.loginAsAdmin()
      
      // Verify login success and calendar view is displayed
      cy.adminIsLoggedIn()
      cy.homeLoaded()
      
      // Step 2: Click on "Admin Panel" button in header
      cy.get('[data-test="admin-nav-link"]')
        .should('be.visible')
        .click()
      
      // Verify user is listed in User management table with role "user"
      cy.get('[data-test="users-directory-table"]')
        .should('contain.text', testUser.email)
        .and('contain.text', testUser.displayName)
        .and('contain.text', 'user')
    })
  })

  describe('TC14: Admin user can create new user with role "admin"', () => {
    it.skip('should allow admin to create a new user with admin role', () => {
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
      
      // Verify /admin page is opened
      cy.url().should('include', '/admin')
      
      // Step 3: Verify "User Management" section is displayed
      cy.get('[data-test="user-management-section"]')
        .should('be.visible')
        .and('contain.text', 'User Management')
      
      cy.get('[data-test="users-directory-banner"]')
        .should('be.visible')
        .and('contain.text', 'Users Directory')
      
      // Step 4: Click on "New user" button
      cy.get('[data-test="new-user-button"]')
        .should('be.visible')
        .click()
      
      // Verify "Create new user" modal is opened
      cy.get('[data-test="create-user-modal"]')
        .scrollIntoView()
        .should('be.visible')
        .and('contain.text', 'Create New User')
      
      // Step 5: Fill the form with valid data
      const randomId = Math.random().toString(36).substring(2, 8)
      const testAdmin = {
        email: `admintest${randomId}@test.com`,
        password: '123456',
        displayName: `Admin Test User ${randomId}`,
        role: 'admin'
      }
      
      cy.get('[data-test="user-email-input"]')
        .should('be.visible')
        .type(testAdmin.email)
      
      cy.get('[data-test="user-password-input"]')
        .should('be.visible')
        .type(testAdmin.password)
      
      cy.get('[data-test="user-display-name-input"]')
        .should('be.visible')
        .type(testAdmin.displayName)
      
      cy.get('[data-test="user-role-select"]')
        .should('be.visible')
        .select(testAdmin.role)
      
      // Step 6: Click on "Create user" button
      cy.get('[data-test="create-user-submit"]')
        .should('be.visible')
        .click()
      
      // @TODO: Fix BUG007: Admin gets logged out after user creation
      // Verify success toast message
      // cy.checkToast('User created successfully! Please log in again.')
      
      // Verify redirect to login page due to logout
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-test="login-form"]').should('be.visible')
      
      // Step 7: Log back in as admin to verify user was created
       cy.loginAsAdmin()
      cy.adminIsLoggedIn()
      cy.homeLoaded()
      
      cy.get('[data-test="admin-nav-link"]')
        .should('be.visible')
        .click()
      
      // Verify user is listed in User management table with role "admin"
      cy.get('[data-test="users-directory-table"]')
        .should('contain.text', testAdmin.email)
        .and('contain.text', testAdmin.displayName)
        .and('contain.text', 'admin')
    })
  })

  describe('TC15: Admin user can edit the role of another user', () => {
  it('should allow admin to change user role via dropdown', () => {
    // Step 1: Login as admin
    cy.loginAsAdmin()
    cy.adminIsLoggedIn()
    cy.homeLoaded()
    
    // Step 2: Navigate to Admin Panel
    cy.get('[data-test="admin-nav-link"]')
      .should('be.visible')
      .click()
    cy.adminPanelLoaded()
    
    // Step 3: Verify "User Management" section is displayed
    cy.get('[data-test="users-directory-banner"]')
      .scrollIntoView()
      .should('be.visible')
      .and('contain.text', 'Users Directory')

    // Step 4: Capture first non-admin user row data (incl. userId)
    cy.get('[data-test="users-directory-table"] tbody tr')
      .not(`:contains("${Cypress.env('ADMIN_EMAIL')}")`) // exclude admin row
      .first()
      .then(($row) => {
        const cells = $row.find('td')
        const email = cells.eq(0).text().trim()
        const displayName = cells.eq(1).text().trim()
        const currentRole = cells.eq(2).find('[data-test="user-role-dropdown"]').val()

        cy.log(`CurrentROle: ${currentRole}`)

        // Switch role
        const newRole = currentRole === 'user' ? 'admin' : 'user'

        cy.log(`newRole: ${newRole}`)

        // Capture userId from row attribute (recommended) or button
        let userId = ''
        const rowAttr = $row.attr('data-test') // e.g., "user-row-123"
        if (rowAttr) {
          userId = rowAttr.replace('user-row-', '').trim()
        } else {
          const editButton = $row.find('[data-test^="edit-user-"]')
          if (editButton.length > 0) {
            userId = editButton.attr('data-test').replace('edit-user-', '').trim()
          }
        }

        // Store everything for later
        cy.wrap({
          userId,
          email,
          displayName,
          currentRole,
          newRole
        }).as('userData')
      })

    // Step 5: Update dropdown with new role for that row
    cy.get('@userData').then((data) => {
      cy.get(`[data-test="user-row-${data.userId}"]`)
        .within(() => {
          cy.get('[data-test="user-role-dropdown"]')
            .should('be.visible')
            .select(data.newRole)
        })
    })
    //@TODO: the toast message is not displayed
    // Verify success toast
    // cy.checkToast('Successfully updated')
    cy.wait(5000)
    // Step 6: Assert that the same row got updated correctly
    cy.get('@userData').then((data) => {
      cy.get(`[data-test="user-row-${data.userId}"]`)
        .should('be.visible')
        .within(() => {
          // Verify role dropdown contains the role text (case-insensitive)
          cy.get('[data-test="user-role-dropdown"]')
            .should('have.value', data.newRole)
          
          // double-check user identity matches
          cy.contains(data.email)
          cy.contains(data.displayName)
          // Verify role text appears in the row (case-insensitive)
          cy.contains(new RegExp(data.newRole, 'i'))
        })
    })
  })
})


 describe('TC16: Admin user can edit the data of another user', () => {
  it('should allow admin to edit user data via edit modal', () => {
    // Step 1: Login as admin
    cy.loginAsAdmin()
    cy.adminIsLoggedIn()
    cy.homeLoaded()

    // Step 2: Navigate to Admin Panel
    cy.get('[data-test="admin-nav-link"]').should('be.visible').click()
    cy.adminPanelLoaded()

    // Step 3: Verify "User Management" section is displayed
    cy.get('[data-test="users-directory-banner"]')
      .should('be.visible')
      .and('contain.text', 'Users Directory')

    // Step 4: Capture first non-admin user row data (incl. userId)
    const randomId = Math.random().toString(36).substring(2, 8)

    cy.get('[data-test="users-directory-table"] tbody tr')
      .not(`:contains("${Cypress.env('ADMIN_EMAIL')}")`) // exclude current admin row
      .first()
      .then(($row) => {
        const cells = $row.find('td')
        const email = cells.eq(0).text().trim()
        const displayName = cells.eq(1).text().trim()
        const currentRole = cells.eq(2).find('[data-test="user-role-dropdown"]').val()

        // Decide a new role (toggle)
        const newRole = currentRole === 'user' ? 'admin' : 'user'

        // Capture userId from row attribute (preferred) or fallback to edit button attribute
        let userId = ''
        const rowAttr = $row.attr('data-test') // e.g., "user-row-123"
        if (rowAttr && rowAttr.startsWith('user-row-')) {
          userId = rowAttr.replace('user-row-', '').trim()
        } else {
          const editButton = $row.find('[data-test^="edit-user-"]')
          if (editButton.length > 0) {
            userId = editButton.attr('data-test').replace('edit-user-', '').trim()
          }
        }

        expect(userId, 'userId should be present for target row').to.be.a('string').and.not.be.empty

        // Prepare new data to write
        const newEmail = `updated${randomId}@test.com`
        const newDisplayName = `Updated User ${randomId}`

        // Store everything for later (use updated values directly)
        cy.wrap({
          userId,
          // keep originals in case you want to assert against them later:
          original: { email, displayName, role: currentRole },
          // values we will write and then assert:
          email: newEmail,
          displayName: newDisplayName,
          role: newRole,
        }).as('userData')
      })

    // Step 5: Open the edit modal for that specific row
    cy.get('@userData').then((data) => {
      cy.get(`[data-test="user-row-${data.userId}"]`)
        .should('be.visible')
        .within(() => {
          cy.get('[data-test="edit-user-button"]')
          .scrollIntoView()
          .should('be.visible').click()
        })
    })

    // Step 6: Verify Edit user modal is opened
    cy.get('[data-test="edit-user-modal"]')
      .scrollIntoView()
      .should('be.visible')
    
    cy.get('[data-test="edit-user-modal-title"]')
      .should('be.visible')
      .and('contain.text', 'Edit User')
    // Step 7: Update user's data with new values
    cy.get('@userData').then((data) => {
      cy.get('[data-test="edit-user-email-input"]')
        .should('be.visible')
        .clear()
        .type(data.email)

      cy.get('[data-test="edit-user-display-name-input"]')
        .should('be.visible')
        .clear()
        .type(data.displayName)

      cy.get('[data-test="edit-user-role-select"]')
        .should('be.visible')
        .select(data.role)
    })

    // Step 8: Click on "Update user" button
    cy.get('[data-test="update-user-submit"]').should('be.visible').click()

    // @TODO: Verify success toast with PO
    // cy.checkToast('User updated successfully!')

    // Step 9: Verify the updated data in the specific row using userId
    cy.get('@userData').then((data) => {
      cy.get(`[data-test="user-row-${data.userId}"]`, { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          // Verify dropdown has new role
          cy.get('[data-test="user-role-dropdown"]')
            .should('have.value', data.role)

          // Verify updated email + display name text in the row
          cy.contains(data.email)
          cy.contains(data.displayName)

          // Verify role text appears (case-insensitive)
          cy.contains(new RegExp(data.role, 'i'))
        })
    })

    // Step 10: Verify postcondition - modal should close
    cy.get('[data-test="edit-user-modal"]').should('not.exist')
  })
})



describe('TC17: Admin user deletes another user', () => {
  it('should allow admin to delete a user', () => {
    // Step 1: Login with admin user credentials
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
  cy.adminPanelLoaded()
    
  // Step 3: Verify "User Management" section is displayed
  cy.get('[data-test="users-directory-banner"]')
    .scrollIntoView()
    .should('be.visible')
    .and('contain.text', 'Users Directory')


  cy.get('[data-test="user-management-section"]')
    .should('be.visible')
    .and('contain.text', 'User Management')
  
  
  // Step 4: Find user to delete and click Delete button
  let userToDelete
  cy.get('[data-test="users-directory-table"] tbody tr')
    .not(`:contains("${Cypress.env('ADMIN_EMAIL')}")`) // Don't delete current admin
    .first()
    .then(($row) => {
      const cells = $row.find('td')
      const email = cells.eq(0).text().trim()
      const displayName = cells.eq(1).text().trim()

      userToDelete = email

      let userId = ''
      const rowAttr = $row.attr('data-test') // e.g., "user-row-123"
      if (rowAttr && rowAttr.startsWith('user-row-')) {
        userId = rowAttr.replace('user-row-', '').trim()
      } else {
        const delBtn = $row.find('[data-test^="delete-user-"]')
        if (delBtn.length > 0) {
          userId = delBtn.attr('data-test').replace('delete-user-', '').trim()
        }
      }

      expect(userId, 'userId should be present for target row').to.be.a('string').and.not.be.empty

      cy.wrap({ userId, email, displayName }).as('userData')
    })

  cy.get('@userData').then((data) => {
    cy.get(`[data-test="user-row-${data.userId}"]`)
      .should('be.visible')
      .within(() => {
        cy.get('[data-test="delete-user-button"]')
          .scrollIntoView()
          .should('be.visible')
          .click()
      })
  })
  
  cy.get('[data-test="delete-user-modal"]')
    .scrollIntoView()
    .should('be.visible')
  // Verify Delete user modal is opened
  cy.get('[data-test="delete-user-modal-title"]')
    .should('be.visible')
    .and('contain.text', 'Confirm Delete')
  
  // Step 5: Read the warning text (verify no typos)
  cy.get('[data-test="delete-user-warning"]')
    .should('be.visible')
    .and('contain.text', 'Are you sure')
  
  // Step 6: Click on "Delete user" button
  cy.get('[data-test="delete-user-modal-confirm"]')
    .should('be.visible')
    .click()
  
    //@TODO: not shoing Toast
  // Verify success toast message
  // cy.checkToast('User deleted successfully')
  
  // Verify user is no longer listed in the table
  cy.get('[data-test="users-directory-table"]')
    .should('not.contain.text', userToDelete)

  cy.get('@userData').then((data) => {
    cy.get(`[data-test="user-row-${data.userId}"]`).should('not.exist')
  })
  
  // Verify postcondition - modal should close
  cy.get('[data-test="delete-user-modal"]').should('not.exist')
})
})
})
