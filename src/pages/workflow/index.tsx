import { useEffect, useState } from "react";
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

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);

export default function WorkflowList() {

  const limit = 10;
  
  const [workflows, setWorkflows] = useState<WorkflowMinified[] | []>([]);
  const [total, setTotal] = useState(0);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    const offset = limit * (page - 1);
    setWorkflowsLoading(true);
    fetchWorkflows(offset)
      .then(workflows => {
        setWorkflows(workflows.items);
        setTotal(workflows.total);
        setWorkflowsLoading(false);
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
    if (total > ((page - 1) * limit) + workflows.length)
      setPage(prevPage => prevPage + 1);
  };

  return (
    <Layout title="Workflows">
      <Card>
        <CardHeader>
          <CardTitle className="text-edgeless-primary-color">List of workflows</CardTitle>
          {!workflowsLoading && <CardDescription>{total} workflows found</CardDescription>}
          <div className="flex justify-end">
          <Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
            <Link href={'/workflow/create'}>Create new workflow</Link>
          </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflowsLoading && <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>}
          {!workflowsLoading && <Table>
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
                <TableRow key={w.name}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{format(date(w.createdAt), timeFormatGeneral,"en")}</TableCell>
                  <TableCell>{format(date(w.updatedAt), timeFormatGeneral,"en")}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
                      <Link href={`/workflow/view/${w.name}`}>View</Link>
                    </Button>
                    <Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
                      <Link href={`/workflow/edit/${w.name}`}>Edit</Link>
                    </Button>
                    <Button asChild className="ml-2 bg-edgeless-primary-color hover:bg-edgeless-secondary-color">
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