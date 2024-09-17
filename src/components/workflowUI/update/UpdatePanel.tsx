import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FunctionWorkflow, FunctionWorkflowBasic, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";
import {Input} from "@/components/ui/input";
import {getFunctionVersions} from "@/services/functionServices";
import {Button} from "@/components/ui/button";
import UpdateFunction from "@/components/workflowUI/update/UpdateFunction";
import {AlertDialog} from "@/components/ui/alert-dialog";
import DialogSave from "@/components/utils/DialogSave";

interface UpdatePanelProps{
    node: FunctionWorkflow|ResourceWorkflow|FunctionWorkflowBasic,
    value: JsonFlowComponentState,
    onChange?: (value: object) => void,
    onClose?: () => void;
}

const UpdatePanel:React.FC<UpdatePanelProps> = ({node, value, onChange, onClose}) => {

    const [name, setName] = useState(node.name);
    const [funType, setClassFunType] = useState("");
    const [classIdV, setClassIdV] = useState("");
    const [classVersionV, setClassVersionV] = useState("");
    const [listFunctionVersions, setListFunctionVersions] = useState<string[]>([]);
    const [isResource, setIsResource] = useState(false);
    const [isBasicFunction, setIsBasicFunction] = useState(false);
    const [openAlert, isOpenAlert] = useState(false);


    useEffect(() => {
        const nodeFun = node as FunctionWorkflow;
        const nodeFunBasic = node as FunctionWorkflowBasic;

        //Gets node type and retrieves function versions from server
        if (nodeFun.class_specification !== undefined) {
            setIsResource(false);
            setIsBasicFunction(false);
            setClassFunType(nodeFun.class_specification.function_type);
            setClassVersionV(nodeFun.class_specification.version);
            setClassIdV(nodeFun.class_specification.id);
            getFunctionVersions(nodeFun.class_specification.id).then(versions => {setListFunctionVersions(versions.versions);});
        } else if (nodeFunBasic.class_specification_id !== undefined){
            setIsResource(false);
            setIsBasicFunction(true);
            setClassVersionV(nodeFunBasic.class_specification_version);
            setClassIdV(nodeFunBasic.class_specification_id);
            getFunctionVersions(nodeFunBasic.class_specification_id).then(versions => {setListFunctionVersions(versions.versions);});
        }else {
            setIsResource(true);
            setIsBasicFunction(false);
            setClassVersionV("");
            setClassIdV("");
        }
    }, [node]);

    const handleSave = () => {
        let nameRep = false;
        if (name != node.name){
            value.functions.forEach(f => {
                if(name === f.name) nameRep = true;
            });
            value.resources.forEach(r => {
                if(name === r.name) nameRep = true;
            });
        }

        if (!nameRep){
            isOpenAlert(false);
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
                    if (f.output_mapping)
                        Object.keys(f.output_mapping).forEach(k => {
                            if(f.output_mapping[k] === node.name) f.output_mapping[k] = name;
                        });
                }
            });
            value.resources.forEach(r => {  //Save data from resource if modified
                if(r.name === node.name){
                    r.name = name;
                }
            });
            if (onChange !== undefined) onChange(value);
        }else {
            isOpenAlert(true);
        }
    }

    return (
        <div className="absolute top-0 left-0">
            <Card>
                <CardHeader className={"rounded-md border-b-5 border-indigo-500"}
                            style={{background: 'rgb(220,234,246)'}}>
                    <p className="font-sans text-xl font-medium text-center">Edit &apos;{name}&apos;</p>
                </CardHeader>
                <CardContent className="h-80">
                    <div className="flex flex-col w-80 h-full mt-4 overflow-y-auto">
                        <div className="mx-1">
                            <label><b>NAME</b></label><Input value={name}
                                                    onChange={e => setName(e.target.value)}/>
                            {!isResource &&
                                <UpdateFunction funType={funType} setClassFunType={setClassFunType} classIdV={classIdV}
                                                classVersionV={classVersionV} setClassVersionV={setClassVersionV}
                                                listFunctionVersions={listFunctionVersions} complex={!isBasicFunction} />}
                        </div>
                        <div className="h-full grid grid-cols-2 gap-2 content-end justify-center">
                            <Button
                                type="button"
                                className="py-2 px-4 rounded"
                                variant="outline"
                                onClick={onClose}>Cancel
                            </Button>
                            <Button
                                type="button"
                                className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color text-white py-2 px-4 rounded"
                                onClick={handleSave}>Save
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <DialogSave isOpen={openAlert} title={"Name error"} description={"This name is already in use"} isLoading={false} onClose={()=>isOpenAlert(false)}/>
        </div>
    );
}

export default UpdatePanel;