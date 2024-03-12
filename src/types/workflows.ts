export interface WorkflowMinified {
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface ApiResponseGetWorkflows {
  items: WorkflowMinified[];
  total: number;
  limit: number;
  offset: number;
};

export interface FunctionWorkflow {
  name: string;
  class_specification: any; // TODO
  output_mapping: any; // TODO
  annotations: any; // TODO
};

export interface ResourceWorkflow {
  name: string;
  class_type: string;
  output_mapping: any;
  configurations: any;
};

export interface ApiResponseWorkflow {
  createdAt: string;
  updatedAt: string;
  name: string;
  functions: FunctionWorkflow[];
  resources: ResourceWorkflow[];
  annotations: any; // TODO
};

export interface ApiRequestUpdateWorkflow {
  functions: FunctionWorkflow[];
  resources: ResourceWorkflow[];
  annotations: any; // TODO
};

export interface ApiRequestCreateWorkflow extends ApiRequestUpdateWorkflow {
  name: string;
};

export interface ApiResponseDeleteWorkflow {
  deletedCount: number;
};