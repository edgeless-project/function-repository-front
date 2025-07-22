import { ApiRequestCreateWorkflow, ApiResponseWorkflow, ApiResponseGetWorkflows, ApiRequestUpdateWorkflow, ApiResponseDeleteWorkflow } from "@/types/workflows";
import { buildFetchHeaders } from "@/utils/fetch";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const fetchWorkflows =  async (offset: number, token: string): Promise<ApiResponseGetWorkflows> => {
	const limit = 10;
	const headers = buildFetchHeaders(token);
	const url = `${serverRestApi}/workflow?offset=${offset}&limit=${limit}`;
	const data = await fetch(url, { headers });

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json();
	return json;
};

export const getWorkflow = async (name: string, excludeClassSpecification: boolean, token: string): Promise<ApiResponseWorkflow> => {
	const headers = buildFetchHeaders(token);
	const url = `${serverRestApi}/workflow/${name}${excludeClassSpecification ? '?exclude_class_specification=true' : ''}`;
	const data = await fetch(url, { headers });

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json();
	return json;
};

export const createWorkflow = async (workflowData: ApiRequestCreateWorkflow, token: string): Promise<ApiResponseWorkflow> => {
	const headers = buildFetchHeaders(token);
	const url = `${serverRestApi}/workflow`;
	const data = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(workflowData),
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json();
	return json;
};

export const updateWorkflow = async (name: string, workflowData: ApiRequestUpdateWorkflow, token: string): Promise<ApiResponseWorkflow> => {
	const headers = buildFetchHeaders(token);
	const url = `${serverRestApi}/workflow/${name}`;
	const data = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(workflowData),
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json();
	return json;
};

export const deleteWorkflow = async (name: string, token: string): Promise<ApiResponseDeleteWorkflow> => {
	const headers = buildFetchHeaders(token);
	const url = `${serverRestApi}/workflow/${name}`;
	const data = await fetch(url, {
		method: 'DELETE',
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json();
	return json;
};