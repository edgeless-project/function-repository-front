import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import {ApiRequestUpdateWorkflow, ApiResponseWorkflow, JsonFlowComponentState} from '@/types/workflows';
import { getWorkflow, updateWorkflow } from '@/services/workflowServices';
import Spinner from '@/components/utils/Spinner';
import { Button } from '@/components/ui/button';
import DialogSave from '@/components/utils/DialogSave';
import Flow from '@/components/workflowUI/WorkflowUI';
import {date, format} from "@formkit/tempo";
import CreatePanel from "@/components/workflowUI/create/CreatePanel";
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
const JSONEditorComponent = dynamic(() => import('@/components/JSONEditor/JSONEditorComponent'), { ssr: false });
const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN"];

export default function WorkflowEdit() {
	const router = useRouter();
	const name = router.query.name;

	const [workflow, setWorkflow] = useState<ApiResponseWorkflow | null>(null);
	const [loading, setLoading] = useState(true);
	const [workflowJSON, setWorkflowJSON] = useState<object | null>(null);
	const [hasJSONError, setHasJSONError] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [resultOk, setResultOk] = useState(false);
	const [tabIdx, setTabIdx] = useState("json-editor");
	const [createNode, isCreateNode] = useState(false);
	const [createResource, isCreateNodeResource] = useState(false);
	const [reloadWorkflow, setReloadWorkflow] = useState(false);
	const role = useSelector(selectRole);
	const hasRole = roleAllowed.includes(role);
	const accessToken = useSelector(selectSessionAccessToken);


	useEffect(() => {
		setLoading(true);
		if(hasRole && accessToken)
			getWorkflow(name as string, true, accessToken)
				.then(workflow => {
					setWorkflow(workflow);
					// We do not want to show name, createdAt and updatedAt in the workflow definition
					const {name, createdAt, updatedAt, ...JSON} = workflow;
					setWorkflowJSON(JSON);
					setLoading(false);
				})
				.catch(error => console.error(error));
	}, []);

	const handleJSONChange = (jsonData: object) => {
		setWorkflowJSON(jsonData);
		setReloadWorkflow(v => !v);
	};

	const handleJSONError = (hasJSONError: boolean) => {
		setHasJSONError(hasJSONError);
	};

	const handleSubmit = async () => {

		if (hasJSONError) {
			setSaveMessage('ERROR: The workflow definition is not valid.');
			setModalOpen(true);
			return;
		}

		setSaveMessage('');
		setIsSaving(true);
		setModalOpen(true);

		// Update the workflow in the API
		try {
			const workflowData: ApiRequestUpdateWorkflow = {
				...workflowJSON as ApiRequestUpdateWorkflow
			};
			await updateWorkflow(name as string, workflowData, accessToken);
			setSaveMessage('The workflow has been updated successfully');
			setResultOk(true);
		} catch (err: any) {
			const text = `ERROR: ${err.message as string}`;
			setSaveMessage(text);
		}
		setIsSaving(false);

	};

	const createNodeFunction = () => {
		isCreateNodeResource(false);
		isCreateNode(true);

	};

	const createNodeResource = () => {
		isCreateNodeResource(true);
		isCreateNode(true);
	};

	const closeNewResource = () => {
		isCreateNode(false);
	};

	const closeModal = () => {
		if (resultOk) {
			router.back();
		}
		setModalOpen(false);
	};

	return (
		<Layout title={`Edit workflow: ${name}`}>
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
				{!loading && <Card className='mt-4'>
					<CardHeader>
						<CardTitle>Workflow definition</CardTitle>
					</CardHeader>
					<CardContent>
						{tabIdx==="visual-builder" && <div className="float-right">
							<Button type="button" className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color text-white py-2 px-4 mr-4 rounded" onClick={createNodeFunction}>
								Add Function
							</Button>
							<Button type="button" className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color text-white py-2 px-6 rounded" onClick={createNodeResource}>
								Add Resource
							</Button>
						</div>}
						<Tabs defaultValue="json-editor" onValueChange={(tabName) => setTabIdx(tabName)} value={tabIdx} className="w-full">
							<TabsList>
								<TabsTrigger value="json-editor">JSON</TabsTrigger>
								<TabsTrigger value="visual-builder">Workflow UI</TabsTrigger>
							</TabsList>
							<TabsContent value="json-editor">
								<JSONEditorComponent value={workflowJSON as object} onChange={handleJSONChange}
								                     onError={handleJSONError}/>
							</TabsContent>
							<TabsContent value="visual-builder">
								<Card>
									<CardHeader></CardHeader>
									<CardContent className="relative">
										<Flow value={workflowJSON as JsonFlowComponentState} readOnly={false} onChange={handleJSONChange} reload={reloadWorkflow}/>
										{createNode && <div className="absolute top-0 left-6">
											<CreatePanel isResource={createResource} value={workflowJSON as JsonFlowComponentState} onChange={handleJSONChange} onClose={closeNewResource} />
										</div>}
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>}
				<div className="flex justify-between my-8">
					<Button
						variant="outline"
						onClick={() => {
							router.back()
						}}
					>Cancel</Button>
					<Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" onClick={handleSubmit}>Save</Button>
				</div>
				<DialogSave
					isOpen={modalOpen}
					title="Saving workflow"
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
				</div>
			}
		</Layout>
	);
}