import Layout from "@/components/layout/Layout";
import AccessWarning from "@/components/utils/AccessWarning";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole} from "@/features/account/accountSlice";
import { useRouter } from 'next/router';
import DialogSave from "@/components/utils/DialogSave";
import {createAPIKey} from "@/services/apikeyServices";

const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN", "FUNC_DEVELOPER"];


export default function CreateAPIKey() {
	const router = useRouter();

	const tokenValue = useSelector(selectSessionAccessToken);
	const role = useSelector(selectRole);
	const hasRole = roleAllowed.includes(role);

	const [name, setName] = useState(""); // State for input value
	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [resultOk, setResultOk] = useState(false);

	const closeModal = () => {
		if (resultOk) {
			router.back();
		}
		setModalOpen(false);
	};

	const handleSubmit = async () => {
		setSaveMessage('');
		setIsSaving(true);
		setModalOpen(true);

		try {
			if (!name) throw new Error("Name is required");
			const res = await createAPIKey(tokenValue, name);
			setSaveMessage(`New API key ${res.key} has been created successfully`);
			setResultOk(true);
		} catch (err: any) {
			const text = `API Key not created: ${err.message as string}`;
			setSaveMessage(text);
		}
		setIsSaving(false);
	}

	if (!hasRole)
		return (
			<Layout title="Create API Key">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		)

	return (
		<Layout title="Create API Key">
			<Card>
				<CardHeader>
					<CardTitle>Basic information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-start my-8 gap-4">
						<label htmlFor="name" className="font-medium">Name</label>
						<input
							id="name"
							type="text"
							placeholder="Enter name"
							value={name} // Bind state to input
							onChange={(e) => setName(e.target.value)}
							className="w-1/4 px-3 py-2 border rounded-md"
						/>
					</div>
				</CardContent>
			</Card>
			<div className="flex justify-between my-8">
				<Button
					type="button"
					variant="outline"
					onClick={() => { router.back() }}
				>Cancel</Button>
				<Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" type="submit" onClick={handleSubmit}>Create</Button>
			</div>
			<DialogSave
				isOpen={modalOpen}
				title="Creating API Key"
				description={saveMessage}
				isLoading={isSaving}
				onClose={closeModal}/>
		</Layout>
	);
}