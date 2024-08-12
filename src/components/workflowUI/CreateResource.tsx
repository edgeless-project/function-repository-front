import React, {Dispatch, SetStateAction, useState} from "react";
import {ResourceWorkflow} from "@/types/workflows";
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
                <select className="mt-2"
                        onChange={e => handleSelectType(e.target.value)}>
                    <option/>
                    {listClassType.map(cT => (
                        <option key={cT}>{cT}</option>
                    ))}
                </select>
            </li>
        </ol>
    );
}

export default CreateResource;