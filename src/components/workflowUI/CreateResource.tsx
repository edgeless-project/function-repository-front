import React, {useState} from "react";
const stringClassType: string = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES as string);

interface props {

}

const CreateResource:React.FC<props> = ({}) => {
    const [listClassType, setListClassType] = useState(stringClassType.split(","));
    const [classType, setClassType] = useState("");

    const handleSelectType = (type: string) => {
        setClassType(type);
    }

    return(
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
        </ol>
    );
}

export default CreateResource;