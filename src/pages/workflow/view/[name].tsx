import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { ApiResponseWorkflow } from '@/types/workflows';
import { getWorkflow } from '@/services/workflowServices';
import Spinner from '@/components/utils/Spinner';
const JSONEditorComponent = dynamic(() => import('@/components/JSONEditor/JSONEditorComponent'), { ssr: false });
import { Button } from '@/components/ui/button';
import Flow from "@/components/workflowUI/WorkflowUI";
import { JsonFlowComponentState } from "@/types/workflows";
import {date, format} from "@formkit/tempo";
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN"];

export default function WorkflowView() {
	const router = useRouter();
	const name = router.query.name;
	const [workflow, setWorkflow] = useState<ApiResponseWorkflow | null>(null);
	const [workflowJSON, setWorkflowJSON] = useState<object | null>(null);
	const [loading, setLoading] = useState(true);
	const role = useSelector(selectRole);
	const hasRole = roleAllowed.includes(role);
	const accessToken = useSelector(selectSessionAccessToken);

	useEffect(() => {
		setLoading(true);
		if (accessToken && hasRole)
			getWorkflow(name as string, false, accessToken)
				.then(workflow => {
					setWorkflow(workflow);
					// We do not want to show name, createdAt and updatedAt in the workflow definition
					const {name, createdAt, updatedAt, ...JSON} = workflow;
					setWorkflowJSON(JSON);
					setLoading(false);
				})
				.catch(error => console.error(error));
	}, []);

	return (
		<Layout title={`View workflow: ${name}`}>
			{hasRole &&
				<div>
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
							<Tabs defaultValue="json-editor" className="w-full">
								<TabsList>
									<TabsTrigger value="json-editor">JSON</TabsTrigger>
									<TabsTrigger value="visual-builder">Workflow UI</TabsTrigger>
								</TabsList>
								<TabsContent value="json-editor">
									<JSONEditorComponent value={workflowJSON as Object} readOnly={true} />
								</TabsContent>
								<TabsContent value="visual-builder">
									<Card>
										<CardHeader></CardHeader>
										<CardContent>
											<Flow value={workflowJSON as JsonFlowComponentState} readOnly={true}/>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>}
					<div className="flex justify-between my-8">
						<Button
							type="button"
							variant="outline"
							onClick={() => { router.back() }}
						>Go back</Button>
					</div>
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