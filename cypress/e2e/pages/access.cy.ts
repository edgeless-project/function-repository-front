describe('Login page', () => {

	const credentials = {
		default:{
			username: 'admin@admin.com',
			password: 'admin123',
		},
		clusterAdmin1: {
			username: 'email@email.com',
			password: 'password'
		}
	}

	beforeEach(() => {
		cy.visit('/')
	})

  it('Should display login page', () => {
    cy.get('.text-2xl').should('contain', 'Access your account');
  })
	it('Should login with cluster-admin credentials', () => {
		cy.get('[name="email"]').type(credentials.default.username);
		cy.get('[name="password"]').type(credentials.default.password);
		cy.get('[data-id="btn-login"]').click();

		cy.url().should('eq', Cypress.config().baseUrl + '/');
		cy.get('[data-id="btn-login"]').should('not.exist');
	})

	it('Should not allow for login with wrong credentials', () => {
		cy.get('[name="email"]').type(credentials.default.username);
		cy.get('[name="password"]').type('invalid-password');
		cy.get('[data-id="btn-login"]').click();
		cy.wait(1000); // Wait for credentials to validate
		cy.get('[data-id="form-login"]').get('p').should('exist');
		cy.get('[data-id="form-login"] p').should('contain.text', 'Login failed. Email or password incorrect.');
	});

	it('Should login and show corresponding layout to cluster-admin default user', () => {
		cy.get('[name="email"]').type(credentials.default.username);
		cy.get('[name="password"]').type(credentials.default.password);
		cy.get('[data-id="btn-login"]').click();

		cy.url().should('eq', Cypress.config().baseUrl + '/');
		cy.get('[data-id="Functions Management"]').should('exist');
		cy.get('[data-id="Workflow Management"]').should('exist');
		cy.get('[data-id="API Keys Management"]').should('exist');
		cy.get('[data-id="Users Management"]').should('exist');
	});

	it('Should log in and log out from session', () => {
		cy.get('[name="email"]').type(credentials.default.username);
		cy.get('[name="password"]').type(credentials.default.password);
		cy.get('[data-id="btn-login"]').click();

		cy.url().should('eq', Cypress.config().baseUrl + '/');
		cy.get('[data-id="avatar-menu"]').should('exist').click();
		cy.contains('div', 'Log Out').should('exist').click();

		cy.wait(1000);
		cy.get('.text-2xl').should('contain', 'Access your account');

	});
})