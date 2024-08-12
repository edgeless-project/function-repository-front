import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {FunctionMinified} from "@/types/functions";
import {getFunctionsSimilarId, getFunctionVersions} from "@/services/functionServices";
import {FunctionWorkflowBasic} from "@/types/workflows";


interface Props {
    setIsCorrect: Dispatch<SetStateAction<boolean>>,
    setFunctionJson : Dispatch<SetStateAction<FunctionWorkflowBasic>>,
}

const CreateFunction:React.FC<Props> = ({setIsCorrect, setFunctionJson}) => {
    const [classSpecificationId, setClassSpecificationId] = React.useState("");
    const [listFunctionVersions, setListFunctionVersions] = useState<string[]>([]);
    const [classSpecificationVersion, setClassSpecificationVersion] = useState("");
    const [listFunctions, setListFunctions] = useState<FunctionMinified[] | []>([]);

    useEffect(() => {
        if(classSpecificationId.length>3){  // Get IDs from functions
            setListFunctionVersions([]);
            setClassSpecificationVersion("");
            getFunctionsSimilarId(classSpecificationId)
                .then(functions => {
                    setListFunctions(functions.items);
                })
                .catch(error => console.error(error));
        }else{
            setListFunctions([]);

        }
        setIsCorrect(false);
    }, [classSpecificationId]);

    const handleSelectVersion = (version:string) => {
        setClassSpecificationVersion(version);
        if (version.length > 0 && classSpecificationId !== ""){
            setFunctionJson({
                name: "",
                class_specification_id: classSpecificationId,
                class_specification_version: version,
                output_mapping: {},
                annotations: {}
            });
            setIsCorrect(true);
        }else setIsCorrect(false);
    };

    const setVersions = (id: string) => {   // Gets possible versions from function
        listFunctions.forEach(f => {
            if (f.id === id){
                getFunctionVersions(id).then(versions => {
                    setListFunctionVersions(versions.versions);
                });
            }
        });
    };

    const handleSelectID = (id: string) => {
        if (id.length>1){
            setClassSpecificationId(id);
            setVersions(id);
        }
    };

    return(
        <ol>
            <li>
                <b>Class Specification Id</b>
                <div className="relative">
                    <Input value={classSpecificationId} className="mt-2 mb-4"
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
                <b>Class Specification Version</b>
                <br/>
                <select className="mt-2 min-w-12"
                        onChange={e => handleSelectVersion(e.target.value)}>
                    <option/>
                    {listFunctionVersions.map(ver => (
                        <option key={ver}>{ver}</option>
                    ))}
                </select>
            </li>
        </ol>
    );
}

export default CreateFunction;