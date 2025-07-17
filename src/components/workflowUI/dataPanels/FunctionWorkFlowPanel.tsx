import {FunctionWorkflow, FunctionWorkflowBasic} from "@/types/workflows";
import React from "react";

interface functionWorkflowInstanceProps {
	data: FunctionWorkflow | FunctionWorkflowBasic;
}

const FunctionWorkflowPanel:React.FC<functionWorkflowInstanceProps> = ({data}) => {
	//Loads data on regards of class specification struct
	if((data as FunctionWorkflowBasic).class_specification_id !== undefined){
		data = data as FunctionWorkflowBasic;
		return (
			<div>
				<div className="my-2"><b>ID:</b>     {data.class_specification_id}</div>
				<div className="my-2"><b>VERSION:</b>    {data.class_specification_version}</div>
			</div>
		);
	}else{
		data = data as FunctionWorkflow;
		return (
			<div>
				<div className="my-2"><b>ID</b>:     {data.class_specification.id}</div>
				<div className="my-2"><b>FUNCTION TYPE</b>:  {data.class_specification.function_type}</div>
				<div className="my-2"><b>VERSION</b>:    {data.class_specification.version}</div>
				<div className="my-2"><b>CODE FILE ID</b>:   {data.class_specification.code_file_id}</div>
			</div>
		);
	}

};

export default FunctionWorkflowPanel;