import {FunctionWorkflow, FunctionWorkflow_redux, ResourceWorkflow} from "@/types/workflows";
import React from "react";
import ResourceWorkFlowPanel from "@/components/workflowUI/ResourceWorkFlowPanel";
import FunctionWorkFlowPanel from "@/components/workflowUI/FunctionWorkFlowPanel";

function isResource(data: FunctionWorkflow | FunctionWorkflow_redux | ResourceWorkflow): data is ResourceWorkflow {
    return (data as ResourceWorkflow).class_type !== undefined ;
}

interface NodeDataPanelProps {
    node:FunctionWorkflow|ResourceWorkflow|FunctionWorkflow_redux;
    readOnly: boolean;
}

const NodeDataPanel:React.FC<NodeDataPanelProps> = ({node, readOnly}) => {

    return (
        <ol className="mt-4">
            <p><b>NAME</b>: {node.name}</p>
            {isResource(node)?
                <ResourceWorkFlowPanel data={node}/>:
                <FunctionWorkFlowPanel data={node}/>
            }
            {readOnly?
                null:
                <button>Delete</button>

            }
        </ol>

    );
}

export default NodeDataPanel;