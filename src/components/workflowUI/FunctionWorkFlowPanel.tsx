import {FunctionWorkflow} from "@/types/workflows";
import React from "react";

interface functionWorkflowInstanceProps {
    data: FunctionWorkflow;
}

const functionWorkflowInstance:React.FC<functionWorkflowInstanceProps> = ({data}) => {
    return (
        <ol>
            <li><b>ID</b>:     {data.class_specification.id}</li>
            <li><b>FUNCTION TYPE</b>:  {data.class_specification.function_type}</li>
            <li><b>VERSION</b>:    {data.class_specification.version}</li>
            <li><b>CODE FILE ID</b>:   {data.class_specification.code_file_id}</li>
        </ol>
    );
};

export default functionWorkflowInstance;