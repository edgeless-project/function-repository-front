import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
    Edge,
    Node,
    OnConnect,
    OnNodesChange,
    applyNodeChanges,
    OnEdgesChange,
    applyEdgeChanges,
    FitViewOptions, Connection
} from 'reactflow';
import {BackgroundVariant} from "@reactflow/background";

//Nodes Style modes
let styleResourceNode = {
    background: 'rgba(217,90,109,0.78)'
}

//DEMO data file
const fileData = {
    "name": "health-care-uc",
    "functions": [
        {
            "name": "data-parsing",
            "class_specification_id": "data-parser",
            "class_specification_version": "0.1",
            "output_mapping": {
                "next-step": "ml-preprocessing"
            },
            "annotations": {}
        },
        {
            "name": "ml-preprocessing",
            "class_specification_id": "ml-preprocessor",
            "class_specification_version": "0.1",
            "output_mapping": {
                "next-step": "state-management"
            },
            "annotations": {}
        },
        {
            "name": "state-management",
            "class_specification_id": "state-manager",
            "class_specification_version": "0.1",
            "output_mapping": {
                "next-step": "http-egress"
            },
            "annotations": {}
        }
    ],
    "resources": [
        {
            "name": "http-ingress",
            "class_type": "http-ingress",
            "output_mapping": {
                "new_request": "data-parsing"
            },
            "configurations": {
                "host": "localhost",
                "methods": "POST"
            }
        },
        {
            "name": "http-egress",
            "class_type": "http-egress",
            "output_mapping": {},
            "configurations": {}
        }
    ],
    "annotations": {}
};


let initialNodes : Node[] = [], initialEdges: Edge[] = []; //  Nodes To INIT Flow
let i = 2, e_n = 0,o_n = 0, space = 100; // Nodes idxs IDs and Position
let interactive = true; //  Allow user interact with nodes

fileData.functions.forEach(f => {
    let newNode: Node={
        id: f.name,
        position: { x: 2*space, y: i*space },
        data: { label: f.name }
    };

    let newEdge: Edge={
        id: "e_"+f.name+"_"+f.output_mapping["next-step"],
        source: f.name,
        target: f.output_mapping["next-step"],
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#000000'
        },
        style: {
            strokeWidth: 2,
            stroke: '#000000',
        }
    };

    initialNodes.push(newNode);
    initialEdges.push(newEdge);
    i++;
});//Create a node and an edge from each function entry, normal nodes
fileData.resources.forEach(r => {

    let newNode: Node ={
        id: r.name,
        position: {
            x: 0,
            y: 0
        },
        data: { label: r.name },
        style: styleResourceNode
    };

    if (r.output_mapping["new_request"]){
        newNode.position = {x: 0, y: e_n*space};
        e_n++;
    }else{
        newNode.position = {x: 4*space, y: i*space + o_n*space};
        o_n++;
    }

    let newEdge: Edge={
        id: "e_"+r.name+"_"+r.output_mapping["new_request"],
        source: r.name,
        target: r.output_mapping["new_request"]? r.output_mapping["new_request"]: "",
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#ff0000'
        },
        style: {
            strokeWidth: 2,
            stroke: '#ff0000',
        }
    };

    initialNodes.push(newNode);
    initialEdges.push(newEdge);
    i++;
});//Create a node and an edge from each resource entry. Entry points nodes.

const fitViewOptions: FitViewOptions = {
    padding: 0.05,
};

const initialNodes1: Node[] = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Node 1' },
        position: { x: 250, y: 5 },
    },
    {
        id: '2',
        data: { label: 'Node 2' },
        position: { x: 100, y: 100 },
    },
    {
        id: '3',
        data: { label: 'Node 3' },
        position: { x: 400, y: 100 },
    }
];

const initialEdges1: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
];

interface JsonFlowComponentProps {
}

const Flow:React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>(initialNodes1);
    const [edges, setEdges] = useState<Edge[]>(initialEdges1);
    const reactRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && reactRef.current) {
            console.log('Its mounted!');

        }
    }, [isMounted]);

    const onClickNode = (event: any, nodeClicked: any) => {
        console.log(nodeClicked);
    }; //Function to execute on node click

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    return isMounted ? (
        <div ref={reactRef} style={{width: '80vw', height: '90vh'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onClickNode}
                fitView
                fitViewOptions={fitViewOptions}
                nodesDraggable={interactive}
                nodesConnectable={interactive}
            >
                <Controls/>
                <MiniMap/>
                <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
            </ReactFlow>
        </div>
    ) : null;
}

export default Flow;