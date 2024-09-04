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
                <li className="my-2"><b>ID:</b>     {data.class_specification_id}</li>
                <li className="my-2"><b>VERSION:</b>    {data.class_specification_version}</li>
            </li>
        );
    }else{
        data = data as FunctionWorkflow;
        return (
            <li>
                <li className="my-2"><b>ID</b>:     {data.class_specification.id}</li>
                <li className="my-2"><b>FUNCTION TYPE</b>:  {data.class_specification.function_type}</li>
                <li className="my-2"><b>VERSION</b>:    {data.class_specification.version}</li>
                <li className="my-2"><b>CODE FILE ID</b>:   {data.class_specification.code_file_id}</li>
            </li>
        );
    }

};

export default FunctionWorkflowPanel;