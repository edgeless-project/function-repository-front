export const buildFetchHeaders = (accessToken?: string):HeadersInit  => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'accept': 'application/json'
  };
  if(accessToken) {
    headers['Authorization'] = `bearer ${accessToken}`;
  }
  return headers;
};