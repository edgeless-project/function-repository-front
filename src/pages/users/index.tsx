import Layout from "@/components/layout/Layout";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole, selectUser} from "@/features/account/accountSlice";
import {getUsersByAdmin} from "@/services/userServices";
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
import {UserCompleteData} from "@/types/users";
import AccessWarning from "@/components/utils/AccessWarning";

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["CLUSTER_ADMIN"];

export default function Users() {

	const tokenValue = useSelector(selectSessionAccessToken);
	const role = useSelector(selectRole);
	const user = useSelector(selectUser);
	const hasRole = roleAllowed.includes(role);

	const limit = 10;
	const [users, setUsers] = useState<UserCompleteData[]>([]);
	const [total, setTotal] = useState(0);
	const [usersLoading, isUsersLoading] = useState(true);
	const [page, setPage] = useState(1);

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
		if (total > ((page - 1) * limit) + users.length)
			setPage(prevPage => prevPage + 1);
	};

	useEffect(() => {
		isUsersLoading(true)
		if(tokenValue && hasRole)
			getUsersByAdmin(tokenValue, (page-1)*limit, limit).then((r) => {
				setUsers(r.items.filter(u => u.email !== user));
				setTotal(r.total);
				isUsersLoading(false);
			})
	},[hasRole, page, tokenValue, user])

	if (!hasRole)
		return (
			<Layout title="Users">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		);

	return (
		<Layout title="Users">
			<Card>
				<CardHeader>
					<CardTitle>List of users</CardTitle>
					{!usersLoading && <CardDescription>{total} users found</CardDescription>}
					<div className="flex justify-end">
						<Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
							<Link href={'/users/create'}>Create new user</Link>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{usersLoading &&
							<div className="flex items-center justify-center py-20">
									<Spinner />
							</div>
					}
					{!usersLoading && <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead className="w-[300px]">Email</TableHead>
		                  <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
								{users.map(u => (
									<TableRow key={u.id}>
										<TableCell className="font-medium">{u.email}</TableCell>
										<TableCell className="font-medium">{u.role}</TableCell>
										<TableCell>{format(date(u.createdAt), timeFormatGeneral,"en")}</TableCell>
										<TableCell>{format(date(u.updatedAt), timeFormatGeneral,"en")}</TableCell>
										<TableCell className="text-right">
											<Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
												<Link href={`/users/password/${u.id}`}>Change Password</Link>
											</Button>
											<Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
												<Link href={`/users/edit/${u.id}`}>Edit</Link>
											</Button>
											<Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
												<Link href={`/users/delete/${u.id}`}>Delete</Link>
											</Button>
										</TableCell>
									</TableRow>
								))}
              </TableBody>
          </Table>}
				</CardContent>
				<CardFooter>
					{!usersLoading && <Pagination>
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