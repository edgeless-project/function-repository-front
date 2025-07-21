import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { ApiResponseWorkflow } from '@/types/workflows';
import { deleteWorkflow, getWorkflow } from '@/services/workflowServices';
import Spinner from '@/components/utils/Spinner';
import { Button } from '@/components/ui/button';
import DialogSave from '@/components/utils/DialogSave';
import {date, format} from "@formkit/tempo";
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN"];

export default function WorkflowDelete() {
	const router = useRouter();
	const name = router.query.name;

	const [workflow, setWorkflow] = useState<ApiResponseWorkflow | null>(null);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [resultOk, setResultOk] = useState(false);
	const role = useSelector(selectRole);
	const accessToken = useSelector(selectSessionAccessToken);
	const hasRole = roleAllowed.includes(role);


	useEffect(() => {
		setLoading(true);
		if (hasRole && accessToken)
			getWorkflow(name as string, true, accessToken)
				.then(workflow => {
					setWorkflow(workflow);
					const {name, createdAt, updatedAt, ...JSON} = workflow;
					setLoading(false);
				})
				.catch(error => console.error(error));
	}, []);

	const handleDelete = async () => {
		setSaveMessage('');
		setIsSaving(true);
		setModalOpen(true);

		// Delete the workflow in the API
		try {
			await deleteWorkflow(name as string, accessToken);
			setSaveMessage('The workflow has been deleted successfully');
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

	return (
		<Layout title={`Delete workflow: ${name}`}>
			{hasRole && <div>
				{loading && <div className="flex items-center justify-center py-20">
					<Spinner />
				</div>}
				{!loading && workflow && <Card>
					<CardHeader>
						<CardTitle>Basic information</CardTitle>
					</CardHeader>
					<CardContent className="max-w-5xl">
						<div className="flex my-3">
							<div className="w-48 font-bold">Name:</div>
							<div className="w-96">{workflow.name}</div>
						</div>
						<div className="flex my-3">
							<div className="w-48 font-bold">Created at:</div>
							<div className="w-96">{format(date(workflow.createdAt), timeFormatGeneral,"en")}</div>
						</div>
						<div className="flex my-3">
							<div className="w-48 font-bold">Updated at:</div>
							<div className="w-96">{format(date(workflow.updatedAt), timeFormatGeneral,"en")}</div>
						</div>
					</CardContent>
				</Card>}
				<div className="flex justify-between my-8">
					<Button type="button"
					        variant="outline"
					        onClick={() => { router.back() }}
					>Cancel</Button>
					<Button type="button" onClick={handleDelete} className="bg-red-500">Confirm deletion</Button>
				</div>
				<DialogSave
					isOpen={modalOpen}
					title="Deleting workflow"
					description={saveMessage}
					isLoading={isSaving}
					onClose={closeModal}
				/>
			</div>}
			{!hasRole &&
				<div className="flex items-center justify-center py-20">
					<Card className="w-1/3">
						<CardHeader>
							<CardTitle className="text-center">Access Denied</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col items-center">
								<svg className="w-32 h-32 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"></path>
								</svg>
								<p className="text-center">You do not have the necessary permissions to view this page.</p>
								<p className="text-center">You are currently logged in as {role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}.</p>
							</div>
						</CardContent>
					</Card>
				</div>}
		</Layout>
	);
}