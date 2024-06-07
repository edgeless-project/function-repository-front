import React, {useCallback, useEffect, useState} from 'react';
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Connection,
    ConnectionLineType,
    Controls,
    Edge,
    FitViewOptions,
    MarkerType,
    Node,
    OnEdgesChange,
    OnNodesChange, Panel
} from 'reactflow';
import {BackgroundVariant} from "@reactflow/background";
import {FunctionWorkflow, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";
import dagre from 'dagre';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import NodeDataPanel from "@/components/workflowUI/dataPanel";

const edgeNodeSeparator = "###";
//Nodes Style modes
const styleFunctionNode = {
    background: 'rgb(220,234,246)'
}
const styleResourceNodeOut = {
    background: 'rgb(255,241,204)'
}
const styleResourceNodeIn = {
    background: 'rgb(225,239,216)'
}
const edgeEndResource = {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#826a2e'
}
const edgeEndFunction = {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#555555'
}
const edgeStyleResource = {
    strokeWidth: 1,
    stroke: '#826a2e',
}
const edgeStyleFunction = {
    strokeWidth: 1,
    stroke: '#555555',
}
const edgeStyleResourceStart = {
    strokeWidth: 1,
    stroke: '#58ad58',
}
const edgeStartResource = {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#58ad58'
}
const fitViewOptions: FitViewOptions = {
    padding: 0.5,
};
const nodeWidth = 172;
const nodeHeight = 36;

interface WorkFlowComponentProps {
    value: JsonFlowComponentState;
    readOnly?: boolean;
}

//Order nodes for display
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

        // We are shifting the dagre node position (anchor = center) to the top left
        // it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const Flow:React.FC<WorkFlowComponentProps> = ({value,readOnly}) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [loadPanel, setLoadPanel] = useState(false);
    const [selNode, setSelNode] = useState<FunctionWorkflow|ResourceWorkflow|null>(null);
    const [nodeColor, setNodeColor] = useState<string>(styleFunctionNode.background);

    useEffect(() => {
        //  Nodes To INIT Flow
        let initialNodes : Node[] = [], initialEdges: Edge[] = [], resourceEdges: Edge[] = [];

        value.functions.forEach(f => {
            let newNode: Node={
                id: f.name,
                position: { x: 0, y: 0 },
                data: { label: f.name },
                width: nodeWidth,
                height: nodeHeight,
                style: styleFunctionNode
            };

            for(let out in f.output_mapping){
                let newEdge: Edge={
                    id: "e_"+f.name+edgeNodeSeparator+f.output_mapping[out],
                    source: f.name,
                    target: f.output_mapping[out],
                    type: ConnectionLineType.Step,
                    markerEnd: edgeEndFunction,
                    style: edgeStyleFunction,
                };
                initialEdges.push(newEdge);
            }
            initialNodes.push(newNode);

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
                        id: "e_"+r.name+edgeNodeSeparator+r.output_mapping[out],
                        source: r.name,
                        target: r.output_mapping[out],
                        type: ConnectionLineType.Step,
                        markerEnd: edgeStartResource,
                        style: edgeStyleResourceStart
                    };
                    resourceEdges.push(newEdge);
                }
            }else{
                //  If resource node does not have new request, it's considered an ENDPOINT.
                newNode.style = styleResourceNodeOut;
                initialEdges.forEach(e =>{
                    const nodes = e.id.split(edgeNodeSeparator).slice(1);
                    if (nodes.includes(r.name)){
                        e.markerEnd = edgeEndResource;
                        e.style = edgeStyleResource;
                    }
                });
            }

            initialNodes.push(newNode);
        });//Create a node and an edge from each resource entry. Entry points nodes.

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges.concat(resourceEdges),
            'TB'
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setIsMounted(true);
    }, []);

    const getDataFromNode = (id: string):FunctionWorkflow|ResourceWorkflow|null => {

        let a = null;

        value.resources.forEach(r => {
            if(r.name.includes(id))
                a = r;
        });

        if (a != null) return a;

        value.functions.forEach(f=>{
            if (f.name.includes(id))
                a = f;
        });

        return a;
    };

    const handleClickNode = (event: any, nodeClicked: any) => {
        let node = getDataFromNode(nodeClicked.id)
        setSelNode(node);
        setNodeColor(nodeClicked.style.background);
        setLoadPanel(!loadPanel);
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
                connectionLineType={ConnectionLineType.Step}
                fitView
                fitViewOptions={fitViewOptions}
                nodesDraggable={!readOnly}
                nodesConnectable={!readOnly}
            >
                {loadPanel && selNode && <Panel className="m-0 h-max !important" position="top-right">
                    <Card>
                        <CardHeader  className={"rounded-md border-b-5 border-indigo-500"} style={{background: nodeColor}}>
                            <p className="font-sans text-xl font-medium text-center">{selNode.name}</p>
                        </CardHeader>
                        <CardContent>
                           <div style={{width: '20vw', height: '70vh'}}>
                               <NodeDataPanel node={selNode}/>
                           </div>
                        </CardContent>
                    </Card>
                </Panel>}
                <Controls showInteractive={false}/>
                <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
            </ReactFlow>
        </div>
    ) : null;
}

export default Flow;