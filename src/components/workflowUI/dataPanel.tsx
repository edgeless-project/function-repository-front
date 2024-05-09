import {FunctionWorkflow, ResourceWorkflow} from "@/types/workflows";
import React from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import ResourceWorkFlowPanel from "@/components/workflowUI/ResourceWorkFlowPanel";
import FunctionWorkFlowPanel from "@/components/workflowUI/FunctionWorkFlowPanel";

function isFunction(data: FunctionWorkflow | ResourceWorkflow): data is FunctionWorkflow {
    return (data as FunctionWorkflow).class_specification !== undefined;
}

interface NodeDataPanelProps {
    node:FunctionWorkflow|ResourceWorkflow;
}

const NodeDataPanel:React.FC<NodeDataPanelProps> = ({node}) => {

    return (
        <p className="mt-4">
                <p><b>NAME</b>: {node.name}</p>
                {isFunction(node)?
                    <FunctionWorkFlowPanel data={node}/>:
                    <ResourceWorkFlowPanel data={node}/>}
        </p>

    );
}

export default NodeDataPanel;