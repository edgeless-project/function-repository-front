import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FunctionWorkflow, FunctionWorkflowBasic, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";
import {Input} from "@/components/ui/input";
import {getFunctionVersions} from "@/services/functionServices";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";

interface CUPanelProps{
    node: FunctionWorkflow|ResourceWorkflow|FunctionWorkflowBasic,
    value: JsonFlowComponentState,
    onChange?: (value: object) => void,
    onClose?: () => void;
}

const UpdatePanel:React.FC<CUPanelProps> = ({node, value, onChange, onClose}) => {

    const [name, setName] = useState(node.name);
    const [funType, setClassFunType] = useState("");
    const [classIdV, setClassIdV] = useState("");
    const [classVersionV, setClassVersionV] = useState("");
    const [listFunctionVersions, setListFunctionVersions] = useState<string[]>([]);

    useEffect(() => {
        const nodeFun = node as FunctionWorkflow;
        const nodeFunBasic = node as FunctionWorkflowBasic;

        if (nodeFun.class_specification !== undefined) {
            setClassFunType(nodeFun.class_specification.function_type);
            setClassVersionV(nodeFun.class_specification.version);
            setClassIdV(nodeFun.class_specification.id);
        } else {
            setClassVersionV(nodeFunBasic.class_specification_version);
            setClassIdV(nodeFunBasic.class_specification_id);
        }

        getFunctionVersions(classIdV).then(versions => {
            setListFunctionVersions(versions.versions);
        })
        
    }, [classIdV, node]);

    const handleSave = () => {
        value.functions.forEach(f => {  //Save data from each function if modified
            if(f.name === node.name){
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
            }else{
                Object.keys(f.output_mapping).forEach(k => {
                    if(f.output_mapping[k] === node.name) f.output_mapping[k] = name;
                });
            }
        })

        value.resources.forEach(r => {  //Save data from resource if modified
           if(r.name === node.name){
               r.name = name;
           }
        });
        if (onChange !== undefined) onChange(value);
    }

    const divComplex =
        <li><label><b>Function Type</b></label>
            <Input value={funType} className="mt-2 mb-4"
                   onChange={e =>
                       setClassFunType(e.target.value)}/>
        </li>;

    const divFunctionBasic =
        <li>
            <li><br/><b>Class Specification ID</b>
                <Input className="mt-2 mb-4" value={classIdV} disabled={true}></Input></li>
            <li><label><b>Class Specification Version</b></label>
                <br/>
                <div className="my-2">
                    <Select onValueChange={v => setClassVersionV(v)} defaultValue={classVersionV}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a version" />
                        </SelectTrigger>
                        <SelectContent>
                            {listFunctionVersions && listFunctionVersions.map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </li>

            {((node as FunctionWorkflow).class_specification != undefined) ? divComplex : ""}
        </li>

    return (
        <div className="absolute top-0 left-0">
            <Card>
                <CardHeader className={"rounded-md border-b-5 border-indigo-500"}
                            style={{background: 'rgb(220,234,246)'}}>
                    <p className="font-sans text-xl font-medium text-center">Edit &apos;{name}&apos;</p>
                </CardHeader>
                <CardContent className="h-80">
                    <div className="flex flex-col w-80 h-full mt-4 overflow-y-auto">
                        <ol className="mx-1">
                            <li><label><b>NAME</b></label><Input value={name}
                                                    onChange={e => setName(e.target.value)}/></li>
                            {(node as ResourceWorkflow).class_type === undefined? divFunctionBasic: ""}
                        </ol>
                        <div className="h-full grid grid-cols-2 gap-2 content-end justify-center">
                            <Button
                                className="py-2 px-4 rounded"
                                variant="outline"
                                onClick={onClose}>Cancel
                            </Button>
                            <Button
                                className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color text-white py-2 px-4 rounded"
                                onClick={handleSave}>Save
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default UpdatePanel;