import {
	ApiRequestCreateFunction,
	ApiResponseGetFunctionVersions,
	ApiResponseGetFunctions,
	ApiResponseUploadFunctionCode,
	FunctionComplete, ApiRequestUpdateFunction, ApiResponseDeleteFunction, FunctionType
} from "@/types/functions";
import { buildFetchHeaders, buildFileFetchHeaders } from "@/utils/fetch";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const fetchFunctions =  async (offset: number, accessToken: string): Promise<ApiResponseGetFunctions> => {
	const limit = 10;
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/function?offset=${offset}&limit=${limit}`;
	const data = await fetch(url, { headers });
	const json = await data.json();
	return json;
};

export const getFunction =  async (id: string, version: string = '', accessToken: string): Promise<FunctionComplete> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/function/${id}${version !== '' ? `?version=${version}` : ''}`;
	const data = await fetch(url, { headers });
	const json = await data.json();
	return json;
};

export const getFunctionVersions =  async (id: string, accessToken: string): Promise<ApiResponseGetFunctionVersions> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/function/${id}/versions`;
	const data = await fetch(url, { headers });
	const json = await data.json();
	return json;
};

export const getFunctionVersionsComplete = async (id: string, accessToken: string): Promise<FunctionComplete[]> => {
	try {
		let functionVersions: FunctionComplete[] = [];
		const versionsResponse = await getFunctionVersions(id, accessToken);
		for (const version of versionsResponse.versions) {
			const func = await getFunction(id, version, accessToken);
			functionVersions.push(func);
		}
		return functionVersions;
	} catch {
		throw new Error('Error getting the functions');
	}
};

export const uploadCodeFile = async (file: File, token: string): Promise<ApiResponseUploadFunctionCode> => {//TODO: Check if access token needed

	const headers = buildFileFetchHeaders(token);
	const url = `${serverRestApi}/function/upload`;
	const formData  = new FormData();
	formData.append('file', file);
	const data = await fetch(url, {
		method: 'POST',
		body: formData,
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json();
	return json;
};

export const createFunction = async (
	id: string,
	function_types: { type: string; code_file_id: string }[],
	version: string,
	outputs: string[],
	accessToken: string
): Promise<ApiResponseUploadFunctionCode> => {

	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/function`;
	const payload: ApiRequestCreateFunction = {
		id,
		function_types,
		version,
		outputs
	};
	const data = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(payload),
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json();
	return json;
};

export const updateFunction = async (
	id: string,
	function_types: FunctionType[],
	version: string,
	outputs: string[],
	accessToken: string
): Promise<ApiResponseUploadFunctionCode> => {

	const headers = buildFetchHeaders(accessToken);
	const params = new URLSearchParams({ version: version});
	const url = `${serverRestApi}/function/${id}?${params.toString()}`;
	const payload: ApiRequestUpdateFunction = {
		function_types,
		outputs
	};

	const data = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(payload),
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json();
	return json;
};

export const deleteFunction = async (
	id: string,
	version: string,
	accessToken: string
):Promise<ApiResponseDeleteFunction> => {
	const headers = buildFetchHeaders(accessToken);
	const params = new URLSearchParams({ version: version});
	const url = `${serverRestApi}/function/${id}${version? `?${params.toString()}`:""}`;
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
}

export const getFunctionsSimilarId =  async (name_partial: string, accessToken: string): Promise<ApiResponseGetFunctions> => {
	const limit = 10;
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/function?offset=${0}&limit=${limit}&partial_search=${name_partial}`;
	const data = await fetch(url, { headers });
	const json = await data.json();
	return json;
};