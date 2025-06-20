import { buildFetchHeaders } from "@/utils/fetch";
import {ApiResponseGetUsers, ApiResponseUser, ResponseDeleteUserDto, UserDTO} from "@/types/users";
import {User} from "@/types/account";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const getUsersByAdmin = async (accessToken: string, offset: number, limit :number): Promise<ApiResponseGetUsers> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/user?offset=${offset}&limit=${limit}`;
	const data = await fetch(url, { headers });
	const json = await data.json();

	const response: ApiResponseGetUsers = {
		items: json.users,
		total: json.total,
		limit: json.limit,
		offset: json.offset,
	}

	return response;
}

export const getUserById = async (accessToken: string, id: string): Promise<ApiResponseUser> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/user/${id}`;
	const data = await fetch(url, { headers	});

	const json = await data.json() as ApiResponseUser;

	return json;
}

export const createUser = async (accessToken: string, userData: UserDTO): Promise<ApiResponseUser> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/user`;
	const data = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(userData),
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json: ApiResponseUser = await data.json() as ApiResponseUser;

	return json;
}

export const updateUser = async (accessToken: string, userId: string, userData: User): Promise<ApiResponseUser> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/user/update/${userId}`;
	const data = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(userData),
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json: ApiResponseUser = await data.json() as ApiResponseUser;

	return json;
}

export const changeUserPassword = async (accessToken: string, userId: string, password: string): Promise<ApiResponseUser> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/user/password/${userId}`;
	const data = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify({password: password}),
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json: ApiResponseUser = await data.json() as ApiResponseUser;

	return json;
}

export const deleteUser = async (accessToken: string, userId: string): Promise<ResponseDeleteUserDto> => {
	const headers = buildFetchHeaders(accessToken);
	const url = `${serverRestApi}/user/${userId}`;
	const data = await fetch(url, {
		method: 'DELETE',
		headers
	});

	if(!data.ok) {
		const json = await data.json();
		throw new Error(json.message);
	}

	const json = await data.json() as ResponseDeleteUserDto;

	return json;
}