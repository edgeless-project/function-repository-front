import React, {Dispatch, SetStateAction, useState} from "react";
import {ResourceWorkflow} from "@/types/workflows";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
const outputResources: string[] = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES_OUTPUT as string).split(",");
const inputResources: string[] = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES_INPUT as string).split(",");
const resources = outputResources.concat(inputResources);

interface props {
	setIsCorrect: Dispatch<SetStateAction<boolean>>,
	setResourceJson : Dispatch<SetStateAction<ResourceWorkflow>>,
}

const CreateResource:React.FC<props> = ({setIsCorrect, setResourceJson}) => {
	const [listClassType] = useState(resources);
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
		<div>
			<label><b>Class Type</b></label>
			<div className="mx-1 mt-2">
				<Select onValueChange={v => handleSelectType(v)}>
					<SelectTrigger data-id={'select-id-create-resource'}>
						<SelectValue placeholder="Select a type" />
					</SelectTrigger>
					<SelectContent>
						{listClassType.map(cT => (
							<SelectItem key={cT} value={cT}>{cT}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

export default CreateResource;