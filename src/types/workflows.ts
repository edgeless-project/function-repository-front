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

export interface FunctionWorkflowBasic {
  name: string,
  class_specification_id: string,
  class_specification_version: string,
  output_mapping: {
    //"next-step"?: string
    [key: string]:  string
  },
  annotations: {}
};

export interface FunctionWorkflow {
  name: string,
  class_specification:{
    function_type: string,
    id: string,
    version: string,
    code_file_id: string,
    outputs:[]
  },
  output_mapping: {
    //"next-step"?: string
    [key: string]:  string
  },
  annotations: {}
};

export interface ResourceWorkflow {
  name: string,
  class_type: string,
  output_mapping: {
    [key: string]:  string
  },
  configurations: {
    host?: string,
    methods?: string
  }
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

export interface JsonFlowComponentState {
  name?: string,
  functions: FunctionWorkflow[],
  resources: ResourceWorkflow[],
  annotations: {}
}
