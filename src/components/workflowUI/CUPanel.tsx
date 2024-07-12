import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FunctionWorkflow, FunctionWorkflowBasic, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";

interface CUPanelProps{
    node: FunctionWorkflow|ResourceWorkflow|FunctionWorkflowBasic,
    value: JsonFlowComponentState,
    onChange?: (value: object) => void;
}

const CUPanel:React.FC<CUPanelProps> = ({node, value, onChange}) => {

    const [name, setName] = useState(node.name);
    const [funType, setClassFunType] = useState("");
    const [classIdV, setClassIdV] = useState("");
    const [classVersionV, setClassVersionV] = useState("");

    useEffect(() => {
        const nodeFun = node as FunctionWorkflow;
        const nodeFunBasic = node as FunctionWorkflowBasic;

        if (nodeFun.class_specification != undefined) {
            setClassFunType(nodeFun.class_specification.function_type);
            setClassVersionV(nodeFun.class_specification.version);
            setClassIdV(nodeFun.class_specification.id);
        } else {
            setClassVersionV(nodeFunBasic.class_specification_version);
            setClassIdV(nodeFunBasic.class_specification_id);
        }
    }, [node]);

    const handleSave = () => {
        value.functions.forEach(f => {
            if(f.name == node.name){
                if("class_specification_version" in f){
                    if (classVersionV != "")  f.class_specification_version = classVersionV;
                    if (classIdV != "") f.class_specification_id = classIdV;
                    f.name = name;
                }else if("class_specification" in f){
                    if (classVersionV != "")  f.output_mapping.version = classVersionV;
                    if (classIdV != "") f.output_mapping.id = classIdV;
                    if (funType != "") f.output_mapping.type = funType;
                    f.name = name;
                }
            }
        })
        if (onChange != undefined) onChange(value);
    }

    const divComplex = ((node as FunctionWorkflow).class_specification != undefined)?
        <li><b>Function Type</b>:
            <input value={funType}
                   onChange={e =>
                       setClassFunType(e.target.value)}/>
        </li>:"";

    return (
        <div className="absolute top-0 left-0">
            <Card>
                <CardHeader className={"rounded-md border-b-5 border-indigo-500"}
                            style={{background: 'rgb(220,234,246)'}}>
                    <p className="font-sans text-xl font-medium text-center">Title</p>
                </CardHeader>
                <CardContent>
                    <div style={{width: '20vw', height: '30vh'}} className="flex flex-col mt-4">
                        <ol>
                            <li><b>NAME</b>: <input value={name}
                                                    onChange={e => setName(e.target.value)}/></li>
                            <li><b>ID</b>: <input value={classIdV}
                                                  onChange={e => setClassIdV(e.target.value)}/></li>
                            <li><b>Version</b>: <input value={classVersionV}
                                                       onChange={e => setClassVersionV(e.target.value)}/></li>
                            {divComplex}
                        </ol>
                        <div className="h-full grid content-end justify-center">
                            <button
                                className="bg-green-500 hover:bg-green-400 text-white py-2 px-32 rounded"
                                onClick={handleSave}>Save
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default CUPanel;