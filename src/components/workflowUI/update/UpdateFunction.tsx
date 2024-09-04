import React from "react";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface UpdateFunctionProps {
    funType: string,
    setClassFunType: (arg0: string) => void,
    classIdV:string,
    classVersionV: string,
    setClassVersionV: (arg0: string) => void,
    listFunctionVersions: string[],
    complex: boolean
};

const UpdateFunction:React.FC<UpdateFunctionProps> = ({funType,setClassFunType,classIdV,classVersionV,setClassVersionV, listFunctionVersions, complex}) => {

    const divComplex =
        <li><label><b>Function Type</b></label>
            <Input value={funType} className="mt-2 mb-4"
                   onChange={e =>
                       setClassFunType(e.target.value)}/>
        </li>;


    return (
        <li>
            <li><br/><b>Class Specification ID</b>
                <Input className="mt-2 mb-4" value={classIdV} disabled={true}></Input></li>
            <li><label><b>Class Specification Version</b></label>
                <br/>
                <div className="my-2">
                    <Select onValueChange={v => setClassVersionV(v)} value={classVersionV} defaultValue={classVersionV}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a version"/>
                        </SelectTrigger>
                        <SelectContent>
                            {listFunctionVersions && listFunctionVersions.map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </li>
            {complex? divComplex : null}
        </li>
    );
}

export default UpdateFunction;