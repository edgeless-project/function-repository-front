import {ResourceWorkflow} from "@/types/workflows";
import React from "react";

interface resourceWorkflowInstanceProps {
	data: ResourceWorkflow;
}

const ResourceWorkflowPanel:React.FC<resourceWorkflowInstanceProps> = ({data}) => {

	return(
		<div className="my-2"><b>CLASS TYPE:</b>    {data.class_type}</div>
	);
};

export default ResourceWorkflowPanel;