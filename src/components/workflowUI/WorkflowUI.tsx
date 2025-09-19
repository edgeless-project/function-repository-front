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
	OnNodesChange,
	Panel
} from 'reactflow';
import {BackgroundVariant} from "@reactflow/background";
import {FunctionWorkflow, FunctionWorkflowBasic, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";
import dagre from 'dagre';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import NodeDataPanel from "@/components/workflowUI/dataPanels/NodeDataPanel";
import UpdatePanel from "@/components/workflowUI/update/UpdatePanel";
import {EdgeRemoveChange, NodeRemoveChange} from "@reactflow/core";
import DialogInput from '@/components/utils/DialogInput';
import {getFunction} from "@/services/functionServices";
import {Button} from "@/components/ui/button";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";

const outputResources: string[] = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES_OUTPUT as string).split(",");
const inputResources: string[] = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES_INPUT as string).split(",");
const resources = outputResources.concat(inputResources);
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
const defaultEdgeOptions = {
	style: edgeStyleFunction,
	type: 'step',
	markerEnd: edgeEndFunction,
};

const nodeWidth = 172;
const nodeHeight = 36;

interface createBranch {
	source: string,
	target: string;
	fromFunction: boolean;
	options?: string[];
}

interface WorkFlowComponentProps {
	value: JsonFlowComponentState;
	onChange?: (value: object) => void;
	readOnly?: boolean;
	reload?: boolean;
}

//Order nodes for display
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
	// Top-Bottom('TB') or Left-Right('LR')
	const isHorizontal = direction === 'LR';
	dagreGraph.setGraph({rankdir: direction});

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, {width: nodeWidth, height: nodeHeight});
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

	return {nodes, edges};
};


const Flow: React.FC<WorkFlowComponentProps> = ({value, readOnly, onChange, reload}) => {
	const tokenValue = useSelector(selectSessionAccessToken);
	const [nodes, setNodes] = useState<Node[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);
	const [isMounted, setIsMounted] = useState(false);
	const [loadPanel, isLoadPanel] = useState(false);
	const [selNode, setSelNode] = useState<FunctionWorkflow | ResourceWorkflow | FunctionWorkflowBasic | null>(null);
	const [nodeColor, setNodeColor] = useState<string>(styleFunctionNode.background);
	const [editNode, isEditNode] = useState(false);
	const [isOpen, setOpen] = useState(false);
	const [descConnection, setDescConnection] = useState("");
	const [titleConnection, setTitleConnection] = useState("New Connection");
	const [newBranch, setNewBranch] = useState<createBranch>();

	const renderNodeFromData = useCallback(() => {
		//  Nodes To INIT Flow
		let initialNodes: Node[] = [], initialEdges: Edge[] = [], resourceEdges: Edge[] = [];

		value.functions.forEach(f => {//Create a node and an edge from each function entry, normal nodes
			let newNode: Node = {
				id: f.name,
				position: {x: 0, y: 0},
				data: {label: f.name},
				width: nodeWidth,
				height: nodeHeight,
				style: styleFunctionNode
			};

			for (let out in f.output_mapping) {
				let newEdge: Edge = {
					id: "e" + edgeNodeSeparator + f.name + edgeNodeSeparator + f.output_mapping[out],
					source: f.name,
					target: f.output_mapping[out],
					type: ConnectionLineType.Step,
					markerEnd: edgeEndFunction,
					style: edgeStyleFunction,
					label: out,
				};
				initialEdges.push(newEdge);
			}
			initialNodes.push(newNode);

		});
		value.resources.forEach(r => {  //Create a node and an edge from each resource entry. Entry points nodes.

			let newNode: Node = {
				id: r.name,
				position: {
					x: 0,
					y: 0
				},
				data: {label: r.name},
				style: styleResourceNodeOut,
				width: nodeWidth,
				height: nodeHeight
			};

			if (r.output_mapping && (Object.keys(r.output_mapping).length !== 0 || outputResources.includes(r.class_type))) {// If element has output keys or is output node, color an input resource.
				newNode.style = styleResourceNodeIn;
				for (let out in r.output_mapping) {
					const newEdge: Edge = {
						id: "e" + edgeNodeSeparator + r.name + edgeNodeSeparator + r.output_mapping[out],
						source: r.name,
						target: r.output_mapping[out],
						type: ConnectionLineType.Step,
						markerEnd: edgeStartResource,
						style: edgeStyleResourceStart,
						label: out
					};
					resourceEdges.push(newEdge);
				}
			}else {
				//  If resource node does not have new request, it's considered an ENDPOINT.
				initialEdges.forEach(e => {
					const nodes = e.id.split(edgeNodeSeparator).slice(1);
					if (nodes.includes(r.name)) {
						e.markerEnd = edgeEndResource;
						e.style = edgeStyleResource;
					}
				});
			}
			initialNodes.push(newNode);
		});

		const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedElements(
			initialNodes,
			initialEdges.concat(resourceEdges),
			'TB'
		);

		setNodes(layoutedNodes);
		setEdges(layoutedEdges);
	}, [value.functions, value.resources]);

	useEffect(() => {
		renderNodeFromData();
		setIsMounted(true);
	}, [renderNodeFromData, reload]);

	const addOutputMapping = (mapping: string, sourceName: string, targetName: string, isFunction: boolean) => {

		if (isFunction) value.functions.forEach(f => {
			if (f.name === sourceName && !f.output_mapping[mapping]) f.output_mapping[mapping] = targetName;
		});
		else value.resources.forEach(r => {
			if (outputResources.includes(r.class_type) && r.name === sourceName && !r.output_mapping[mapping])
				r.output_mapping["output_"+targetName] = targetName;
		});
		renderNodeFromData();
	};

	const getDataFromNode = (id: string): FunctionWorkflow | ResourceWorkflow | FunctionWorkflowBasic => {

		let a = null;
		value.resources.forEach(r => {
			if (r.name === id)
				a = r;
		});
		if (a != null) return a;
		value.functions.forEach(f => {
			if (f.name === id)
				a = f;
		});
		if (a != null) return a;
		return null as unknown as FunctionWorkflow;
	};

	const deleteNodeData = (name: string) => {  //Delete node data from JSON
		value.functions = value.functions.filter(nod => {
			return name != nod.name
		});
		value.resources = value.resources.filter(nod => {
			return name != nod.name
		});
		setSelNode(null);
		setNodes((els) => els.filter((node) => node.id !== selNode?.name));
	};

	const handleEdit = () => {
		isLoadPanel(false);
		isEditNode(true);
	};

	const handleDeleteNode = () => {
		isLoadPanel(false);
		isEditNode(false);

		if (selNode != null) {
			deleteNodeData(selNode.name);
			value.functions.forEach(f => {
				for (let key in f.output_mapping)
					if (f.output_mapping[key] === selNode.name)
						delete f.output_mapping[key];
			});
			value.resources.forEach(r => {
				for (let key in r.output_mapping)
					if (r.output_mapping[key] === selNode.name)
						delete r.output_mapping[key];
			});
		}
	};

	const handleEditJSON = (value: object) => {
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
		if (node.name === selNode?.name) isLoadPanel(!loadPanel);
	};

	const handleOnClose = () => {
		setOpen(false);
		renderNodeFromData();
	};

	const handleCloseEditNode = () => {
		isEditNode(false);
	};

	const handlePanelClose = () => {
		isLoadPanel(false);
		setSelNode(null);
	};

	const handleConnect = useCallback(
		(params: Connection | Edge) => {
			setEdges((eds) => addEdge(params, eds));
			if (params.source && params.target) {
				for(let r of value.resources){
					if (r.name === params.source){
						if (outputResources.includes(r.class_type)) {
							setNewBranch({source: params.source as string, target: params.target as string, fromFunction: false, options: ["output_"+(params.target as string)]});
							setTitleConnection("New Connection");
							setDescConnection("Define output mapping:");
							setOpen(true);
						}else{
							setNewBranch({source: params.source as string, target: params.target as string, fromFunction: false, options: []});
							setTitleConnection("Connexion Error");
							setDescConnection("Resource node "+r.name+": Type "+r.class_type+" does not allow output connections.");
							setOpen(true);
						}
						return;
					}else if (r.name === params.target){
						if(outputResources.includes(r.class_type)){
							setNewBranch({source: params.source as string, target: params.target as string, fromFunction: false, options: []});
							setTitleConnection("Connexion Error");
							setDescConnection("Resource node "+r.name+": Type "+r.class_type+" does not allow for input connections.");
							setOpen(true);
							return;
						}
					}
				}
				for (const f of value.functions) {
					if (f.name === params.source) {
						if ((f as FunctionWorkflowBasic).class_specification_id){
							const f_b = f as FunctionWorkflowBasic;
							getFunction(f_b.class_specification_id,f_b.class_specification_version, tokenValue).then(d => {
								let options: string[] = [];
								if (f_b.output_mapping) d.outputs.forEach((v) =>{if (!f_b.output_mapping[v]) options.push(v)});
								else {
									f_b.output_mapping = {};
									options = options.concat(d.outputs);
								}
								setNewBranch({source: params.source as string, target: params.target as string, fromFunction: true,options: options});
								if(options.length>0){
									setDescConnection("Define output mapping:");
									setTitleConnection("New Connection");
								} else {
									setDescConnection("Function node "+f.name+": Function class specification id "+f_b.class_specification_id+" does not have output connexions available");
									setTitleConnection("Connexion Error");
								}
								setOpen(true);
							}).catch(() => {
								setNewBranch({source: params.source as string, target: params.target as string, fromFunction: true,options: []});
								setDescConnection("Could not retrieve function data from "+f.name+".");
								setTitleConnection("Connexion Error");
								setOpen(true);
							});

						}else if((f as FunctionWorkflow).class_specification){
							const f_c = f as FunctionWorkflow;
							let options: string[] = [];
							f_c.class_specification.outputs.forEach((v) =>{if (!f_c.output_mapping[v]) options.push(v)});
							setNewBranch({source: params.source as string, target: params.target as string, fromFunction:true, options: options});
							if(options.length>0){
								setDescConnection("Define output mapping:");
								setTitleConnection("New Connection");
							}else {
								setDescConnection("Function node "+f.name+": Function class specification id "+f_c.class_specification.id+" does not have output connexions available");
								setTitleConnection("Connexion Error");
							}
							setOpen(true);
						}
						return;
					}
				}
			}
		},
		[setEdges]
	);

	const handleNodesChange: OnNodesChange = useCallback(
		(changes) => {
			setNodes((nodes) => applyNodeChanges(changes, nodes));  //Load graphic changes
			let delNodes: string[] = [];
			changes.forEach(ch => {  //Classify changes by type
				if (ch.type === "remove") {
					const nod = ch as NodeRemoveChange;
					delNodes.push(nod.id);
				}
			});
			if (delNodes.length > 0) {  //Delete Nodes from json data
				delNodes.forEach(n => deleteNodeData(n));
			}
		},
		[setNodes]
	);

	const handleEdgesChange: OnEdgesChange = useCallback(
		(changes) => {
			setEdges((eds) => applyEdgeChanges(changes, eds));  //Load graphic changes
			changes.forEach(ch => {  //Classify changes by type
				if (ch.type === "remove") {
					const e = ch as EdgeRemoveChange;
					const node = e.id.split(edgeNodeSeparator);
					value.functions.forEach(f => {
						if (node.length > 2 && f.name === node[1])
							for (let key in f.output_mapping)
								if (f.output_mapping[key] === node[2])
									delete f.output_mapping[key];
					});
					value.resources.forEach(r => {
						if (node.length > 2 && r.name === node[1])
							for (let key in r.output_mapping)
								if (r.output_mapping[key] === node[2])
									delete r.output_mapping[key];
					});
				}
			});
		},
		[setEdges]
	);

	const proOptions = {hideAttribution: true};   //Hide attribution or watermark from grid

	return isMounted ? (
		<div className="relative h-[47.5rem]">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={handleNodesChange}
				onEdgesChange={handleEdgesChange}
				onConnect={handleConnect}
				onNodeClick={handleClickNode}
				connectionLineType={ConnectionLineType.Step}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				fitViewOptions={fitViewOptions}
				nodesDraggable={!readOnly}
				nodesConnectable={!readOnly}
				connectOnClick={!readOnly}
				deleteKeyCode={readOnly ? null : "Backspace"}
				proOptions={proOptions}
				disableKeyboardA11y={readOnly}
			>
				{loadPanel && selNode && <Panel className="m-0 h-max !important" position="top-right">
					<Card>
						<CardHeader className="rounded-md border-b-5 border-indigo-500 relative"
						            style={{background: nodeColor}}>
							<button type="button" className="absolute top-3 right-3" onClick={handlePanelClose}>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
								     strokeWidth="1.5"
								     stroke="currentColor" className="size-6">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
								</svg>
							</button>
							<p className="font-sans text-xl font-medium text-center">{selNode.name}</p>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col w-80 h-[40.75rem] overflow-y-auto">
								<NodeDataPanel node={selNode} readOnly={readOnly ? readOnly : false}/>
								<div className="h-full grid content-end">
									<div className="flex justify-center">
										{!readOnly && <div className="grid grid-cols-1">
											<Button
												data-id={'btn-edit-node'}
												type="button"
												className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color text-white py-2 w-72 rounded"
												onClick={handleEdit}>Edit
											</Button>
											<Button
												data-id={'btn-delete-node'}
												type="button"
												className="bg-red-600 hover:bg-red-500 text-white mt-1 py-2 w-72 rounded"
												onClick={handleDeleteNode}>Delete
											</Button>
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
				<UpdatePanel node={getDataFromNode(selNode.name)} value={value} onChange={handleEditJSON}
				             onClose={handleCloseEditNode}/>}

			<DialogInput
				isOpen={isOpen}
				title={titleConnection}
				description={descConnection}
				isLoading={!isMounted}
				options={newBranch?.options}
				onConfirm={(input: string) => newBranch && addOutputMapping(input, newBranch.source, newBranch.target, newBranch.fromFunction)}
				onClose={handleOnClose}
			/>
		</div>
	) : null;
}

export default Flow;