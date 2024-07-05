import {FunctionWorkflow, FunctionWorkflowBasic, ResourceWorkflow} from "@/types/workflows";
import React from "react";
import ResourceWorkFlowPanel from "@/components/workflowUI/ResourceWorkFlowPanel";
import FunctionWorkFlowPanel from "@/components/workflowUI/FunctionWorkFlowPanel";

function isResource(data: FunctionWorkflow | FunctionWorkflowBasic | ResourceWorkflow): data is ResourceWorkflow {
    return (data as ResourceWorkflow).class_type !== undefined ;
}

interface NodeDataPanelProps {
    node:FunctionWorkflow|ResourceWorkflow|FunctionWorkflowBasic;
    readOnly?: boolean;
}

const NodeDataPanel:React.FC<NodeDataPanelProps> = ({node, readOnly}) => {
    let buttonArea = null;
    if(readOnly !== undefined && !readOnly){
        buttonArea =
            <div className="flex justify-center">
                <div className="h-max grid content-end">
                    <button className="bg-red-600 hover:bg-red-500 text-white py-2 px-32 rounded">Delete</button>
                </div>
            </div>
    }
//max-h-full

    return (
        <div className="max-w-full ">
            <ol className="mt-4">
                <li><b>NAME</b>: {node.name}</li>
                {isResource(node) ?
                    <ResourceWorkFlowPanel data={node}/> :
                    <FunctionWorkFlowPanel data={node}/>
                }
            </ol>
        </div>


    );
}

export default NodeDataPanel;