interface ApiToken {
	expiresAt: string;
	token: string;
}
  
export interface ApiTokensData {
	access_token: ApiToken;
}

export interface User {
	email: string;
	role: string;
	id?: string;
	password?: string;
}