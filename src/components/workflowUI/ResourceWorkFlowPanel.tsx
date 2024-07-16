import {ResourceWorkflow} from "@/types/workflows";
import React from "react";

interface resourceWorkflowInstanceProps {
    data: ResourceWorkflow;
}

const ResourceWorkflowPanel:React.FC<resourceWorkflowInstanceProps> = ({data}) => {

    return(
        <ol>
            <li><b>CLASS TYPE</b>:     {data.class_type}</li>
        </ol>
    );
};

export default ResourceWorkflowPanel;