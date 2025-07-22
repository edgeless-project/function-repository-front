export interface FunctionType {
	type: string;
	code_file_id: string;
}

export interface FunctionMinified {
	id: string;
	version: string;
	function_types: FunctionType[];
	createdAt?: string;
	updatedAt?: string;
}

export enum FunctionTypes {
	RUST_WASM = 'RUST_WASM',
	X86 = 'X86',
	ARM = 'ARM',
}

export interface FunctionComplete extends FunctionMinified {
	outputs: string[];
}

export interface ApiResponseGetFunctions {
	items: FunctionMinified[];
	total: number;
	limit: number;
	offset: number;
}

export interface ApiResponseGetFunctionVersions {
	versions: string[];
}

export interface ApiResponseUploadFunctionCode {
	id: string;
}

export interface ApiRequestCreateFunction {
	id: string,
	function_types: FunctionType[],
	version: string,
	outputs: string[]
}

export interface ApiRequestUpdateFunction {
	function_types: FunctionType[],
	outputs: string[]
}

export interface ApiResponseDeleteFunction {
	deletedCount: number;
}
