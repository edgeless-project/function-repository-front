describe('Functions management and functionalities', () => {
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
	const name: string = `test-${new Date().valueOf()}`;
	const function_multi_type = {
		version: '0.2',
		outputs: 'test-out1, out2',
		type1: {
			value: 'test-value1',
			file: 'example.json'
		},
		type2: {
			value: 'test-value2',
			file: 'testfile.txt'
		}
	}
	let functions_created: string[] = [];

	beforeEach(() => {
		cy.visit('/')
		cy.get('[name="email"]').type(credentials.default.username);
		cy.get('[name="password"]').type(credentials.default.password);
		cy.get('[data-id="btn-login"]').click();

		cy.url().should('eq', Cypress.config().baseUrl + '/');
		cy.visit('/function')
	});

	it('Display functions management page', () => {
		cy.url().should('eq', Cypress.config().baseUrl + '/function');
		cy.get('[data-id="functions-panel"]')
			.should('exist')
			.should('contain.text', 'List of functions');
		cy.get('[data-id="functions-table"]')
			.should('exist');
		cy.get('[data-id="functions-table"] > thead > tr > th')
			.should('have.length', 6)
			.should('contain.text', 'Id')
			.should('contain.text', 'Types')
			.should('contain.text', 'Latest version')
			.should('contain.text', 'Created At')
			.should('contain.text', 'Updated At')
			.should('contain.text', 'Actions');
	});
	it('Sidebar navigation menu redirection to accessible pages', ()=>{
		cy.get('[data-id="navbar-functions"]').should('exist');
		cy.get('[data-id="navbar-apikey"]').should('exist');
		cy.get('[data-id="navbar-workflows"]').should('exist');
		cy.get('[data-id="navbar-users"]').should('exist');
	});


	describe('Create function form validation', () => {
		beforeEach(() => {
			cy.get('[data-id="btn-create"]').should('exist').click();
		})

		it('Forms fields correct input', () => {
			cy.get('[data-id="create-title"]').should('contain.text', 'Function class specification');

			cy.get('[data-id="field-id"]')
				.should('exist');
			cy.get('[name="id"]')
				.should('exist')
				.clear()
				.type('test')
				.should('have.value', 'test');

			cy.get('[data-id="field-version"]')
				.should('exist');
			cy.get('[name="version"]')
				.should('exist')
				.should('have.value', '0.1')
				.clear()
				.type('0.2')
				.should('have.value', '0.2');

			cy.get('[data-id="field-outputs"]')
				.should('exist');
			cy.get('[name="outputs"]')
				.should('exist')
				.clear()
				.type('test-out')
				.should('have.value', 'test-out');

			cy.get('[data-id="selector-function-type"]')
				.should('exist')
				.click();

			cy.get('[data-id="selector-function-type"] > select > option')
				.should('exist');

			cy.get('[data-id="selector-function-type"] > select')
				.should('have.length',1)
				.get('option')
				.then(options => {
			  const values = options.toArray().map(option => option.getAttribute('value')).filter(value => value!=null);

				cy.get('[data-id="selector-function-type"] > select')
					.should('exist')
					.select(values[Math.floor(values.length/2)], {force: true})
					.should('have.value', values[Math.floor(values.length/2)]);
			});

			cy.get('[data-id="btn-field-types-add"]')
				.should('exist')
				.should('contain.text','+ Add Type')
				.click();

			cy.get('[data-id="selector-function-type"] > select')
				.should('have.length',2)
				.eq(1)
				.find('option')
				.then(options => {
					const values = options.toArray().map(option => option.getAttribute('value')).filter(value => value != null);

					cy.get('[data-id="selector-function-type"] > select')
						.should('exist')
						.eq(1)
						.select(values[(values.length-1)], {force: true})
						.should('have.value', values[(values.length-1)]);
				});

			cy.get('[data-id="btn-field-types-add"]').click();
			cy.get('[data-id="card-content-type"] > button')
				.should('have.length', 3)
				.eq(2)
				.should('contain.text', '-')
				.click();
			cy.get('[data-id="card-content-type"] > button')
				.should('have.length', 2);

			cy.get('[data-id="file-function-type"] > input')
				.eq(0)
				.selectFile('cypress/fixtures/testfile.txt', { force: true })
				.should('have.value', 'C:\\fakepath\\testfile.txt');
			cy.get('[data-id="file-function-type"] > input')
				.eq(1)
				.selectFile('cypress/fixtures/testfile.txt', { force: true })
				.should('have.value', 'C:\\fakepath\\testfile.txt');
		});
		it('Multiple function types card functionality', () => {
			cy.get('[data-id="create-title"]').should('contain.text', 'Function class specification');

			cy.get('[data-id="selector-function-type"]')
				.should('exist')
				.click();

			cy.get('[data-id="selector-function-type"] > select')
				.should('have.length',1)
				.find('option')
				.should('exist')
				.then(options => {
					const values = options.toArray().map(option => option.getAttribute('value')).filter(value => value!=null);

					cy.get('[data-id="selector-function-type"] > select')
						.should('exist')
						.select(values[Math.floor(values.length/2)], {force: true})
						.should('have.value', values[Math.floor(values.length/2)]);
				});

			cy.get('[data-id="file-function-type"] > input')
				.eq(0)
				.selectFile('cypress/fixtures/example.json', { force: true })
				.should('have.value', 'C:\\fakepath\\example.json');

			cy.get('[data-id="btn-field-types-add"]')
				.should('exist')
				.should('contain.text','+ Add Type')

			cy.get('[data-id="card-content-type"] > button')
				.should('contain.text', '-')

			for (let i = 0; i < 5; i++) {
				cy.get('[data-id="btn-field-types-add"]')
					.click();
			}

			for (let i = 0; i < 4; i++) {
				cy.get('[data-id="card-content-type"] > button')
					.eq(-1)
					.should('contain.text', '-')
					.click();
			}

			cy.get('[data-id="selector-function-type"] > select')
				.should('have.length',2)
				.eq(1)
				.find('option')
				.then(options => {
					const values = options.toArray().map(option => option.getAttribute('value')).filter(value => value != null);

					cy.get('[data-id="selector-function-type"] > select')
						.should('exist')
						.eq(1)
						.select(values[(values.length-1)], {force: true})
						.should('have.value', values[(values.length-1)]);
				});

			cy.get('[data-id="file-function-type"] > input')
				.eq(1)
				.selectFile('cypress/fixtures/testfile.txt', { force: true })
				.should('have.value', 'C:\\fakepath\\testfile.txt');
			cy.get('[data-id="file-function-type"] > input')
				.eq(0)
				.should('have.value', 'C:\\fakepath\\example.json');

		});
		it('Cancel button', () => {
			cy.get('[data-id="btn-cancel"]').should('exist').click();
			cy.get('[data-id="create-title"]').should('not.exist');
			cy.get('[data-id="functions-panel"]').should('exist');
		});
		it('Create function with one type', () => {
			const name_mono = name + '-mono_type';
			let type: string[] = [];

			cy.get('[data-id="create-title"]').should('contain.text', 'Function class specification');

			cy.get('[data-id="field-id"]')
				.should('exist');
			cy.get('[name="id"]')
				.should('exist')
				.clear()
				.type(name_mono)
				.should('have.value', name_mono);

			cy.get('[data-id="field-version"]')
				.should('exist');
			cy.get('[name="version"]')
				.should('exist')
				.should('have.value', '0.1')
				.clear()
				.type(function_multi_type.version)
				.should('have.value', function_multi_type.version);

			cy.get('[data-id="field-outputs"]')
				.should('exist');
			cy.get('[name="outputs"]')
				.should('exist')
				.clear()
				.type(function_multi_type.outputs)
				.should('have.value', function_multi_type.outputs);

			cy.get('[data-id="selector-function-type"]')
				.should('exist')
				.click();

			cy.get('[data-id="selector-function-type"] > select > option')
				.should('exist');

			cy.get('[data-id="selector-function-type"]')
				.should('exist');

			cy.get('[data-id="selector-function-type"] > select')
				.should('have.length',1)
				.find('option')
				.should('exist')
				.then(options => {
					const values = options.toArray().map(option => option.getAttribute('value')).filter(value => value!=null);
					type = [values[Math.floor(values.length/2)],`C:\\fakepath\\${function_multi_type.type1.file}`];

					cy.get('[data-id="selector-function-type"] > select')
						.should('exist')
						.select(values[Math.floor(values.length/2)], {force: true})
						.should('have.value', type[0]);

					cy.get('[data-id="file-function-type"] > input')
						.eq(0)
						.selectFile(`cypress/fixtures/${function_multi_type.type1.file}`, { force: true })
						.should('have.value', type[1]);

					cy.get('[data-id="btn-create"]').should('exist').click();
					cy.get('#radix-\\:rc\\:').should('contain.text', 'The function has been created successfully');
					functions_created.push(name_mono);
				});
		});
		it('Create function with multiple types', () => {
			const name_multi = name + '-multi_type';

			cy.get('[data-id="create-title"]').should('contain.text', 'Function class specification');

			cy.get('[data-id="field-id"]')
				.should('exist');
			cy.get('[name="id"]')
				.should('exist')
				.clear()
				.type(name_multi)
				.should('have.value', name_multi);

			cy.get('[data-id="field-version"]')
				.should('exist');
			cy.get('[name="version"]')
				.should('exist')
				.should('have.value', '0.1')
				.clear()
				.type(function_multi_type.version)
				.should('have.value', function_multi_type.version);

			cy.get('[data-id="field-outputs"]')
				.should('exist');
			cy.get('[name="outputs"]')
				.should('exist')
				.clear()
				.type(function_multi_type.outputs)
				.should('have.value', function_multi_type.outputs)

			cy.get('[data-id="selector-function-type"]')
				.should('exist')
				.click();

			cy.get('[data-id="selector-function-type"] > select > option')
				.should('exist');

			cy.get('[data-id="selector-function-type"]')
				.should('exist');

			cy.get('[data-id="selector-function-type"] > select')
				.should('have.length',1)
				.find('option')
				.should('exist')
				.then(options => {
					const values = options.toArray().map(option => option.getAttribute('value')).filter(value => value!=null);
					function_multi_type.type1.value = values[Math.floor(values.length/2)];

					cy.get('[data-id="selector-function-type"] > select')
						.should('exist')
						.select(values[Math.floor(values.length/2)], {force: true})
						.should('have.value', values[Math.floor(values.length/2)]);

					cy.get('[data-id="file-function-type"] > input')
						.eq(0)
						.selectFile(`cypress/fixtures/${function_multi_type.type1.file}`, { force: true })
						.should('have.value', `C:\\fakepath\\${function_multi_type.type1.file}`);
				});

			cy.get('[data-id="btn-field-types-add"]')
				.should('exist')
				.should('contain.text','+ Add Type')
				.click();

			cy.get('[data-id="card-content-type"] > button')
				.should('contain.text', '-')

			cy.get('[data-id="selector-function-type"] > select')
				.should('have.length',2)
				.eq(1)
				.find('option')
				.then(options => {
					const values = options.toArray().map(option => option.getAttribute('value')).filter(value => value != null);
					function_multi_type.type2.value = values[(values.length-1)];

					cy.get('[data-id="selector-function-type"] > select')
						.should('exist')
						.eq(1)
						.select(values[(values.length-1)], {force: true})
						.should('have.value', values[(values.length-1)]);

				});

			cy.get('[data-id="file-function-type"] > input')
				.eq(1)
				.selectFile(`cypress/fixtures/${function_multi_type.type2.file}`, { force: true })
				.should('have.value', `C:\\fakepath\\${function_multi_type.type2.file}`);
			cy.get('[data-id="file-function-type"] > input')
				.eq(0)
				.should('have.value', `C:\\fakepath\\${function_multi_type.type1.file}`);

			cy.wait(2000);
			cy.get('[data-id="btn-create"]').should('exist').click();
			cy.get('#radix-\\:rc\\:').should('contain.text', 'The function has been created successfully');
			functions_created.push(name_multi);
		});
		it('Handling of incorrect input data', () => {
			cy.wait(2000);
			cy.get('[data-id="btn-create"]').should('exist').click()

			cy.get('#\\:r2\\:-form-item-message').should('contain.text', 'The Id must contain at least 3 characters');
			cy.get('[name="id"]')
				.should('exist')
				.clear()
				.type(name)
				.should('have.value', name);
			cy.get('#\\:r2\\:-form-item-message').should('not.exist');

			cy.get('[name="version"]').should('exist').clear();
			cy.get('#\\:r3\\:-form-item-message').should('contain.text', 'The version must contain at least 1 character');
			cy.get('[name="version"]').should('exist').clear().type('0.1');
			cy.get('#\\:r3\\:-form-item-message').should('not.exist');

			cy.get('#\\:r8\\:-form-item-message').should('contain.text', 'Code file is required');
			cy.get('[data-id="file-function-type"] > input')
				.eq(0)
				.selectFile('cypress/fixtures/example.json', { force: true })
				.should('have.value', 'C:\\fakepath\\example.json');
			cy.get('#\\:r8\\:-form-item-message').should('not.exist');
		});
	});

	describe('View function', () => {

		beforeEach(() => {
			cy.get(`[data-id="row-${functions_created[0]}"]`)
				.should('exist')
				.find('[data-id="btn-view"]')
				.click();
		})
		it('View function', () => {
			cy.url().should('include', `/function/view/${functions_created[0]}`);
		});
		it('Display information of stored function', () => {
			cy.wait(1000);
			cy.get(`[data-id="function-id"]`).should('contain.text', functions_created[0]);

			cy.get(`[data-id="v_${function_multi_type.version}"]`).should('contain.text', function_multi_type.version);
			cy.get(`[data-id="v_${function_multi_type.version}-version"]`).should('contain.text', function_multi_type.version);
			cy.get(`[data-id="v_${function_multi_type.version}-outputs"]`).should('contain.text', function_multi_type.outputs);
			cy.get(`[data-id="v_${function_multi_type.version}-types"]`).should('contain.text', `${function_multi_type.type1.value}`);
			cy.get(`[data-id="v_${function_multi_type.version}-createdAt"]`).invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
			cy.get(`[data-id="v_${function_multi_type.version}-updatedAt"]`).invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
		});
		it('Go back button', () => {
			cy.wait(1000);
			cy.get(`[data-id="function-id"]`).should('contain.text', functions_created[0]);

			cy.get('[data-id="btn-back"]').should('exist').click();
			cy.url().should('eq', Cypress.config().baseUrl + '/function');
		});
	});
	describe('Edit function', () => {
		const name_mono = 'test-1756999662893-mono_type';
		beforeEach(() => {
			cy.get(`[data-id="row-${name_mono}"]`)
				.should('exist')
				.find('[data-id="btn-edit"]')
				.click();
		})
		it.only('Edit function', () => {
			cy.url().should('include', `/function/edit/${name_mono}`);
		})
	});

});