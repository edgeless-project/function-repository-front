import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format, date } from "@formkit/tempo"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { WorkflowMinified } from "@/types/workflows";
import Spinner from "@/components/utils/Spinner";
import { fetchWorkflows } from "@/services/workflowServices";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole} from "@/features/account/accountSlice";
import AccessWarning from "@/components/utils/AccessWarning";

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN"];

export default function WorkflowList() {

	const limit = 10;

	const [workflows, setWorkflows] = useState<WorkflowMinified[] | []>([]);
	const [total, setTotal] = useState(0);
	const [workflowsLoading, setWorkflowsLoading] = useState(true);
	const [page, setPage] = useState(1);

	const tokenValue = useSelector(selectSessionAccessToken);
	const role = useSelector(selectRole);
	const hasRole = roleAllowed.includes(role);



	useEffect(() => {
		const offset = limit * (page - 1);
		setWorkflowsLoading(true);
		if(tokenValue && hasRole)
			fetchWorkflows(offset, tokenValue)
				.then(workflows => {
					setWorkflows(workflows.items);
					setTotal(workflows.total);
					setWorkflowsLoading(false);
				})
				.catch(error => console.error(error));
	}, [hasRole, page, tokenValue]);

	const selectPrevPage = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		if (page > 1)
			setPage(prevPage => prevPage - 1);
	};
	const selectSamePage = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
	};
	const selectNextPage = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		if (total > ((page - 1) * limit) + workflows.length)
			setPage(prevPage => prevPage + 1);
	};

	if (!hasRole)
		return (
			<Layout title="Workflows">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		)

	return (
		<Layout title="Workflows">
			<Card>
				<CardHeader data-id={`workflows-panel`} >
					<CardTitle>List of workflows</CardTitle>
					{!workflowsLoading && <CardDescription>{total} workflows found</CardDescription>}
					<div className="flex justify-end">
						<Button data-id={`btn-create`} asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
							<Link href={'/workflow/create'}>Create new workflow</Link>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{workflowsLoading && <div className="flex items-center justify-center py-20">
						<Spinner />
					</div>}
					{!workflowsLoading && <Table  data-id={`workflows-table`}>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[300px]">Name</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead>Updated At</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{workflows.map(w => (
								<TableRow data-id={`workflow-row`} key={w.name}>
									<TableCell className="font-medium" data-id={`name`}>{w.name}</TableCell>
									<TableCell data-id={`created`}>{format(date(w.createdAt), timeFormatGeneral,"en")}</TableCell>
									<TableCell data-id={`updated`}>{format(date(w.updatedAt), timeFormatGeneral,"en")}</TableCell>
									<TableCell className="text-right">
										<Button data-id={`btn-view`} asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
											<Link href={`/workflow/view/${w.name}`}>View</Link>
										</Button>
										<Button data-id={`btn-edit`} asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
											<Link href={`/workflow/edit/${w.name}`}>Edit</Link>
										</Button>
										<Button data-id={`btn-delete`} asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
											<Link href={`/workflow/delete/${w.name}`}>Delete</Link>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>}
				</CardContent>
				<CardFooter>
					{!workflowsLoading && <Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious href="#" onClick={selectPrevPage} />
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#" onClick={selectSamePage}>{page}</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationNext href="#" onClick={selectNextPage} />
							</PaginationItem>
						</PaginationContent>
					</Pagination>}
				</CardFooter>
			</Card>
		</Layout>
	);
}