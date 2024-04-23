import React, {useCallback, useEffect, useState} from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    addEdge,
    MarkerType,
    Edge,
    Node,
    OnNodesChange,
    applyNodeChanges,
    OnEdgesChange,
    applyEdgeChanges,
    FitViewOptions,
    Connection
} from 'reactflow';
import {BackgroundVariant} from "@reactflow/background";
import {JsonFlowComponentState} from "@/types/workflows";
import {start} from "node:repl";

//Nodes Style modes
const styleResourceNodeOut = {
    background: 'rgba(217,90,109,0.78)'
}
const styleResourceNodeIn = {
    background: 'rgb(66,232,48)'
}
const edgeEndResource = {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#ff0000'
}
const edgeEndFunction = {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#000000'
}
const edgeStyleResource = {
    strokeWidth: 2,
    stroke: '#ff0000',
}
const edgeStyleFunction = {
    strokeWidth: 2,
    stroke: '#000000',
}
const fitViewOptions: FitViewOptions = {
    padding: 0.05,
};

interface JsonFlowComponentProps {
    value: JsonFlowComponentState;
    // onChange?: (value: object) => void;
    // onError?: (hasError: boolean) => void;
    readOnly?: boolean;
}

const Flow:React.FC<JsonFlowComponentProps> = ({value,readOnly}) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isInteractive, setIsInteractive] = useState(false);  //  Allow user interact with nodes

    useEffect(() => {

        let initialNodes : Node[] = [], initialEdges: Edge[] = [], resourceEdges: Edge[] = [];//  Nodes To INIT Flow
        let i = 2, e_n = 0, o_n = 0, space = 75; // Nodes idxs IDs and Position


        value.functions.forEach(f => {
            let newNode: Node={
                id: f.name,
                position: { x: 2*space, y: i*space },
                data: { label: f.name }
            };
            if(f.output_mapping["next-step"]){
                let newEdge: Edge={
                    id: "e_"+f.name+"_"+f.output_mapping["next-step"],
                    source: f.name,
                    target: f.output_mapping["next-step"],
                    markerEnd: edgeEndFunction,
                    style: edgeStyleFunction
                };
                initialEdges.push(newEdge);
            }
            initialNodes.push(newNode);
            i++;

        });//Create a node and an edge from each function entry, normal nodes
        value.resources.forEach(r => {

            let newNode: Node ={
                id: r.name,
                position: {
                    x: 0,
                    y: 0
                },
                data: { label: r.name },
                style: styleResourceNodeIn
            };

            if (r.output_mapping?.new_request){
                newNode.position = {x: 0, y: e_n*space};
                e_n++;
            }else{
                newNode.position = {x: 4*space, y: i*space + o_n*space};
                o_n++;
            }

            if(r.output_mapping?.new_request){
                const newEdge: Edge={
                    id: "e_"+r.name+"_"+r.output_mapping["new_request"],
                    source: r.name,
                    target: r.output_mapping["new_request"]? r.output_mapping["new_request"]: "",
                    markerEnd: edgeEndResource,
                    style: edgeStyleResource
                };
                resourceEdges.push(newEdge);
            }else{
                //  If resource node does not have new request, it's considered an ENDPOINT.
                newNode.style = styleResourceNodeOut;
                initialEdges.forEach(e =>{
                    const nodes = e.id.split("_").slice(1);
                    if (nodes.includes(r.name)){
                        e.markerEnd = edgeEndResource;
                        e.style = edgeStyleResource;
                    }
                });
            }

            initialNodes.push(newNode);
            i++;
        });//Create a node and an edge from each resource entry. Entry points nodes.

        setNodes(initialNodes);
        setEdges(initialEdges.concat(resourceEdges));
        setIsMounted(true);
    }, []);

    const handleClickNode = (event: any, nodeClicked: any) => {
        console.log(nodeClicked);
    }; //Function to execute on node click
    const handleConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );
    const handleNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const handleEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    return isMounted ? (
        <div style={{width: '80vw', height: '80vh'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onNodeClick={handleClickNode}
                fitView
                fitViewOptions={fitViewOptions}
                nodesDraggable={!readOnly}
                nodesConnectable={!readOnly}
            >
                <Controls/>
                <MiniMap/>
                <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
            </ReactFlow>
        </div>
    ) : null;
}

export default Flow;