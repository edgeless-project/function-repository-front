import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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

export default function FunctionList() {

  const limit = 10;
  
  const [functions, setFunctions] = useState<FunctionMinified[] | []>([]);
  const [total, setTotal] = useState(0);
  const [functionsLoading, setFunctionsLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    const offset = limit * (page - 1);
    setFunctionsLoading(true);
    fetchFunctions(offset)
      .then(functions => {
        setFunctions(functions.items);
        setTotal(functions.total);
        setFunctionsLoading(false);
      })
      .catch(error => console.error(error));
  }, [page]);

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
      <Card>
        <CardHeader>
          <CardTitle>List of functions</CardTitle>
          {!functionsLoading && <CardDescription>{total} functions found</CardDescription>}
          <div className="flex justify-end">
          <Button asChild className="ml-2">
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
                <TableHead className="w-[100px]">Id</TableHead>
                <TableHead>Type</TableHead>
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
                  <TableCell>{fun.function_type}</TableCell>
                  <TableCell>{fun.version}</TableCell>
                  <TableCell>{fun.createdAt}</TableCell>
                  <TableCell>{fun.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild className="ml-2">
                      <Link href={`/function/view/${fun.id}`}>View</Link>
                    </Button>
                    <Button asChild className="ml-2">
                      <Link href={`/function/edit/${fun.id}`}>Edit</Link>
                    </Button>
                    <Button asChild className="ml-2">
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
      </Card>
    </Layout>
  );
}