import {FunctionWorkflow, FunctionWorkflowBasic, ResourceWorkflow} from "@/types/workflows";
import React from "react";
import ResourceWorkFlowPanel from "@/components/workflowUI/dataPanels/ResourceWorkFlowPanel";
import FunctionWorkFlowPanel from "@/components/workflowUI/dataPanels/FunctionWorkFlowPanel";

function isResource(data: FunctionWorkflow | FunctionWorkflowBasic | ResourceWorkflow): data is ResourceWorkflow {
	return (data as ResourceWorkflow).class_type !== undefined ;
}

interface NodeDataPanelProps {
	node:FunctionWorkflow|ResourceWorkflow|FunctionWorkflowBasic;
	readOnly?: boolean;
}

const NodeDataPanel:React.FC<NodeDataPanelProps> = ({node, readOnly}) => {

	return (
		<div className="mt-4">
			<b>NAME:</b> {node.name}
			{isResource(node) ?
				<ResourceWorkFlowPanel data={node}/> :
				<FunctionWorkFlowPanel data={node}/>
			}
		</div>
	);
}

export default NodeDataPanel;