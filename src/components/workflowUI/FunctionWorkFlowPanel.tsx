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
            <li>
                <li><b>ID</b>:     {data.class_specification_id}</li>
                <li><b>VERSION</b>:    {data.class_specification_version}</li>
            </li>
        );
    }else{
        data = data as FunctionWorkflow;
        return (
            <li>
                <li><b>ID</b>:     {data.class_specification.id}</li>
                <li><b>FUNCTION TYPE</b>:  {data.class_specification.function_type}</li>
                <li><b>VERSION</b>:    {data.class_specification.version}</li>
                <li><b>CODE FILE ID</b>:   {data.class_specification.code_file_id}</li>
            </li>
        );
    }

};

export default FunctionWorkflowPanel;