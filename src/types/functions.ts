export interface FunctionMinified {
  id: string;
  version: string;
  function_type: string;
  createdAt: string;
  updatedAt: string;
};

export interface ApiResponseGetFunctions {
  items: FunctionMinified[];
  total: number;
  limit: number;
  offset: number;
};