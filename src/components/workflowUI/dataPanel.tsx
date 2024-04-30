import {FunctionWorkflow, ResourceWorkflow} from "@/types/workflows";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";

const NodeDataPanel:React.FC<FunctionWorkflow|ResourceWorkflow> = (data) => {

    return (
        <Card>
            <CardContent>
                <p>{data.name}</p>
                <p>{typeof data}</p>
            </CardContent>
        </Card>
    );
}

export default NodeDataPanel;