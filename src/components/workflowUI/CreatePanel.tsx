import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FunctionWorkflowBasic, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";
import {Input} from "@/components/ui/input";
import {getFunctionsSimilarId, getFunctionVersions} from "@/services/functionServices";
import {FunctionMinified} from "@/types/functions";
const stringClassType: string = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES as string);

interface CUPanelProps{
    isResource: boolean,
    value: JsonFlowComponentState,
    onChange?: (value: object) => void,
    onClose?: () => void;
}

const CreatePanel:React.FC<CUPanelProps> = ({isResource, value, onChange, onClose}) => {
    const [name ,setName] = useState("");
    const [classType, setClassType] = useState("");
    const [listClassType, setListClassType] = useState(stringClassType.split(","));
    const [classSpecificationId , setClassSpecificationId] = useState("");
    const [classSpecificationVersion, setClassSpecificationVersion] = useState("");
    const [listFunctions, setListFunctions] = useState<FunctionMinified[] | []>([]);
    const [listFunctionVersions, setListFunctionVersions] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState(false);


    useEffect(() => {
        if(classSpecificationId.length>3){  // Get IDs from functions
            setListFunctionVersions([]);
            setClassSpecificationVersion("");
            setIsCorrect(false);
            getFunctionsSimilarId(classSpecificationId)
                .then(functions => {
                    setListFunctions(functions.items);
                })
                .catch(error => console.error(error));
        }else{
            setListFunctions([]);
        }
    }, [classSpecificationId]);


    const handleSave = () => {
        if(!isResource && name !== undefined && classSpecificationId !== "" && classSpecificationVersion !== ""){
            const newFunction:FunctionWorkflowBasic ={
                name: name,
                class_specification_id: classSpecificationId,
                class_specification_version: classSpecificationVersion,
                output_mapping: {},
                annotations: {}
            }
            value.functions.push(newFunction);
        }else if(isResource && name !== "" && classType !== ""){
            //TODO
            const newResource: ResourceWorkflow = {
                name: name,
                class_type: classType,
                output_mapping: {},
                configurations: {}
            }
            value.resources.push(newResource);
        }

        if (onChange !== undefined) onChange(value);
        if (onClose !== undefined) onClose();
    }

    const handleSetName = (name: string) => {   //Checks name is not repeated between nodes.
        setName(name);
        if (name !== ""){
            handleIsCorrect(name);
        }else {
            setIsCorrect(false);
        }
    };

    const setVersions = (id: string) => {
        listFunctions.forEach(f => {
            if (f.id === id){
                getFunctionVersions(id).then(versions => {
                    setListFunctionVersions(versions.versions);
                })
            }
        });
    };

    const handleSelectVersion = (id:string) => {
        setClassSpecificationVersion(id);
        handleIsCorrect("",id);
    };

    const handleIsCorrect = (n?: string, id?: string) => {    // Tests node data correctness and allows creation
        if (!isResource){
            listFunctions.forEach(f => {
               if(f.id === classSpecificationId && (listFunctionVersions.includes(classSpecificationVersion) || listFunctionVersions.includes(id as string)) && name !== ""){
                   //TODO: Error? values do not update on setSomething used.
                   let exists = false;
                   value.functions.forEach(f =>{
                       if (f.name === name || f.name === n){
                           exists = true;
                       }
                   });
                   exists?setIsCorrect(false):setIsCorrect(true);
               }
            });
        }else{
            if (id === undefined) id = "";
            if ((classType !== "" || id !== "") && name !== "") {
                let exists = false;
                value.resources.forEach(r => {
                    if (r.name === name || r.name === n){
                        exists = true;
                    }
                });
                exists?setIsCorrect(false):setIsCorrect(true);
            }else setIsCorrect(false);
        }
    };

    const handleSelectType = (type: string) => {
        if (type !== "" && listClassType.includes(type)){
            setClassType(type);
            handleIsCorrect("",type);
        }else{
            setIsCorrect(false);
        }
    }

    const handleSelectID = (id: string) => {
        if (id.length>1){
            setClassSpecificationId(id);
            setVersions(id);
        }
    };

    const getResource =
        <ol>
            <li><b>Class Type</b>:
                <select className="mt-2"
                        onChange={e => handleSelectType(e.target.value)}>
                    <option/>
                    {listClassType.map(cT => (
                        <option key={cT}>{cT}</option>
                    ))}
                </select>
            </li>
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
                    <select className="absolute top-2 right-1"
                            onChange={e => handleSelectID(e.target.value)}>
                        <option/>
                        {listFunctions.map(fun => (
                            <option key={fun.id}>{fun.id}</option>
                        ))}
                    </select>
                </div>
            </li>
            <li>
                <b>Class Version:</b><
                select className="ml-4"
                       onChange={e => handleSelectVersion(e.target.value)}>
                <option/>
                {listFunctionVersions.map(ver => (
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
                                                      onChange={e => {handleSetName(e.target.value)}}/></li>
                    </ol>
                    {isResource? getResource:getFunction}
                    <div className="h-full grid content-end justify-center">
                        <button
                            className={(isCorrect?"bg-green-500 hover:bg-green-400":"bg-green-200") + " text-white py-2 px-32 rounded"}
                            onClick={handleSave} disabled={!isCorrect}>Confirm
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