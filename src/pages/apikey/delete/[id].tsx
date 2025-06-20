import { useRouter } from 'next/router';
import React, { useState } from 'react';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { Button } from '@/components/ui/button';
import DialogSave from '@/components/utils/DialogSave';
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import AccessWarning from "@/components/utils/AccessWarning";
import { deleteAPIKey } from '@/services/apikeyServices';


const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN", "FUNC_DEVELOPER"];

export default function WorkflowDelete() {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [resultOk, setResultOk] = useState(false);

	const role = useSelector(selectRole);
	const accessToken = useSelector(selectSessionAccessToken);
	const hasRole = roleAllowed.includes(role);


	const handleDelete = async () => {
		setSaveMessage('');
		setIsSaving(true);
		setModalOpen(true);

		// Delete the key in the API
		try {
			const resp = await deleteAPIKey(accessToken,id);
			if (resp.elementsDeleted === 0)
				throw new Error(`Error deleting Key: ${id}`);

			setSaveMessage(`${id} has been deleted successfully`);
			setResultOk(true);
		} catch (err: any) {
			const text = `ERROR: ${err.message as string}`;
			setSaveMessage(text);
		}
		setIsSaving(false);

	};

	const closeModal = () => {
		if (resultOk) {
			router.back();
		}
		setModalOpen(false);
	};

	if (!hasRole)
		return (
			<Layout title="Delete API Key">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		)

	return (
		<Layout title={`Delete API Key`}>
			<div>
				<Card>
					<CardHeader>
              <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="max-w-5xl">
              <div className="flex my-3">
                  <div className="w-48 font-bold">API Key ID:</div>
                  <div className="w-96">{id}</div>
              </div>
          </CardContent>
        </Card>
				<div className="flex justify-between my-8">
					<Button type="button"
					        variant="outline"
					        onClick={() => { router.back() }}
					>Cancel</Button>
					<Button type="button" onClick={handleDelete} className="bg-red-500">Confirm deletion</Button>
				</div>
				<DialogSave
					isOpen={modalOpen}
					title="Deleting API Key"
					description={saveMessage}
					isLoading={isSaving}
					onClose={closeModal}
				/>
			</div>
		</Layout>
	);
}