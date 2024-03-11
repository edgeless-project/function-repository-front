import { ApiRequestCreateWorkflow, ApiResponseCreateWorkflow, ApiResponseGetWorkflows } from "@/types/workflows";
import { buildFetchHeaders } from "@/utils/fetch";

const serverRestApi = process.env.NEXT_PUBLIC_SERVER_REST_API;

export const fetchWorkflows =  async (offset: number): Promise<ApiResponseGetWorkflows> => {
  const limit = 10;
  const headers = buildFetchHeaders('');
  const url = `${serverRestApi}/workflow?offset=${offset}&limit=${limit}`;
  const data = await fetch(url, { headers });
  const json = await data.json();
  return json;
};

export const createWorkflow = async (workflowData: ApiRequestCreateWorkflow): Promise<ApiResponseCreateWorkflow> => {
  
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