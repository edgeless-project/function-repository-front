import {FunctionWorkflow, FunctionWorkflow_redux} from "@/types/workflows";
import React from "react";

interface functionWorkflowInstanceProps {
    data: FunctionWorkflow | FunctionWorkflow_redux;
}

const functionWorkflowInstance:React.FC<functionWorkflowInstanceProps> = ({data}) => {
    //Loads data on regards of class specification struct
    if((data as FunctionWorkflow_redux).class_specification_id !== undefined){
        data = data as FunctionWorkflow_redux;
        return (
            <ol>
                <li><b>ID</b>:     {data.class_specification_id}</li>
                <li><b>VERSION</b>:    {data.class_specification_version}</li>
            </ol>
        );
    }else{
        data = data as FunctionWorkflow;
        return (
            <ol>
                <li><b>ID</b>:     {data.class_specification.id}</li>
                <li><b>FUNCTION TYPE</b>:  {data.class_specification.function_type}</li>
                <li><b>VERSION</b>:    {data.class_specification.version}</li>
                <li><b>CODE FILE ID</b>:   {data.class_specification.code_file_id}</li>
            </ol>
        );
    }

};

export default functionWorkflowInstance;