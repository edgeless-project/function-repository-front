describe('Workflow management and functionalities', () => {
	const credentials = {
		default:{
			username: 'admin@admin.com',
			password: 'admin123',
			role: 'CLUSTER_ADMIN'
		}
	}

	const workflow = {
		name: `test_workflow_${Date.now()}`,
		name_2: `test_workflow_2_${Date.now()}`,
		editor: `{"functions": [{"name": "func1","class_specification_id": "test","class_specification_version": "0.2","output_mapping": {"test-out1": "func2"},"annotations": {}},`+
		`{"name": "func2","class_specification_id": "test","class_specification_version": "0.2","output_mapping": {"test-out1": "res_out"},"annotations": {}}],`+
			`"resources": [{"name": "res1","class_type": "http-ingress","output_mapping": {"output_func1": "func1"},"configurations": {}},{"name": "res_out","class_type": "http-egress","output_mapping": {},"configurations": {}}],`+
			`"annotations": {}}`
	}

	beforeEach(() => {
		cy.visit('/')
		cy.get('[name="email"]').type(credentials.default.username);
		cy.get('[name="password"]').type(credentials.default.password);
		cy.get('[data-id="btn-login"]').click();

		cy.url().should('eq', Cypress.config().baseUrl + '/');
		cy.visit('/workflow')
	});

	it('Display workflow management page', () => {
		cy.url().should('eq', Cypress.config().baseUrl + '/workflow');
		cy.get('[data-id="workflows-panel"]')
			.should('exist')
			.should('contain.text', 'List of workflows');
		cy.get('[data-id="workflows-table"]')
			.should('exist');
		cy.get('[data-id="workflows-table"] > thead > tr > th')
			.should('have.length', 4)
			.should('contain.text', 'Name')
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

	describe('Create workflow',()=>{
		it('Create a new blank workflow', () => {
			cy.get('[data-id="btn-create"]').click();

			cy.get('[name="name"]')
				.should('exist')
				.type(workflow.name)
				.should('have.value', workflow.name);

			cy.get('[data-id="btn-save"]').click();

			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'The workflow has been created successfully');
		});
		it('Workflow listed on the index page', () => {
			cy.get('[data-id="name"]').should('contain.text', workflow.name);
			cy.contains(`[data-id="workflow-row"]`, workflow.name)
				.should('exist')
				.find(`[data-id="created"]`)
				.invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
			cy.contains(`[data-id="workflow-row"]`, workflow.name)
				.should('exist')
				.find(`[data-id="updated"]`)
				.invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
		});
		it('Create a new workflow with json editor', () => {
			cy.get('[data-id="btn-create"]').click();

			cy.get('[name="name"]')
				.should('exist')
				.type(workflow.name+"_jsonEditor")
				.should('have.value', workflow.name+"_jsonEditor");
			for (let i = 0; i < 4; i++) {
				cy.get('.ace_content')
					.should('exist')
					.click()
					.type(`{selectAll}{backspace}`, {parseSpecialCharSequences: true});
			}
			cy.wait(1000);
			cy.get('.ace_content')
				.click()
				.type(`${workflow.editor}`, {parseSpecialCharSequences: false});

			cy.get('[data-id="btn-save"]').click();

			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'The workflow has been created successfully');

			cy.get('[data-id="btn-modal-close"]').click();

			cy.wait(1000);
			cy.contains(`[data-id="workflow-row"]`, workflow.name+"_jsonEditor")
				.should('exist');

		});
		it('Error handling when creating a workflow with invalid name', () => {
			cy.get('[data-id="btn-create"]').click();
			cy.get('[name="name"]')
				.should('exist')
				.clear();

			cy.get('[data-id="btn-save"]').click();
			cy.get('#\\:r2\\:-form-item-message').should('contain.text', 'The Id must contain at least 3 characters');
		});
		it('Error handling when creating a workflow with invalid json', () => {
			cy.get('[data-id="btn-create"]').click();
			cy.get('[name="name"]')
				.should('exist')
				.clear()
				.type(workflow.name+"_invalidJson");

			for (let i = 0; i < 4; i++) {
				cy.get('.ace_content')
					.should('exist')
					.click()
					.type(`{selectAll}{backspace}`, {parseSpecialCharSequences: true});
			}

			cy.get('[data-id="btn-save"]').click();
			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'ERROR: The workflow definition is not valid.');
		});
	});

	describe('Edit workflow',()=>{
		const nameTemp = 'test_workflow_1757668439130_jsonEditor';
		const editJson = `{"functions": [{"name": "funcEdit","class_specification_id": "test","class_specification_version": "0.2","output_mapping": {"test-out1": "func2"},"annotations": {}},`+
			`{"name": "func2Edit","class_specification_id": "test","class_specification_version": "0.2","output_mapping": {"test-out1": "res_out"},"annotations": {}}],`+
			`"resources": [{"name": "res1","class_type": "http-ingress","output_mapping": {"output_func1": "func1"},"configurations": {}},{"name": "res_out","class_type": "http-egress","output_mapping": {},"configurations": {}}],`+
			`"annotations": {}}`;

		it('Edit a workflow', () => {
			cy.contains(`[data-id="workflow-row"]`, nameTemp)
				.should('exist')
				.find(`[data-id="btn-edit"]`)
				.click();

			for (let i = 0; i < 4; i++) {
				cy.get('.ace_content')
					.should('exist')
					.click()
					.type(`{selectAll}{backspace}`, {parseSpecialCharSequences: true});
			}

			cy.wait(1000);
			cy.get('.ace_content')
				.click()
				.type(`${editJson}`, {parseSpecialCharSequences: false});

			cy.get('[data-id="btn-save"]').click();

			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'The workflow has been updated successfully');

		})
	})


})