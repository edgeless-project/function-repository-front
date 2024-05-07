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
        <Card className="pt-6">
            <CardContent className="m-6">
                <p><b>NAME</b>: {node.name}</p>
                {isFunction(node)?
                    <FunctionWorkFlowPanel data={node}/>:
                    <ResourceWorkFlowPanel data={node}/>}
            </CardContent>
        </Card>
    );
}

export default NodeDataPanel;