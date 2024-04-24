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
import dagre from 'dagre';

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
const nodeWidth = 172;
const nodeHeight = 36;

interface JsonFlowComponentProps {
    value: JsonFlowComponentState;
    // onChange?: (value: object) => void;
    // onError?: (hasError: boolean) => void;
    readOnly?: boolean;
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
    // Top-Bottom('TB') or Left-Right('LR')
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const Flow:React.FC<JsonFlowComponentProps> = ({value,readOnly}) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {

        let initialNodes : Node[] = [], initialEdges: Edge[] = [], resourceEdges: Edge[] = [];//  Nodes To INIT Flow
        let i = 2, e_n = 0, o_n = 0, space = 75; // Nodes idxs IDs and Position


        value.functions.forEach(f => {
            let newNode: Node={
                id: f.name,
                position: { x: 0, y: 0 },
                data: { label: f.name },
                width: nodeWidth,
                height: nodeHeight
            };
            ////    TEST
            if(f.name.includes("data-parsing"))
                f.output_mapping["hi apple"] = "state-management-v2";
            ////
            for(let out in f.output_mapping){
                let newEdge: Edge={
                    id: "e_"+f.name+"_"+f.output_mapping[out],
                    source: f.name,
                    target: f.output_mapping[out],
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
                style: styleResourceNodeIn,
                width: nodeWidth,
                height: nodeHeight
            };

            if(r.output_mapping){
                for(let out in r.output_mapping){
                    const newEdge: Edge={
                        id: "e_"+r.name+"_"+r.output_mapping[out],
                        source: r.name,
                        target: r.output_mapping[out],
                        markerEnd: edgeEndResource,
                        style: edgeStyleResource
                    };
                    resourceEdges.push(newEdge);
                }
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

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges.concat(resourceEdges),
            'LR'
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
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