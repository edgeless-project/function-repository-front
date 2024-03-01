import { ApiResponseGetFunctions } from "@/types/functions";
import { buildFetchHeaders } from "@/utils/fetch";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const fetchFunctions =  async (offset: number): Promise<ApiResponseGetFunctions> => {
  const limit = 10;
  const headers = buildFetchHeaders('');
  let url = `${serverRestApi}/function?offset=${offset}&limit=${limit}`;
  const data = await fetch(url, { headers });
  const json = await data.json();
  return json;
};