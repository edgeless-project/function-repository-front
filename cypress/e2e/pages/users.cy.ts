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

	describe('CRUD operations', () => {
		it('Display generic users management page', () => {
			cy.url().should('eq', Cypress.config().baseUrl + '/users');
		})

		it('Creation of a new Function Dev user', () => {
			cy.get('[data-id="btn-create-user"]').click();

			cy.get('[name="email"]').type(credentials.functionDev.username);
			cy.get('[name="password"]').type(credentials.functionDev.password);
			cy.get('[name="role"]').select(credentials.functionDev.role);
			cy.get('[data-id="btn-create-user"]').click();

			cy.get('p').should('contain.text', `The user ${credentials.functionDev.username} has been created successfully`);
		})

		it('Update Function Dev user personal data to Cluster Admin', () => {
			cy.get(`[data-id="${credentials.functionDev.username}"] [data-id="btn-edit"]`).should('exist').click();
			cy.get('[name="email"]').clear().type(credentials.clusterAdmin.username);
			cy.get('[name="role"]').select(credentials.clusterAdmin.role);
			cy.get('[data-id="btn-save"]').click();
			cy.get('p').should('contain.text', `The user ${credentials.clusterAdmin.username} has been updated successfully`);
		});

		it('Change of user password', () => {
			cy.get(`[data-id="${credentials.clusterAdmin.username}"] [data-id="btn-change-password"]`).should('exist').click();
			cy.get('[name="password"]').clear().type(credentials.clusterAdmin.password);
			cy.get('[data-id="btn-change"]').click();
			cy.get('p').should('contain.text', `The user ${credentials.clusterAdmin.username} password has been updated successfully`);
			cy.get('[role="dialog"] div button:contains("Close")').click();
		});

		it('Deletion of previously created user', () => {
			cy.get(`[data-id="${credentials.clusterAdmin.username}"] [data-id="btn-delete"]`).should('exist').click();
			cy.get(`[data-id="btn-confirm"]`).should('exist').click();
			cy.get('p').should('contain.text', `${credentials.clusterAdmin.username} has been deleted successfully`);
		})

		it('Creates a user of each role, check each one data and deletion of the users', () => {

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

	describe('CRUD operations error handling', () => {
		it('Handling when creating a new user with an already used email', () => {
			cy.get('[data-id="btn-create-user"]').click();
			cy.get('[name="email"]').type(credentials.default.username);
			cy.get('[name="password"]').type(credentials.default.password);
			cy.get('[name="role"]').select(credentials.default.role);

			cy.get('[data-id="btn-create-user"]').click();
			cy.get('p').should('contain.text', `Error: User already exists`);
		})
		it('Deny access with a warning when a user does not have access to a page', () => {
			cy.get('[data-id="btn-create-user"]').click();
			cy.get('[name="email"]').type("temp_"+credentials.functionDev.username);
			cy.get('[name="password"]').type(credentials.functionDev.password);
			cy.get('[name="role"]').select(credentials.functionDev.role);

			cy.get('[data-id="btn-create-user"]').click();
			cy.visit('/users')

			cy.get('[data-id="avatar-menu"]').should('exist').click();
			cy.contains('div', 'Log Out').click();

			cy.get('[name="email"]').type("temp_"+credentials.functionDev.username);
			cy.get('[name="password"]').type(credentials.functionDev.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');
			cy.visit('/users')

			cy.contains('div', 'Access Denied').should('exist');

			cy.get('[data-id="avatar-menu"]').should('exist').click();
			cy.contains('div', 'Log Out').click();

			cy.get('[name="email"]').type(credentials.default.username);
			cy.get('[name="password"]').type(credentials.default.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');
			cy.visit('/users')
			cy.get(`[data-id="${"temp_"+credentials.functionDev.username}"] [data-id="btn-delete"]`).should('exist').click();
			cy.get(`[data-id="btn-confirm"]`).should('exist').click();
			cy.get('p').should('contain.text', `${"temp_"+credentials.functionDev.username} has been deleted successfully`);

		})
	})
});

describe('Users access and navigation',() => {
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
	})

	it('Create multiple users, one user of each role', () => {
		//Log in default to create users
		cy.get('[name="email"]').type(credentials.default.username);
		cy.get('[name="password"]').type(credentials.default.password);
		cy.get('[data-id="btn-login"]').click();

		cy.url().should('eq', Cypress.config().baseUrl + '/');
		cy.visit('/users')

		//Create each user
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
	});

	describe('Cluster Admin type user', () => {
		it('Log in, correct navigation options and access', () => {
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.clusterAdmin.username);
			cy.get('[name="password"]').type(credentials.clusterAdmin.password);
			cy.get('[data-id="btn-login"]').click();

			//Check avatar menu
			cy.get('[data-id="avatar-menu"]').should('exist').click();
			cy.get('[data-id="ddmenu-email"]').should('contain.text',credentials.clusterAdmin.username);

			//Main menu cards
			cy.get('[data-id="Functions Management"]').should('exist');
			cy.get('[data-id="API Keys Management"]').should('exist');
			cy.get('[data-id="Workflow Management"]').should('exist');
			cy.get('[data-id="Users Management"]').should('exist');

			//Lateral navigation cards
			cy.get('[data-id="navbar-apikey"]').should('exist');
			cy.get('[data-id="navbar-functions"]').should('exist');
			cy.get('[data-id="navbar-workflows"]').should('exist');
			cy.get('[data-id="navbar-users"]').should('exist');
		});
		it('Home page cards redirection to pages', ()=>{
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.clusterAdmin.username);
			cy.get('[name="password"]').type(credentials.clusterAdmin.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');

			cy.get('[data-id="Functions Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/function');
			cy.visit('/')

			cy.get('[data-id="API Keys Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/apikey');
			cy.visit('/')

			cy.get('[data-id="Workflow Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/workflow');
			cy.visit('/')

			cy.get('[data-id="Users Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/users');
			cy.visit('/')
		});
		it('Lateral navigation menu redirection to accessible pages', ()=>{
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.clusterAdmin.username);
			cy.get('[name="password"]').type(credentials.clusterAdmin.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');

			cy.get('[data-id="navbar-functions"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/function');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')

			cy.get('[data-id="navbar-apikey"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/apikey');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')

			cy.get('[data-id="navbar-workflows"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/workflow');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')

			cy.get('[data-id="navbar-users"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/users');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')
		});
	})

	describe('Function Developer type user', () => {
		it('Log in, correct navigation options and access', () => {
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.functionDev.username);
			cy.get('[name="password"]').type(credentials.functionDev.password);
			cy.get('[data-id="btn-login"]').click();

			//Check avatar menu
			cy.get('[data-id="avatar-menu"]').should('exist').click();
			cy.get('[data-id="ddmenu-email"]').should('contain.text',credentials.functionDev.username);

			//Main menu cards
			cy.get('[data-id="Functions Management"]').should('exist');
			cy.get('[data-id="API Keys Management"]').should('exist');
			cy.get('[data-id="Workflow Management"]').should('not.exist');
			cy.get('[data-id="Users Management"]').should('not.exist');

			//Lateral navigation cards
			cy.get('[data-id="navbar-apikey"]').should('exist');
			cy.get('[data-id="navbar-functions"]').should('exist');
			cy.get('[data-id="navbar-workflows"]').should('not.exist');
			cy.get('[data-id="navbar-users"]').should('not.exist');
		});
		it('Deny access with a warning when a user does not have access to a page', () => {
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.functionDev.username);
			cy.get('[name="password"]').type(credentials.functionDev.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');

			cy.visit('/users')
			cy.contains('div', 'Access Denied').should('exist');

			cy.visit('/workflow')
			cy.contains('div', 'Access Denied').should('exist');
		});
		it('Home page cards redirection to pages', ()=>{
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.functionDev.username);
			cy.get('[name="password"]').type(credentials.functionDev.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');

			cy.get('[data-id="Functions Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/function');
			cy.visit('/')

			cy.get('[data-id="API Keys Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/apikey');
			cy.visit('/')
		});
		it('Lateral navigation menu redirection to accessible pages', ()=>{
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.functionDev.username);
			cy.get('[name="password"]').type(credentials.functionDev.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');

			cy.get('[data-id="navbar-functions"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/function');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')

			cy.get('[data-id="navbar-apikey"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/apikey');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')
		});
	})

	describe('App Developer type user', () => {
		it('Log in, correct navigation options and access', () => {
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.appDev.username);
			cy.get('[name="password"]').type(credentials.appDev.password);
			cy.get('[data-id="btn-login"]').click();

			//Check avatar menu
			cy.get('[data-id="avatar-menu"]').should('exist').click();
			cy.get('[data-id="ddmenu-email"]').should('contain.text',credentials.appDev.username);

			//Main menu cards
			cy.get('[data-id="Functions Management"]').should('exist');
			cy.get('[data-id="API Keys Management"]').should('exist');
			cy.get('[data-id="Workflow Management"]').should('exist');
			cy.get('[data-id="Users Management"]').should('not.exist');

			//Lateral navigation cards
			cy.get('[data-id="navbar-apikey"]').should('exist');
			cy.get('[data-id="navbar-functions"]').should('exist');
			cy.get('[data-id="navbar-workflows"]').should('exist');
			cy.get('[data-id="navbar-users"]').should('not.exist');
		});
		it('Deny access with a warning when a user does not have access to a page', () => {
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.appDev.username);
			cy.get('[name="password"]').type(credentials.appDev.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');

			cy.visit('/users')
			cy.contains('div', 'Access Denied').should('exist');
		});
		it('Home page cards redirection to pages', ()=>{
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.appDev.username);
			cy.get('[name="password"]').type(credentials.appDev.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');

			cy.get('[data-id="Functions Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/function');
			cy.visit('/')

			cy.get('[data-id="API Keys Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/apikey');
			cy.visit('/')

			cy.get('[data-id="Workflow Management"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/workflow');
			cy.visit('/')
		});
		it('Lateral navigation menu redirection to accessible pages', ()=>{
			//Log in each user and check if they can access the app correctly
			cy.get('[name="email"]').type(credentials.appDev.username);
			cy.get('[name="password"]').type(credentials.appDev.password);
			cy.get('[data-id="btn-login"]').click();

			cy.url().should('eq', Cypress.config().baseUrl + '/');

			cy.get('[data-id="navbar-functions"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/function');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')

			cy.get('[data-id="navbar-apikey"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/apikey');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')

			cy.get('[data-id="navbar-workflows"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/workflow');
			cy.contains('div', 'Access Denied').should('not.exist');
			cy.visit('/')
		});
	})

	after(()=>{

		// Check if avatar-menu exists, then log out; otherwise, handle "Access your account"
		cy.visit('/')
		cy.url().then((url) => {
			if(!url.includes("auth")){
				//Log out from last used user
				cy.get('[data-id="avatar-menu"]').click();
				cy.get('[data-id="btn-logout"]').click({ force: true });
			}
		});

		//Log in default to delete users
		cy.get('[name="email"]').clear().type(credentials.default.username);
		cy.get('[name="password"]').clear().type(credentials.default.password);
		cy.get('[data-id="btn-login"]').click();

		cy.url().should('eq', Cypress.config().baseUrl + '/');
		cy.visit('/users')

		Object.entries(credentials).forEach(([key, user]) => {
			if (key !== 'default'){
				cy.get(`[data-id="${user.username}"] [data-id="btn-delete"]`).should('exist').click();
				cy.get(`[data-id="btn-confirm"]`).should('exist').click();
				cy.get('p').should('contain.text', `${user.username} has been deleted successfully`);
				cy.get('[role="dialog"] div button:contains("Close")').click();
			}
		});
	})
});
