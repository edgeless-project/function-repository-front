import React, { useEffect, useState } from "react";
import Link from "next/link";

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

import { fetchFunctions } from "@/services/functionServices";
import Layout from "@/components/layout/Layout";
import { FunctionMinified } from "@/types/functions";
import Spinner from "@/components/utils/Spinner";
import {date, format} from "@formkit/tempo";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole} from "@/features/account/accountSlice";
const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN", "FUNC_DEVELOPER"];

export default function FunctionList() {
  const limit = 10;
  
  const [functions, setFunctions] = useState<FunctionMinified[] | []>([]);
  const [total, setTotal] = useState(0);
  const [functionsLoading, setFunctionsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const tokenValue = useSelector(selectSessionAccessToken);
  const role = useSelector(selectRole);
  const hasRole = roleAllowed.includes(role);
  
  useEffect(() => {
    const offset = limit * (page - 1);
    setFunctionsLoading(true);
    if (tokenValue && hasRole)
      fetchFunctions(offset, tokenValue)
        .then(functions => {
          setFunctions(functions.items);
          setTotal(functions.total);
          setFunctionsLoading(false);
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
    if (total > ((page - 1) * limit) + functions.length)
      setPage(prevPage => prevPage + 1);
  };

  return (
    <Layout title="Functions">
      {hasRole &&
      <Card>
        <CardHeader>
          <CardTitle>List of functions</CardTitle>
          {!functionsLoading && <CardDescription>{total} functions found</CardDescription>}
          <div className="flex justify-end">
            <Button type="button" asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
              <Link href={'/function/create'}>Create new function</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {functionsLoading && <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>}
          {!functionsLoading && <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Types</TableHead>
                <TableHead>Latest version</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {functions.map(fun => (
                <TableRow key={fun.id}>
                  <TableCell className="font-medium">{fun.id}</TableCell>
                  <TableCell>{fun.function_types.flatMap(ft => {
                    return ft.type
                  }).join(", ")}
                  </TableCell>
                  <TableCell>{fun.version}</TableCell>
                  <TableCell>{format(date(fun.createdAt), timeFormatGeneral,"en")}</TableCell>
                  <TableCell>{format(date(fun.updatedAt), timeFormatGeneral,"en")}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
                      <Link href={`/function/view/${fun.id}`}>View</Link>
                    </Button>
                    <Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
                      <Link href={`/function/edit/${fun.id}`}>Edit</Link>
                    </Button>
                    <Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
                      <Link href={`/function/delete/${fun.id}`}>Delete</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>}
        </CardContent>
        <CardFooter>
          {!functionsLoading && <Pagination>
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
      </Card>}
      {!hasRole  &&
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