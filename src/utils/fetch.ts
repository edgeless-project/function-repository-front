const serverBasicAuthEncoded = process.env.NEXT_PUBLIC_SERVER_BASIC_AUTH_ENCODED ? process.env.NEXT_PUBLIC_SERVER_BASIC_AUTH_ENCODED : '';

export const buildFetchHeaders = (accessToken?: string):HeadersInit  => {
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		'accept': 'application/json'
	};
	if (accessToken) {
		headers['Authorization'] = `bearer ${accessToken}`;
	} else if (serverBasicAuthEncoded) {
		headers['Authorization'] = `Basic ${serverBasicAuthEncoded}`;
	}
	return headers;
};

export const buildFileFetchHeaders = (accessToken?: string):HeadersInit  => {
	const headers: HeadersInit = {
		//'Content-Type': 'multipart/form-data',
		'accept': 'application/json'
	};
	if (accessToken) {
		headers['Authorization'] = `bearer ${accessToken}`;
	} else if (serverBasicAuthEncoded) {
		headers['Authorization'] = `Basic ${serverBasicAuthEncoded}`;
	}
	return headers;
};