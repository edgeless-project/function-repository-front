import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    addEdge,
    MarkerType,
    Edge,
    Node,
    OnConnect,
    OnNodesChange,
    applyNodeChanges,
    OnEdgesChange,
    applyEdgeChanges,
    FitViewOptions,
    Connection
} from 'reactflow';
import {BackgroundVariant} from "@reactflow/background";

//Nodes Style modes
let styleResourceNode = {
    background: 'rgba(217,90,109,0.78)'
}

//DEMO data file
let dummyFile = {
    "name": "Dummy",
    "functions": [
        {
            "name": "hello-world",
            "class_specification_id": "hello-node",
            "class_specification_version": "0.1",
            "output_mapping": {
                "next-step": "Bye-apple"
            },
            "annotations": {}
        },
        {
            "name": "Bye-apple",
            "class_specification_id": "goodbye-node",
            "class_specification_version": "0.1",
            "output_mapping": {
                "next-step": "End"
            },
            "annotations": {}
        }
    ],
    "resources": [
        {
            "name": "Start",
            "class_type": "",
            "output_mapping": {
                "new_request": "hello-world"
            },
            "configurations": {
                "host": "localhost",
                "methods": "POST"
            }
        },
        {
            "name": "End",
            "class_type": "",
            "output_mapping": {},
            "configurations": {}
        }
    ],
    "annotations": {}
};

const fitViewOptions: FitViewOptions = {
    padding: 0.05,
};

interface JsonFlowComponentProps {
    value: JsonFlowComponentState;
    // onChange?: (value: object) => void;
    // onError?: (hasError: boolean) => void;
    readOnly?: boolean;
}

interface JsonFlowComponentState {
    name: string | any,
    functions: ({
        name: string,
        class_specification_id: string,
        class_specification_version: string,
        output_mapping: {
            "next-step": string
        } | any,
        annotations: {} | any,
    } | any)[],
    resources: ({
        name: string,
        class_type: string,
        output_mapping: {
            new_request: string
        } | any,
        configurations: {

        }
    }|any)[],
    annotations: {}
}

const Flow:React.FC<JsonFlowComponentProps> = ({value,readOnly}) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isInteractive, setIsInteractive] = useState(false);  //  Allow user interact with nodes
    const [jsonFile, setFile] = useState<JsonFlowComponentState>(dummyFile);

    useEffect(() => {
        if(value){
            console.log("Hi apple");
            value.name = "Passage";
            setFile(value);
        }

        console.log(value, 'vs', jsonFile);

        let initialNodes : Node[] = [], initialEdges: Edge[] = []; //  Nodes To INIT Flow
        let i = 2, e_n = 0,o_n = 0, space = 100; // Nodes idxs IDs and Position

        jsonFile.functions.forEach(f => {
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
        jsonFile.resources.forEach(r => {

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

        setNodes(initialNodes);
        setEdges(initialEdges);
        setIsMounted(true);
    }, []);

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
        <div style={{width: '80vw', height: '80vh'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onClickNode}
                fitView
                fitViewOptions={fitViewOptions}
                nodesDraggable={isInteractive}
                nodesConnectable={isInteractive}
            >
                <Controls/>
                <MiniMap/>
                <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
            </ReactFlow>
        </div>
    ) : null;
}

export default Flow;