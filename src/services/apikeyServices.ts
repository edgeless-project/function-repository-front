import {buildFetchHeaders} from "@/utils/fetch";
import {ResponseApikeyDto, ResponseDeleteKeyDto, ResponseListApikeyDto} from "@/types/apikeys";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const getAPIKeysByAdmin = async (accessToken: string, offset: number, limit :number): Promise<ResponseListApikeyDto> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/auth/apikey?offset=${offset}&limit=${limit}`;
	const data = await fetch(url, { headers });
	const json = await data.json();

	if (data.ok) {
		return {
			items: json.items,
			total: json.total,
			limit: json.limit,
			offset: json.offset,
		};
	}else {
		return {
			items: [],
			total: 0,
			limit: 0,
			offset: 0,
		};
	}
}

export const createAPIKey = async (accessToken: string, name: string): Promise<ResponseApikeyDto> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/auth/apikey`;
	const data = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({name: name}),
		headers
	});

	if (!data.ok) throw new Error(`${data.status} ${data.statusText}`);

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
		throw new Error(`${data.status} ${data.statusText}`);
	}

	const json: ResponseDeleteKeyDto = await data.json() as ResponseDeleteKeyDto;

	return json;
}

export const getAPIKey = async (accessToken: string, id: string): Promise<ResponseApikeyDto> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/auth/apikey/get`;
	const data = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({id: id}),
		headers
	});
	if (!data.ok) throw new Error(`${data.status} ${data.statusText}`);

	const json = await data.json();
	const resp: ResponseApikeyDto = {
		id: json.id,
		key: json.key,
		createdAt: json.createdAt,
		owner: json.owner
	}

	return resp;
}
