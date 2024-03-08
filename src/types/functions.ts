export interface FunctionMinified {
  id: string;
  version: string;
  function_type: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface ApiResponseGetFunctions {
  items: FunctionMinified[];
  total: number;
  limit: number;
  offset: number;
};

export interface ApiResponseUploadFunctionCode {
  id: string;
};

export interface ApiRequestCreateFunction {
  id: string, 
  code_file_id: string,
  function_type: string,
  version: string,
  outputs: string[]
};