interface ApiToken {
	expiresAt: string;
	token: string;
};
  
export interface ApiTokensData {
	access_token: string;
	/*refreshToken: ApiToken;
	statusCode?: number;
	error?: string;
	message?: string*/
};
export interface User {
	email: string;
	role: string;
	id?: string;
	password?: string;
}