import React, {Dispatch, SetStateAction, useState} from "react";
import {ResourceWorkflow} from "@/types/workflows";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
const stringClassType: string = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES as string);

interface props {
    setIsCorrect: Dispatch<SetStateAction<boolean>>,
    setResourceJson : Dispatch<SetStateAction<ResourceWorkflow>>,
}

const CreateResource:React.FC<props> = ({setIsCorrect, setResourceJson}) => {
    const [listClassType, setListClassType] = useState(stringClassType.split(","));
    const [classType, setClassType] = useState("");

    const handleSelectType = (type: string) => {
        setClassType(type);
        if(listClassType.includes(type)){
            setResourceJson({
                name: "",
                class_type: type,
                output_mapping: {},
                configurations: {}
            });
            setIsCorrect(true);
        }
        else setIsCorrect(false);
    }

    return(
        <ol>
            <li><b>Class Type</b>
                <br/>
                <div className="mx-1 mt-2">
                    <Select onValueChange={v => handleSelectType(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            {listClassType.map(cT => (
                                <SelectItem key={cT} value={cT}>{cT}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </li>
        </ol>
    );
}

export default CreateResource;