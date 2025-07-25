import React, {useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FunctionWorkflowBasic, JsonFlowComponentState, ResourceWorkflow} from "@/types/workflows";
import {Input} from "@/components/ui/input";
import {getFunctionVersions} from "@/services/functionServices";
import CreateResource from "@/components/workflowUI/create/CreateResource";
import CreateFunction from "@/components/workflowUI/create/CreateFunction";
import DialogSave from "@/components/utils/DialogSave";
import {Button} from "@/components/ui/button";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
const outputResources: string[] = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES_OUTPUT as string).split(",");
const inputResources: string[] = (process.env.NEXT_PUBLIC_GENERIC_RESOURCES_INPUT as string).split(",");
const resources = outputResources.concat(inputResources);

interface CUPanelProps{
	isResource: boolean,
	value: JsonFlowComponentState,
	onChange?: (value: object) => void,
	onClose?: () => void;
}

const CreatePanel:React.FC<CUPanelProps> = ({isResource, value, onChange, onClose}) => {
	const tokenValue = useSelector(selectSessionAccessToken);
	const [name ,setName] = useState("");
	const [isComplete, setIsComplete] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMessage, setModalMessage] = useState("");
	const [listClassType] = useState(resources);
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
			if (onClose !== undefined) onClose();
		}else setModalOpen(true);

	}

	const handleSetName = (name: string) => {   // Checks name is not repeated between nodes.
		setName(name);
	};

	const handleIsCorrect = async (): Promise<boolean> => {  // Verifies node data correctness and allows creation
		// Checks name not to be repeated
		let exist_name = false;
		let name_len = true;
		if (!(name.length > 0)) {
			setModalMessage("'Name' not filled.")
			name_len = false;
		}
		value.resources.forEach(r => {
			if (name === r.name) {
				setModalMessage("Name repeated.");
				exist_name = true;
			}
		});
		value.functions.forEach(f => {
			if (name === f.name) {
				setModalMessage("Name repeated.");
				exist_name = true;
			}
		});

		let correctData = false;
		if (isResource) {
			listClassType.forEach(r => {
				if (r === resourceJson.class_type) {
					correctData = true;
				}
			});
			if (!correctData) setModalMessage("Class type in resources not correct");
		} else {
			// Verifies Id and version match
			await getFunctionVersions(functionJson.class_specification_id, tokenValue).then(resp => {
				resp.versions.forEach(v => {
					if (v === functionJson.class_specification_version) {
						correctData = true;
					}
				});
			}).catch(() => setModalMessage("Class specification ID is not correct"));
			if (!correctData) setModalMessage("Class specification ID and version do not match");
		}
		return correctData && !exist_name && name_len;
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
			<CardContent className="h-80">
				<div className="flex flex-col gap-4 w-80 h-full my-4 mx-1 overflow-y-auto">
					<div>
						<label><b>NAME</b></label>
						<div className="mt-1 mx-1">
							<Input type="text" value={name}
							       onChange={e => handleSetName(e.target.value)}/>
						</div>
					</div>

					{isResource ?
						<CreateResource setResourceJson={setResourceJson} setIsCorrect={setIsComplete}/> :
						<CreateFunction setIsCorrect={setIsComplete} setFunctionJson={setFunctionJson}/>
					}
					<div className="h-full grid grid-cols-2 gap-2 content-end justify-center">
						<Button
							type="button"
							className="py-2 px-4 rounded"
							variant="outline"
							onClick={onClose}>Cancel
						</Button>
						<Button
							type="button"
							className={((name !== "" && isComplete) ? "bg-edgeless-primary-color hover:bg-edgeless-secondary-color" : "bg-indigo-100") + " text-white py-2 px-4 rounded"}
							onClick={handleSave} disabled={(name === "" || !isComplete)}>Confirm
						</Button>
					</div>
				</div>
			</CardContent>
			<DialogSave
				isOpen={modalOpen}
				title="Error on create node"
				description={modalMessage}
				isLoading={false}
				onClose={() => onClose ? onClose() :setModalOpen(false)}
			/>
		</Card>
	);
}

export default CreatePanel;