import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FunctionWorkflowBasic, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";
import {Input} from "@/components/ui/input";
import {getFunctionsSimilarId, getFunctionVersions} from "@/services/functionServices";
import {FunctionMinified} from "@/types/functions";
import CreateResource from "@/components/workflowUI/CreateResource";
import CreateFunction from "@/components/workflowUI/CreateFunction";
import {boolean} from "zod";
const stringClassType: string = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES as string);

interface CUPanelProps{
    isResource: boolean,
    value: JsonFlowComponentState,
    onChange?: (value: object) => void,
    onClose?: () => void;
}

const CreatePanel:React.FC<CUPanelProps> = ({isResource, value, onChange, onClose}) => {
    const [name ,setName] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const [listClassType, setListClassType] = useState(stringClassType.split(","));
    const [functionJson, setFunctionJson ] = useState<FunctionWorkflowBasic>({
        name: "",
        class_specification_id: "",
        class_specification_version: "",
        output_mapping: {},
        annotations: {}
    });

    const [resourceJson, setResourceJson ] = useState<ResourceWorkflow>({
        name: "",
        class_type: "",
        output_mapping: {},
        configurations: {}
    });


    const handleSave = async () => {    //Async function to save data if correct .
        const res = await handleIsCorrect();    //Function requests servers data to test correct information.
        if (res) {
            if (isResource)
                value.resources.push({
                    name: name,
                    class_type: resourceJson.class_type,
                    output_mapping: resourceJson.output_mapping,
                    configurations: resourceJson.configurations
                });
            else
                value.functions.push({
                    name: name,
                    class_specification_id: functionJson.class_specification_id,
                    class_specification_version: functionJson.class_specification_version,
                    output_mapping: functionJson.output_mapping,
                    annotations: functionJson.annotations
                });

            if (onChange !== undefined) onChange(value);
        }
        if (onClose !== undefined) onClose();
    }

    const handleSetName = (name: string) => {   // Checks name is not repeated between nodes.
        setName(name);
    };

    const handleIsCorrect = async (): Promise<boolean> => {  // Verifies node data correctness and allows creation
        // Checks name not to be repeated
        console.log("Name length", name.length);
        if (!(name.length > 0)) return false;
        value.resources.forEach(r => {
            if (name === r.name) {
                console.log("Name repeated in resources");
                return false;
            }
        });
        value.functions.forEach(f => {
            if (name === f.name) {
                console.log("Name repeated in functions");
                return false;
            }
        });

        let correctData = false;
        if (isResource) {
            listClassType.forEach(r => {
                if (r === resourceJson.class_type) {
                    console.log("Class type in resources correct");
                    correctData = true;
                }
            });
        } else {
            // Verifies Id and version match
            await getFunctionVersions(functionJson.class_specification_id).then(resp => {
                resp.versions.forEach(v => {
                    if (v === functionJson.class_specification_version) {
                        console.log("Version specification in functions correct");
                        correctData = true;
                    }
                });
            });
        }
        console.log("Not True?", correctData);
        return correctData;
    };

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
                    {isResource?
                        <CreateResource/>:
                        <CreateFunction setIsCorrect={setIsComplete} setFunctionJson={setFunctionJson}/>
                    }
                    <div className="h-full grid grid-cols-2 gap-2 content-end justify-center">
                        <button
                            className={((name!=="" && isComplete)?"bg-green-500 hover:bg-green-400":"bg-green-200") + " text-white py-2 px-4 rounded"}
                            onClick={handleSave} disabled={(name==="" || !isComplete)}>Confirm
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-400 text-white py-2 px-4 rounded"
                            onClick={onClose}>Cancel
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default CreatePanel;