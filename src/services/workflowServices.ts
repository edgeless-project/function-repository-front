import { ApiRequestCreateWorkflow, ApiResponseWorkflow, ApiResponseGetWorkflows } from "@/types/workflows";
import { buildFetchHeaders } from "@/utils/fetch";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const fetchWorkflows =  async (offset: number): Promise<ApiResponseGetWorkflows> => {
  const limit = 10;
  const headers = buildFetchHeaders('');
  const url = `${serverRestApi}/workflow?offset=${offset}&limit=${limit}`;
  const data = await fetch(url, { headers });

  if(!data.ok) {
    const json = await data.json();
    throw new Error(json.message);
  }

  const json = await data.json();
  return json;
};

export const getWorkflow = async (name: string): Promise<ApiResponseWorkflow> => {
  const headers = buildFetchHeaders('');
  const url = `${serverRestApi}/workflow/${name}`;
  const data = await fetch(url, { headers });

  if(!data.ok) {
    const json = await data.json();
    throw new Error(json.message);
  }

  const json = await data.json();
  return json;
};

export const createWorkflow = async (workflowData: ApiRequestCreateWorkflow): Promise<ApiResponseWorkflow> => {
  const headers = buildFetchHeaders('');
  const url = `${serverRestApi}/workflow`;
  const data = await fetch(url, { 
    method: 'POST',
    body: JSON.stringify(workflowData),
    headers 
  });

  if(!data.ok) {
    const json = await data.json();
    throw new Error(json.message);
  }

  const json = await data.json();
  return json;
};