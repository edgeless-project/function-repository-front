export interface FunctionMinified {
  id: string;
  version: string;
  function_type: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface FunctionComplete extends FunctionMinified {
  code_file_id: string;
  outputs: string[];
};

export interface ApiResponseGetFunctions {
  items: FunctionMinified[];
  total: number;
  limit: number;
  offset: number;
};

export interface ApiResponseGetFunctionVersions {
  versions: string[];
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