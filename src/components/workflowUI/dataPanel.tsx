import {FunctionWorkflow, ResourceWorkflow} from "@/types/workflows";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";

function isFunction(data: FunctionWorkflow | ResourceWorkflow): data is FunctionWorkflow {
    console.log(data);
    return (data as FunctionWorkflow).class_specification !== undefined;
}

const functionWorkflowInstance = (data: FunctionWorkflow) => {
    return (
        <ol>
            <li>ID:     {data.class_specification.id}</li>
            <li>FUNCTION TYPE:  {data.class_specification.function_type}</li>
            <li>VERSION:    {data.class_specification.version}</li>
            <li>CODE FILE ID:   {data.class_specification.code_file_id}</li>
        </ol>
    );
};

const resourceWorkflowInstance = (data: ResourceWorkflow) => {

    return(
        <ol>
            <li>CLASS TYPE:     {data.class_type}</li>
        </ol>
    );
};

const NodeDataPanel:React.FC<FunctionWorkflow|ResourceWorkflow> = (data) => {

    return (
        <Card>
            <CardContent>
                <p/>
                <p>NAME: {data.name}</p>
                {isFunction(data)? functionWorkflowInstance(data): resourceWorkflowInstance(data)}
            </CardContent>
        </Card>
    );
}

export default NodeDataPanel;