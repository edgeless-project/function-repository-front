import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {FunctionMinified} from "@/types/functions";
import {getFunctionsSimilarId, getFunctionVersions} from "@/services/functionServices";
import {FunctionWorkflowBasic} from "@/types/workflows";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";


interface Props {
	setIsCorrect: Dispatch<SetStateAction<boolean>>,
	setFunctionJson : Dispatch<SetStateAction<FunctionWorkflowBasic>>,
}

const CreateFunction:React.FC<Props> = ({setIsCorrect, setFunctionJson}) => {
	const [classSpecificationId, setClassSpecificationId] = React.useState("");
	const [listFunctionVersions, setListFunctionVersions] = useState<string[]>([]);
	const [classSpecificationVersion, setClassSpecificationVersion] = useState("");
	const [listFunctions, setListFunctions] = useState<FunctionMinified[] | []>([]);
	const tokenValue = useSelector(selectSessionAccessToken);

	useEffect(() => {
		if(classSpecificationId.length>3){  // Get IDs from functions
			setListFunctionVersions([]);
			setClassSpecificationVersion("");
			getFunctionsSimilarId(classSpecificationId, tokenValue)
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
				getFunctionVersions(id, tokenValue).then(versions => {
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
		<div className="mx-1">
			<b>Class Specification Id</b>
			<div className="relative">
				<Input value={classSpecificationId} className="mt-1 mb-4"
				       onChange={e => {
					       setClassSpecificationId(e.target.value);
				       }}/>
				<div className="absolute top-0 right-0">
					<Select onValueChange={v => handleSelectID(v)}>
						<SelectTrigger>
							<SelectValue placeholder="Select an ID" />
						</SelectTrigger>
						<SelectContent>
							{listFunctions.map(fun => (
								<SelectItem key={fun.id} value={fun.id}>{fun.id}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<b>Class Specification Version</b>
			<div className="mt-2">
				<Select onValueChange={v => handleSelectVersion(v)}>
					<SelectTrigger>
						<SelectValue placeholder="Select a version" />
					</SelectTrigger>
					<SelectContent>
						{listFunctionVersions.map(ver => (
							<SelectItem key={ver} value={ver}>{ver}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

export default CreateFunction;