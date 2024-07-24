import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FunctionWorkflowBasic, JsonFlowComponentState} from "@/types/workflows";
import {Input} from "@/components/ui/input";
import { getFunctionsSimilarId, getFunctionVersions} from "@/services/functionServices";
import {FunctionMinified} from "@/types/functions";

interface CUPanelProps{
    isResource: boolean,
    value: JsonFlowComponentState,
    onChange?: (value: object) => void,
    onClose?: () => void
}

const CreatePanel:React.FC<CUPanelProps> = ({isResource, value, onChange, onClose}) => {
    const [name ,setName] = useState("");
    const [classType, setClassType] = useState("");
    const [classSpecificationId , setClassSpecificationId] = useState("");
    const [classSpecificationVersion, setClassSpecificationVersion] = useState("");
    const [functions, setFunctions] = useState<FunctionMinified[] | []>([]);
    const [functionVersions, setFunctionVersions] = useState<string[]>([]);

    useEffect(() => {
        if(classSpecificationId.length>3){
            getFunctionsSimilarId(classSpecificationId)
                .then(functions => {
                    setFunctions(functions.items);
                })
                .catch(error => console.error(error));
        }else{
            setFunctions([]);
        }
    }, [classSpecificationId]);

    const handleSave = () => {
        if(!isResource && name !== undefined && classSpecificationId !== undefined && classSpecificationVersion !== ""){
            const newFunction:FunctionWorkflowBasic ={
                name: name,
                class_specification_id: classSpecificationId,
                class_specification_version: classSpecificationVersion,
                output_mapping: {},
                annotations: {}
            }
            value.functions.push(newFunction);
        }

        value.resources.forEach(r => {});
        if (onChange !== undefined) onChange(value);
        if (onClose !== undefined) onClose();
    }

    const setVersions = (id: string) => {
        functions.forEach(f => {
            if (f.id === id){
                getFunctionVersions(id).then(versions => {
                    setFunctionVersions(versions.versions);
                })
            }
        });
    }


    const getResource =
        <ol>I
            <li><b>Class Type</b>: <Input value={classType}
                                          onChange={e => {
                                              setClassType(e.target.value)
                                          }}/></li>
        </ol>;

    const getFunction =
        <ol>
            <li>
                <b>Class Id:</b>
                <div className="relative">
                    <Input value={classSpecificationId}
                           onChange={e => {
                               setClassSpecificationId(e.target.value);
                           }}/>
                    <select className="absolute top-2 right-1" onChange={e => {
                        setClassSpecificationId(e.target.value);
                        setVersions(e.target.value);
                    }}>
                        {functions.map(fun => (
                            <option key={fun.id}>{fun.id}</option>
                        ))}
                    </select>
                </div>
            </li>
            <li>
                <b>Class Version:</b><select className="ml-4" onChange={e => setClassSpecificationVersion(e.target.value)}>
                {functionVersions.map(ver => (
                    <option key={ver}>{ver}</option>
                ))}
                </select>
            </li>
        </ol>;

    return (
        <Card>
            <CardHeader className="rounded-md border-b-5 border-indigo-500 relative"
                        style={{background: 'rgb(220,234,246)'}}>
                <div className="grid grid-cols-3 gap-4">
                    <button type="button" className="absolute top-3 right-3" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                             stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <p className="font-sans text-xl font-medium text-center">Create {isResource ? "Resource" : "Function"}</p>
            </CardHeader>
            <CardContent>
                <div style={{width: '20vw', height: '40vh'}} className="flex flex-col mt-4">
                    <ol>
                        <li><label>NAME</label><Input type="text" value={name}
                                                      onChange={e => {setName(e.target.value)}}/></li>
                    </ol>
                    {isResource? getResource:getFunction}
                    <div className="h-full grid content-end justify-center">
                        <button
                            className="bg-green-500 hover:bg-green-400 text-white py-2 px-32 rounded"
                            onClick={handleSave}>Confirm
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-400 text-white mt-1 py-2 px-32 rounded"
                            onClick={onClose}>Cancel
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default CreatePanel;