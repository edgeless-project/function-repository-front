export interface FunctionMinified {
  id: string;
  version: string;
  function_type: string;
  createdAt?: string;
  updatedAt?: string;
};

export enum FunctionTypes {
  RUST_WASM = 'RUST_WASM'
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

export interface function_types {
  type: string;
  code_file_id: string;
}

export interface ApiRequestCreateFunction {
  id: string,
  function_types: function_types[],
  version: string,
  outputs: string[]
};

export interface ApiRequestUpdateFunction {
  code_file_id: string,
  function_type: string,
  outputs: string[]
};

export interface ApiResponseDeleteFunction {
  deletedCount: number;
};
