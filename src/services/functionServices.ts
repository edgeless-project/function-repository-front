import {
  ApiRequestCreateFunction,
  ApiResponseGetFunctionVersions,
  ApiResponseGetFunctions,
  ApiResponseUploadFunctionCode,
  FunctionComplete, ApiRequestUpdateFunction
} from "@/types/functions";
import { buildFetchHeaders, buildFileFetchHeaders } from "@/utils/fetch";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const fetchFunctions =  async (offset: number): Promise<ApiResponseGetFunctions> => {
  const limit = 10;
  const headers = buildFetchHeaders('');
  const url = `${serverRestApi}/function?offset=${offset}&limit=${limit}`;
  const data = await fetch(url, { headers });
  const json = await data.json();
  return json;
};

export const getFunction =  async (id: string, version: string = ''): Promise<FunctionComplete> => {
  const headers = buildFetchHeaders('');
  const url = `${serverRestApi}/function/${id}${version !== '' ? `?version=${version}` : ''}`;
  const data = await fetch(url, { headers });
  const json = await data.json();
  return json;
};

export const getFunctionVersions =  async (id: string): Promise<ApiResponseGetFunctionVersions> => {
  const headers = buildFetchHeaders('');
  const url = `${serverRestApi}/function/${id}/versions`;
  const data = await fetch(url, { headers });
  const json = await data.json();
  return json;
};

export const getFunctionVersionsComplete = async (id: string): Promise<FunctionComplete[]> => {
  try {
    let functionVersions: FunctionComplete[] = [];
    const versionsResponse = await getFunctionVersions(id);
    for (const version of versionsResponse.versions) {
      const func = await getFunction(id, version);
      functionVersions.push(func);
    }
    return functionVersions;
  } catch {
    throw new Error('Error getting the functions');
  }
};

export const uploadCodeFile = async (file: File): Promise<ApiResponseUploadFunctionCode> => {

  const headers = buildFileFetchHeaders('');
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
  code_file_id: string,
  function_type: string,
  version: string,
  outputs: string[]
): Promise<ApiResponseUploadFunctionCode> => {

  const headers = buildFetchHeaders('');
  const url = `${serverRestApi}/function`;
  const payload: ApiRequestCreateFunction = {
    id, 
    code_file_id,
    function_type,
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
    code_file_id: string,
    function_type: string,
    version: string,
    outputs: string[]
): Promise<ApiResponseUploadFunctionCode> => {

  const headers = buildFetchHeaders('')
  const params = new URLSearchParams({ version: version});
  const url = `${serverRestApi}/function/${id}?${params.toString()}`;
  const payload: ApiRequestUpdateFunction = {
    code_file_id,
    function_type,
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