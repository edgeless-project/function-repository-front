describe('Users management', () => {
	const credentials = {
		default:{
			username: 'admin@admin.com',
			password: 'admin123',
			role: 'CLUSTER_ADMIN'
		},
		clusterAdmin: {
			username: 'clusterAdmin@email.com',
			password: 'password',
			role: 'CLUSTER_ADMIN'
		},
		functionDev: {
			username: 'fundev@email.com',
			password: 'password1',
			role: 'FUNC_DEVELOPER'
		},
		appDev: {
			username: 'appdev@email.com',
			password: 'password2',
			role: 'APP_DEVELOPER'
		}
	}

  beforeEach(() => {
	  cy.visit('/')
	  cy.get('[name="email"]').type(credentials.default.username);
	  cy.get('[name="password"]').type(credentials.default.password);
	  cy.get('[data-id="btn-login"]').click();

		cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.visit('/users')
  })

	it('Should display users management page', () => {
		cy.url().should('eq', Cypress.config().baseUrl + '/users');
	})

	it('Should create a new Function Dev user', () => {
		cy.get('[data-id="btn-create-user"]').click();

		cy.get('[name="email"]').type(credentials.functionDev.username);
		cy.get('[name="password"]').type(credentials.functionDev.password);
		cy.get('[name="role"]').select(credentials.functionDev.role);
		cy.get('[data-id="btn-create-user"]').click();

		cy.get('p').should('contain.text', `The user ${credentials.functionDev.username} has been created successfully`);
	})

	it('Should not create a new user with the same email', () => {
		cy.get('[data-id="btn-create-user"]').click();
		cy.get('[name="email"]').type(credentials.functionDev.username);
		cy.get('[name="password"]').type(credentials.clusterAdmin.password);
		cy.get('[name="role"]').select(credentials.clusterAdmin.role);
		cy.get('[data-id="btn-create-user"]').click();
		cy.get('p').should('contain.text', `Error: User already exists`);
	})

	it('Should update user data from Function Dev to Cluster Admin', () => {
		cy.get(`[data-id="${credentials.functionDev.username}"] [data-id="btn-edit"]`).should('exist').click();
		cy.get('[name="email"]').clear().type(credentials.clusterAdmin.username);
		cy.get('[name="role"]').select(credentials.clusterAdmin.role);
		cy.get('[data-id="btn-save"]').click();
		cy.get('p').should('contain.text', `The user ${credentials.clusterAdmin.username} has been updated successfully`);
	});

	it('Should change the user password', () => {
		cy.get(`[data-id="${credentials.clusterAdmin.username}"] [data-id="btn-change-password"]`).should('exist').click();
		cy.get('[name="password"]').clear().type(credentials.clusterAdmin.password);
		cy.get('[data-id="btn-change"]').click();
		cy.get('p').should('contain.text', `The user ${credentials.clusterAdmin.username} password has been updated successfully`);
		cy.get('[role="dialog"] div button:contains("Close")').click();
	});

	it('Should delete the previously created user', () => {
		cy.get(`[data-id="${credentials.clusterAdmin.username}"] [data-id="btn-delete"]`).should('exist').click();
		cy.get(`[data-id="btn-confirm"]`).should('exist').click();
		cy.get('p').should('contain.text', `${credentials.clusterAdmin.username} has been deleted successfully`);
	})

	it('Should create all users, check each Role and delete every user ', () => {

		Object.entries(credentials).forEach(([key, user]) => {
			if (key !== 'default'){
				cy.get('[data-id="btn-create-user"]').click();

				cy.get('[name="email"]').type(user.username);
				cy.get('[name="password"]').type(user.password);
				cy.get('[name="role"]').select(user.role);
				cy.get('[data-id="btn-create-user"]').click();

				cy.get('p').should('contain.text', `The user ${user.username} has been created successfully`);
				cy.get('[role="dialog"] div button:contains("Close")').click();
			}
		});

		Object.entries(credentials).forEach(([key, user]) => {
			if (key !== 'default'){
				const user_data = cy.get(`[data-id="${user.username}"]`);
				user_data.get('[data-id="email"]').should('contain.text', user.username);
				user_data.get('[data-id="role"]').should('contain.text', user.role);
			}
		});

		Object.entries(credentials).forEach(([key, user]) => {
			if (key !== 'default') {
				cy.get(`[data-id="${user.username}"] [data-id="btn-delete"]`).should('exist').click();
				cy.get(`[data-id="btn-confirm"]`).should('exist').click();

				cy.get('p').should('contain.text', `${user.username} has been deleted successfully`);
				cy.get('[role="dialog"] div button:contains("Close")').click();
			}
		});
	})
})