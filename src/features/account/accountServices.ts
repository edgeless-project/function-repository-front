import { ApiTokensData, User } from "../../types/account";
import { buildFetchHeaders } from "../../utils/fetch";


const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const login =  async (email: string, password: string): Promise<ApiTokensData> => {
  const headers = buildFetchHeaders('');
  const data = await fetch(`${serverRestApi}/auth/login`, {
    method: 'POST', 
    headers,
    body: JSON.stringify({email, password}),
  });
  const json = await data.json();
  return {
    access_token: {
      expiresAt: json?.expires_at,
      token: json?.access_token,
    },
  };
};

export const fetchRefreshToken =  async (accessToken: string): Promise<ApiTokensData> => {
  const headers = buildFetchHeaders(accessToken);
  const data = await fetch(`${serverRestApi}/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({accessToken}),
    headers
  });
  const json = await data.json();
  return {
    access_token: {
      expiresAt: json?.expires_at,
      token: json?.access_token,
    },
  };
};

export const fetchUserLogged =  async (accessToken: string): Promise<User> => {
  const headers = buildFetchHeaders(accessToken);
  const data = await fetch(`${serverRestApi}/auth/info`, { headers });
  const json = await data.json();
  return json;
};