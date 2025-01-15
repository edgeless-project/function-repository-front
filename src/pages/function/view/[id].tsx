import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import Spinner from '@/components/utils/Spinner';
import { Button } from '@/components/ui/button';
import { FunctionComplete } from '@/types/functions';
import { getFunctionVersionsComplete } from '@/services/functionServices';
import {date, format} from "@formkit/tempo";
const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);

export default function FunctionView() {
  const router = useRouter();
  const id = router.query.id;

  const [functions, setFunctions] = useState<FunctionComplete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFunctionVersionsComplete(id as string)
      .then(functions => {
        setFunctions(functions);
        setLoading(false);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <Layout title={`View function: ${id}`}>
      {loading && <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>}
      {!loading && functions.length>0 && <Card>
        <CardHeader>
          <CardTitle>General information</CardTitle>
        </CardHeader>
        <CardContent className="max-w-5xl">
          <div className="flex my-3">
            <div className="w-48 font-bold">Id:</div>
            <div className="w-96">{functions[0].id}</div>
          </div>
        </CardContent>
      </Card>}
      {!loading && functions.length>0 && <Card className="mt-4">
        <CardHeader>
          <CardTitle>Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Types</TableHead>
                <TableHead>Outputs</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {functions.map(fun => (
                <TableRow key={fun.version}>
                  <TableCell>{fun.version}</TableCell>
                  <TableCell>{fun.function_types.flatMap(ft => {
                    return ft.type
                  }).join(", ")}</TableCell>
                  <TableCell>{fun.outputs.join(', ')}</TableCell>
                  <TableCell>{format(date(fun.createdAt), timeFormatGeneral,"en")}</TableCell>
                  <TableCell>{format(date(fun.updatedAt), timeFormatGeneral,"en")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>}
      <div className="flex justify-between my-8">
        <Button type="button"
          variant="outline"
          onClick={() => { router.back() }}
        >Go back</Button>
      </div>
    </Layout>
  );
}