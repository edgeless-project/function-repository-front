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
		it('Workflow listed on the list page', () => {
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

			cy.get('[id*="-trigger-visual-builder"]')
				.should('exist')
				.click();
			cy.get('[id*="-content-visual-builder"] > .rounded-lg')
				.should('exist')

			cy.get('[id*="-trigger-json-editor"]')
				.should('exist')
				.click();
			cy.get('.jsoneditor')
				.should('exist')

			cy.get('[name="name"]')
				.should('exist')
				.type(workflow.name+"_JSON-Editor")
				.should('have.value', workflow.name+"_JSON-Editor");

						cy.get('.ace_content')
				.should('exist')
				.click()
				.type(`{pageDown}{pageDown}{pageDown}{shift}{pageUp}{pageUp}{pageUp}{backspace}`, {parseSpecialCharSequences: true});

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
			cy.contains(`[data-id="workflow-row"]`, workflow.name+"_JSON-Editor")
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

						cy.get('.ace_content')
				.should('exist')
				.click()
				.type(`{pageDown}{pageDown}{pageDown}{shift}{pageUp}{pageUp}{pageUp}{backspace}`, {parseSpecialCharSequences: true});

			cy.get('[data-id="btn-save"]').click();
			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'ERROR: The workflow definition is not valid.');
		});
	});

	describe('Edit workflow',()=> {
		const editJson = `{"functions": [{"name": "funcEdit","class_specification_id": "test","class_specification_version": "0.2","output_mapping": {"test-out1": "func2Edit"},"annotations": {}},`+
			`{"name": "func2Edit","class_specification_id": "test","class_specification_version": "0.2","output_mapping": {"test-out1": "res_out"},"annotations": {}}],`+
			`"resources": [{"name": "res1","class_type": "http-ingress","output_mapping": {},"configurations": {}},{"name": "res_out","class_type": "http-egress","output_mapping": {},"configurations": {}}],`+
			`"annotations": {}}`;

		it('Change the json editor content to edit the workflow', () => {
			cy.contains(`[data-id="workflow-row"]`, workflow.name+"_JSON-Editor")
				.should('exist')
				.find(`[data-id="btn-edit"]`)
				.click();

			cy.get('.ace_content')
				.should('exist')
				.click()
				.type(`{pageDown}{pageDown}{pageDown}{shift}{pageUp}{pageUp}{pageUp}{backspace}`, {parseSpecialCharSequences: true});

			cy.wait(1000);
			cy.get('.ace_content')
				.click()
				.type(`${editJson}`, {parseSpecialCharSequences: false});

			cy.get('[data-id="btn-save"]').click();

			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'The workflow has been updated successfully');

		})
		it('Add a node, edit its name using the manel and delete one other', () => {
			cy.contains(`[data-id="workflow-row"]`, workflow.name+"_JSON-Editor")
				.should('exist')
				.find(`[data-id="btn-edit"]`)
				.click();
			cy.get('[id*="-trigger-visual-builder"]')
				.should('exist')
				.click();
			cy.get('[id*="-content-visual-builder"] > .rounded-lg')
				.should('exist');

			// Edit an existing node's name (func1 -> func1_edited)
			cy.wait(1000);
			cy.get('[data-id="funcEdit"]').should('exist').dblclick().click();
			cy.get('[data-id="btn-edit-node"]').should('exist').click();

			// UpdatePanel appears
			cy.get('[data-id="name-update-node"]').should('exist').clear().type('funcEdited');
			cy.get('[data-id="btn-confirm-update-node"]').click();

			// Check if node name is updated in the UI
			cy.get('[data-testid="rf__node-funcEdited"]').should('exist');
			cy.get('[data-testid="rf__node-funcEdit"]').should('not.exist');

			// Delete another node (func2)
			cy.get('[data-testid="rf__node-func2Edit"]').dblclick().click();
			cy.get('[data-id="btn-delete-node"]').should('be.visible').click();
			cy.get('[data-testid="rf__node-func2Edit"]').should('not.exist');

			cy.get('[data-testid="rf__node-funcEdited"] > .react-flow__handle-bottom')
				// @ts-ignore
				.dragTo('[data-testid="rf__node-res_out"] > .react-flow__handle-top');
			cy.get('[data-testid="rf__node-res1"] > .react-flow__handle-bottom')
				// @ts-ignore
				.dragTo('[data-testid="rf__node-funcEdited"] > .react-flow__handle-top');

			cy.contains('button', 'Select a type')
				.should('exist')
				.click();
			cy.get('div > [role="option"]')
				.eq(0)
				.should('exist')
				.click();
			cy.get('[data-id="btn-dialog-confirm"]')
				.should('exist')
				.click();

			// Save and verify
			cy.get('[data-id="btn-save"]').click();
			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'The workflow has been updated successfully');
		});
	})

	describe('Workflow UI basic functionality', () => {
		beforeEach(() => {
			cy.get('[data-id="btn-create"]').click();
			cy.get('[id*="-trigger-visual-builder"]').click();
		})
		it('Add a function', () => {
			cy.get('[id*="-trigger-visual-builder"]')
				.should('exist')
				.click();

			cy.get('[data-id="btn-add-function"]')
				.should('exist')
				.click();

			cy.get('[data-id="name-create-node"]')
				.should('exist')
				.clear()
				.type('testFunction1');
			cy.get('[data-id="type-id-create-function"]')
				.should('exist')
				.clear()
				.type('test');
			cy.get('[data-id="select-id-create-function"]')
				.should('exist')
				.click();
			cy.get('select')
				.eq(0)
				.should('exist')
				.select('test', {force: true});

			cy.wait(1000);
			cy.get('select')
				.eq(1)
				.should('exist')
				.select('0.1', {force: true});

			cy.get('[data-id="btn-confirm-create-node"]')
				.should('exist')
				.click();

			cy.get('[data-testid="rf__node-testFunction1"]')
				.should('exist');
		});
		it('Add a resource', () => {
			cy.get('[id*="-trigger-visual-builder"]')
				.should('exist')
				.click();

			cy.get('[data-id="btn-add-resource"]')
				.should('exist')
				.click();

			cy.get('[data-id="name-create-node"]')
				.should('exist')
				.clear()
				.type('testResource1');

			cy.get('[data-id="select-id-create-resource"]')
				.should('exist')
				.click();
			cy.get('select')
				.should('exist')
				.select(1, {force: true});

			cy.get('[data-id="btn-confirm-create-node"]')
				.should('exist')
				.click();

			cy.get('[data-testid="rf__node-testResource1"]')
				.should('exist');
		});
		it('Create a workflow from scratch and connect the different nodes', () => {
			cy.get('[id*="-trigger-visual-builder"]')
				.should('exist')
				.click();

			//Create ResourceIn for input usage
			cy.get('[data-id="btn-add-resource"]')
				.should('exist')
				.click();
			cy.get('[data-id="name-create-node"]')
				.should('exist')
				.clear()
				.type('ResourceIn');
			cy.get('[data-id="select-id-create-resource"]')
				.should('exist')
				.click();
			cy.get('select')
				.should('exist')
				.select(1, {force: true});

			//Create node and check that it does exist
			cy.get('[data-id="btn-confirm-create-node"]')
				.should('exist')
				.click();
			cy.get('[data-testid="rf__node-ResourceIn"]')
				.should('exist');

			//Create function 1 and 2 and check that do exist in the UI
			cy.get('[data-id="btn-add-function"]')
				.should('exist')
				.click();

			cy.get('[data-id="name-create-node"]')
				.should('exist')
				.clear()
				.type('Function1');
			cy.get('[data-id="type-id-create-function"]')
				.should('exist')
				.clear()
				.type('test');
			cy.get('[data-id="select-id-create-function"]')
				.should('exist')
				.click();
			cy.get('select')
				.eq(0)
				.should('exist')
				.select('test', {force: true});

			cy.wait(1000);
			cy.get('select')
				.eq(1)
				.should('exist')
				.select('0.1', {force: true});

			cy.get('[data-id="btn-confirm-create-node"]')
				.should('exist')
				.click();

			cy.get('[data-testid="rf__node-Function1"]')
				.should('exist');

			cy.get('[data-id="btn-add-function"]')
				.should('exist')
				.click();

			cy.get('[data-id="name-create-node"]')
				.should('exist')
				.clear()
				.type('Function2');
			cy.get('[data-id="type-id-create-function"]')
				.should('exist')
				.clear()
				.type('test');
			cy.get('[data-id="select-id-create-function"]')
				.should('exist')
				.click();
			cy.get('select')
				.eq(0)
				.should('exist')
				.select('test', {force: true});

			cy.wait(1000);
			cy.get('select')
				.eq(1)
				.should('exist')
				.select('0.1', {force: true});

			cy.get('[data-id="btn-confirm-create-node"]')
				.should('exist')
				.click();

			cy.get('[data-testid="rf__node-Function2"]')
				.should('exist');

			//Create ResourceOut for output usage and check that it does exist in the UI
			cy.get('[data-id="btn-add-resource"]')
				.should('exist')
				.click();
			cy.get('[data-id="name-create-node"]')
				.should('exist')
				.clear()
				.type('ResourceOut');
			cy.get('[data-id="select-id-create-resource"]')
				.should('exist')
				.click();
			cy.get('select')
				.should('exist')
				.select(2, {force: true});

			//Create node and check that it does exist
			cy.get('[data-id="btn-confirm-create-node"]')
				.should('exist')
				.click();
			cy.get('[data-testid="rf__node-ResourceIn"]')
				.should('exist');


			//Connect ResourceIn to Function1, Function1 to Function2 and Function2 to ResourceOut
			cy.get('[data-testid="rf__node-ResourceIn"] > .react-flow__handle-bottom')
				// @ts-ignore
				.dragTo('[data-testid="rf__node-Function1"] > .react-flow__handle-top');

			cy.contains('button', 'Select a type')
				.should('exist')
				.click();
			cy.get('div > [role="option"]')
				.eq(0)
				.should('exist')
				.click();
			cy.get('[data-id="btn-dialog-confirm"]')
				.should('exist')
				.click();

			cy.get('[data-testid="rf__node-Function1"] > .react-flow__handle-bottom')
				// @ts-ignore
				.dragTo('[data-testid="rf__node-Function2"] > .react-flow__handle-top');

			cy.contains('button', 'Select a type')
				.should('exist')
				.click();
			cy.get('div > [role="option"]')
				.eq(0)
				.should('exist')
				.click();
			cy.get('[data-id="btn-dialog-confirm"]')
				.should('exist')
				.click();

			cy.get('[data-testid="rf__node-Function2"] > .react-flow__handle-bottom')
				// @ts-ignore
				.dragTo('[data-testid="rf__node-ResourceOut"] > .react-flow__handle-top');

			cy.contains('button', 'Select a type')
				.should('exist')
				.click();
			cy.get('div > [role="option"]')
				.eq(0)
				.should('exist')
				.click();
			cy.get('[data-id="btn-dialog-confirm"]')
				.should('exist')
				.click();

			//Set name and create the workflow
			cy.get('[name="name"]')
				.should('exist')
				.type(workflow.name+"_workflowUI")
				.should('have.value', workflow.name+"_workflowUI");

			cy.get('[data-id="btn-save"]').click();
		});
	});

	describe('Delete workflow',()=> {
		it('Delete a blank workflow', () => {
			cy.contains(`[data-id="workflow-row"]`, workflow.name)
				.should('exist')
				.find(`[data-id="btn-delete"]`)
				.click();

			cy.wait(1000);

			cy.get('[data-id="wf_name"]')
				.should('exist')
				.should('contain.text', workflow.name);

			cy.get('[data-id="wf_createdAt"]')
				.should('exist')
				.invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);

			cy.get('[data-id="wf_updatedAt"]')
				.should('exist')
				.invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);

			cy.get('[data-id="btn-confirm"]')
				.should('exist')
				.click();

			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'The workflow has been deleted successfully');

			cy.get('[data-id="btn-modal-close"]').click();
			cy.contains(`[data-id="workflow-row"]`, workflow.name)
				.should('not.exist');
		});
		it('Delete a workflow created with JSON Editor', () => {
			cy.contains(`[data-id="workflow-row"]`, workflow.name+"_JSON-Editor")
				.should('exist')
				.find(`[data-id="btn-delete"]`)
				.click();

			cy.wait(1000);

			cy.get('[data-id="wf_name"]')
				.should('exist')
				.should('contain.text', workflow.name+"_JSON-Editor");

			cy.get('[data-id="wf_createdAt"]')
				.should('exist')
				.invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);

			cy.get('[data-id="wf_updatedAt"]')
				.should('exist')
				.invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);

			cy.get('[data-id="btn-confirm"]')
				.should('exist')
				.click();

			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'The workflow has been deleted successfully');

			cy.get('[data-id="btn-modal-close"]').click();
			cy.contains(`[data-id="workflow-row"]`, workflow.name+"_JSON-Editor")
				.should('not.exist');
		});
		it('Delete a workflow created with Workflow UI', () => {
			cy.contains(`[data-id="workflow-row"]`, workflow.name+"_workflowUI")
				.should('exist')
				.find(`[data-id="btn-delete"]`)
				.click();

			cy.wait(1000);

			cy.get('[data-id="wf_name"]')
				.should('exist')
				.should('contain.text', workflow.name+"_workflowUI");

			cy.get('[data-id="wf_createdAt"]')
				.should('exist')
				.invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);

			cy.get('[data-id="wf_updatedAt"]')
				.should('exist')
				.invoke('text').should('match', /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);

			cy.get('[data-id="btn-confirm"]')
				.should('exist')
				.click();

			cy.get('[data-id="modal-description"]')
				.should('exist')
				.should('contain.text', 'The workflow has been deleted successfully');

			cy.get('[data-id="btn-modal-close"]').click();
			cy.contains(`[data-id="workflow-row"]`, workflow.name+"_workflowUI")
				.should('not.exist');
		});
	})

})