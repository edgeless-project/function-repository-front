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

export interface ApiResponseCreateWorkflow {
  createdAt: string;
  updatedAt: string;
  name: string;
  functions: FunctionWorkflow[];
  resources: ResourceWorkflow[];
  annotations: any; // TODO
};

export interface ApiRequestCreateWorkflow {
  name: string;
  functions: FunctionWorkflow[];
  resources: ResourceWorkflow[];
  annotations: any; // TODO
};