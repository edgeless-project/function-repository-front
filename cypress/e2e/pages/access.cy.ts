describe('Login', () => {

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

	describe('Login', () => {
		it('Displays login page', () => {
			cy.get('.text-2xl').should('contain', 'Access your account');
		})
		it('Login with cluster-admin credentials', () => {
			cy.get('[name="email"]').type(credentials.default.username);
			cy.get('[name="password"]').type(credentials.default.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');
			cy.get('[data-id="btn-login"]').should('not.exist');
		})

		it('Login and show corresponding layout for cluster admin default user', () => {
			cy.get('[name="email"]').type(credentials.default.username);
			cy.get('[name="password"]').type(credentials.default.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');
			cy.get('[data-id="Functions Management"]').should('exist');
			cy.get('[data-id="Workflow Management"]').should('exist');
			cy.get('[data-id="API Keys Management"]').should('exist');
			cy.get('[data-id="Users Management"]').should('exist');
		});

		it('Logs in and out from session', () => {
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

	describe('Login error handling', () =>{
		it('Handling login with wrong credentials', () => {
			cy.get('[name="email"]').type(credentials.default.username);
			cy.get('[name="password"]').type('invalid-password');
			cy.get('[data-id="btn-login"]').click();
			cy.wait(1000); // Wait for credentials to validate
			cy.get('#\\:R2cm\\:-form-item-message').should('contain.text', 'Login failed. Email or password incorrect.');
		});

		it('Handling incorrect email format', () => {
			cy.get('[name="email"]').type('no email');
			cy.get('[name="password"]').type('invalid-password');
			cy.get('[data-id="btn-login"]').click();
			cy.get('#\\:R1cm\\:-form-item-message').should('contain.text', 'The email must be a valid email address');
		});

		it('Handling incorrect password format', () => {
			cy.get('[name="email"]').type('email@email.com');
			cy.get('[data-id="btn-login"]').click();
			cy.get('#\\:R2cm\\:-form-item-message').should('contain.text', 'Password is required');
		});

		it('Handling incorrect password format (length)', () => {
			cy.get('[name="email"]').type('email@email.com');
			cy.get('[name="password"]').type('1234');
			cy.get('[data-id="btn-login"]').click();
			cy.get('#\\:R2cm\\:-form-item-message').should('contain.text', 'Password must be longer than 8 characters');
		});
	})

})