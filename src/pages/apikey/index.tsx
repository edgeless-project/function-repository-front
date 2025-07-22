import Layout from "@/components/layout/Layout";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole, selectUser} from "@/features/account/accountSlice";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Spinner from "@/components/utils/Spinner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {date, format} from "@formkit/tempo";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink, PaginationNext,
	PaginationPrevious
} from "@/components/ui/pagination";
import AccessWarning from "@/components/utils/AccessWarning";
import {getAPIKey, getAPIKeysByAdmin} from "@/services/apikeyServices";
import {ResponseApikeyDto} from "@/types/apikeys";
import DialogSave from "@/components/utils/DialogSave";

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN", "FUNC_DEVELOPER"];

export default function Apikey() {

	const tokenValue = useSelector(selectSessionAccessToken);
	const role = useSelector(selectRole);
	const user = useSelector(selectUser);
	const hasRole = roleAllowed.includes(role);

	const limit = 10;
	const [APIKeys, setAPIKeys] = useState<ResponseApikeyDto[]>([]);
	const [total, setTotal] = useState(0);
	const [APIKeysLoading, isAPIKeysLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [modalOpen, setModalOpen] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');

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
		if (total > ((page - 1) * limit) + APIKeys.length)
			setPage(prevPage => prevPage + 1);
	};

	useEffect(() => {
		isAPIKeysLoading(true)
		if(tokenValue && hasRole)
			getAPIKeysByAdmin(tokenValue, (page-1)*limit, limit).then((r) => {
				setAPIKeys(r.items);
				setTotal(r.total);
				isAPIKeysLoading(false);
			})
	},[hasRole, page, tokenValue, user])

	const handleShow = (id: string) => {
		getAPIKey(tokenValue, id).then((r) => {
			setSaveMessage(`${r.key}`);
			setModalOpen(true);
		})
	}

	const closeModal = () => {
		setModalOpen(false);
		setSaveMessage('');
	}

	if (!hasRole)
		return (
			<Layout title="API Keys">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		);

	return (
		<Layout title="API Keys">
			<Card>
				<CardHeader>
					<CardTitle>List of API Keys</CardTitle>
					{!APIKeysLoading && <CardDescription>{total} API Keys found</CardDescription>}
					<div className="flex justify-end">
						<Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
							<Link href={'/apikey/create'}>Create new API Key</Link>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{APIKeysLoading &&
							<div className="flex items-center justify-center py-20">
									<Spinner />
							</div>
					}
					{!APIKeysLoading && <Table>
              <TableHeader>
                  <TableRow>
		                  <TableHead className="">Name</TableHead>
		                  <TableHead className="w-[300px]">API Key</TableHead>
		                  <TableHead>Owner</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
								 { APIKeys && APIKeys.map(u => (
									<TableRow key={u.key}>
										<TableCell className="font-medium">{u.name}</TableCell>
										<TableCell className="font-medium">{u.key}</TableCell>
										<TableCell className="font-medium">{u.owner}</TableCell>
										<TableCell className="font-medium">{u.role}</TableCell>
										<TableCell>{format(date(u.createdAt), timeFormatGeneral,"en")}</TableCell>
										<TableCell className="text-right">
											<Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color"
											onClick={() => handleShow(u.id || u.key)}>
												<Link href={``}>Show Key</Link>
											</Button>
											<Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
												<Link href={`/apikey/delete/${u.id}`}>Delete</Link>
											</Button>
										</TableCell>
									</TableRow>
								))}
              </TableBody>
          </Table>}
				</CardContent>
				<CardFooter>
					{!APIKeysLoading && <Pagination>
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
			<DialogSave
				isOpen={modalOpen}
				title="API KEY"
				description={saveMessage}
				isLoading={false}
				onClose={closeModal}/>
		</Layout>
	);
}