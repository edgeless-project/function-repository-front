import { buildFetchHeaders } from "@/utils/fetch";
import {ResponseApikeyDto, ResponseDeleteKeyDto, ResponseListApikeyDto} from "@/types/apikeys";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const getAPIKeysByAdmin = async (accessToken: string, offset: number, limit :number): Promise<ResponseListApikeyDto> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/auth/apikey?offset=${offset}&limit=${limit}`;
	const data = await fetch(url, { headers });
	const json = await data.json();

	const response: ResponseListApikeyDto = {
		items: json.items,
		total: json.total,
		limit: json.limit,
		offset: json.offset,
	}
	return response;
}


export const createAPIKey = async (accessToken: string, name: string): Promise<ResponseApikeyDto> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/auth/apikey`;
	const data = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({name: name}),
		headers
	});

	const json = await data.json();
	const resp: ResponseApikeyDto = {
		id: json.id,
		key: json.key,
		createdAt: json.createdAt,
		owner: json.owner
	}

	return resp;
}


export const deleteAPIKey = async (accessToken: string, id: string): Promise<ResponseDeleteKeyDto> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/auth/apikey/${id}`;
	const data = await fetch(url, {
		method: 'DELETE',
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json: ResponseDeleteKeyDto = await data.json() as ResponseDeleteKeyDto;

	return json;
}