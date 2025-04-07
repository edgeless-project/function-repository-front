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
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN", "FUNC_DEVELOPER"];

export default function FunctionView() {
  const router = useRouter();
  const id = router.query.id;
  const tokenValue = useSelector(selectSessionAccessToken);
  const role = useSelector(selectRole);
  const hasRole = roleAllowed.includes(role);
  


  const [functions, setFunctions] = useState<FunctionComplete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (hasRole && tokenValue)
      getFunctionVersionsComplete(id as string, tokenValue)
        .then(functions => {
          setFunctions(functions);
          setLoading(false);
        })
        .catch(error => console.error(error));
  }, [hasRole, tokenValue]);

  return (
    <Layout title={`View function: ${id}`}>
      {hasRole && <div>
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