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
import {FunctionWorkflow, FunctionWorkflowBasic, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";
import dagre from 'dagre';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import NodeDataPanel from "@/components/workflowUI/NodeDataPanel";
import CUPanel from "@/components/workflowUI/CUPanel";
import {EdgeRemoveChange, NodeRemoveChange} from "@reactflow/core";

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
    onChange?: (value: object) => void;
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

const Flow:React.FC<WorkFlowComponentProps> = ({value,readOnly, onChange}) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [loadPanel, isLoadPanel] = useState(false);
    const [selNode, setSelNode] = useState<FunctionWorkflow|ResourceWorkflow|FunctionWorkflowBasic|null>(null);
    const [nodeColor, setNodeColor] = useState<string>(styleFunctionNode.background);
    const [editNode, isEditNode] = useState(false);

    const renderNodeFromData = useCallback(() => {
        //  Nodes To INIT Flow
        let initialNodes : Node[] = [], initialEdges: Edge[] = [], resourceEdges: Edge[] = [];

        value.functions.forEach(f => {//Create a node and an edge from each function entry, normal nodes
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
                    id: "e"+edgeNodeSeparator+f.name+edgeNodeSeparator+f.output_mapping[out],
                    source: f.name,
                    target: f.output_mapping[out],
                    type: ConnectionLineType.Step,
                    markerEnd: edgeEndFunction,
                    style: edgeStyleFunction,
                };
                initialEdges.push(newEdge);
            }
            initialNodes.push(newNode);

        });
        value.resources.forEach(r => {  //Create a node and an edge from each resource entry. Entry points nodes.

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
                        id: "e"+edgeNodeSeparator+r.name+edgeNodeSeparator+r.output_mapping[out],
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
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges.concat(resourceEdges),
            'TB'
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    },[value.functions, value.resources]);

    useEffect(() => {
        renderNodeFromData();
        setIsMounted(true);
    }, [renderNodeFromData, value.functions, value.resources]);


    const getDataFromNode = (id: string):FunctionWorkflow|ResourceWorkflow|FunctionWorkflowBasic => {

        let a = null;
        value.resources.forEach(r => {
            if(r.name === id)
                a = r;
        });
        if (a != null) return a;
        value.functions.forEach(f=>{
            if (f.name === id)
                a = f;
        });
        if (a != null) return a;
        return null as unknown as FunctionWorkflow;
    };

    const deleteNodeData = (name: string) => {  //Delete node data from JSON
        value.functions = value.functions.filter(nod => {
            return name != nod.name});
        value.resources = value.resources.filter(nod => {
            return name != nod.name});
        setSelNode(null);
        setNodes((els)=>els.filter((node)=>node.id !== selNode?.name));
    }

    const handleEdit = () => {
        isLoadPanel(false);
        isEditNode(true);
    };

    const handleDeleteNode = () =>{
        isLoadPanel(false);
        isEditNode(false);
        if(selNode != null) deleteNodeData(selNode.name);
    };

    const handleEditNode = (value: object) => {
        if (onChange) {
            onChange(value);
        }
        setSelNode(null);
        isLoadPanel(false);
        renderNodeFromData();
    };

    const handleClickNode = (event: any, nodeClicked: any) => { //Function to execute on node click
        let node = getDataFromNode(nodeClicked.id);
        setNodeColor(nodeClicked.style.background);
        setSelNode(node);
        isEditNode(false);
        if(node.name === selNode?.name) isLoadPanel(!loadPanel);
    };
    
    const handleConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const handleNodesChange: OnNodesChange = useCallback(
        (changes) => {
            setNodes((nodes) => applyNodeChanges(changes, nodes));  //Load graphic changes
            let delNodes : string[]=[];
            changes.forEach(ch =>{  //Classify changes by type
                if(ch.type === "remove"){
                    const nod = ch as NodeRemoveChange;
                    delNodes.push(nod.id);
                }
            });
            if(delNodes.length>0){  //Delete Nodes from json data
                delNodes.forEach( n => deleteNodeData(n));
            }
        },
        [setNodes]
    );

    const handleEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));  //Load graphic changes

            let delEdge : string[]=[];
            changes.forEach(ch =>{  //Classify changes by type
                if(ch.type === "remove"){
                    const nod = ch as EdgeRemoveChange;
                    delEdge.push(nod.id);
                }
            });
        },
        [setEdges]
    );

    const proOptions = { hideAttribution: true };   //Hide attribution or watermark from grid

    return isMounted ? (
        <div className="relative" style={{width: '80vw', height: '80vh'}}>
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
                connectOnClick={!readOnly}
                deleteKeyCode={readOnly?null:"Backspace"}
                proOptions={proOptions}
                disableKeyboardA11y={readOnly}
            >
                {loadPanel && selNode && <Panel className="m-0 h-max !important" position="top-right">
                    <Card>
                        <CardHeader  className={"rounded-md border-b-5 border-indigo-500"} style={{background: nodeColor}}>
                            <p className="font-sans text-xl font-medium text-center">{selNode.name}</p>
                        </CardHeader>
                        <CardContent>
                            <div style={{width: '20vw', height: '70vh'}} className="flex flex-col">
                                <NodeDataPanel node={selNode} readOnly={readOnly ? readOnly : false}/>
                                <div className="h-full grid content-end">
                                    <div className="flex justify-center">
                                        {!readOnly && <div className="grid grid-cols-1">
                                            <button
                                                className="bg-green-500 hover:bg-green-400 text-white py-2 px-32 rounded"
                                                onClick={handleEdit}>Edit
                                            </button>
                                            <button
                                                className="bg-red-600 hover:bg-red-500 text-white py-2 px-32 rounded"
                                                onClick={handleDeleteNode}>Delete
                                            </button>
                                        </div>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Panel>}
                <Controls showInteractive={false}/>
                <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
            </ReactFlow>
            {!loadPanel && editNode && selNode && !readOnly &&
                <CUPanel node={getDataFromNode(selNode.name)} value={value} onChange={handleEditNode} />}
        </div>
    ) : null;
}

export default Flow;