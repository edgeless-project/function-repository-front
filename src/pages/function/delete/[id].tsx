import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";
import {useEffect, useState} from "react";
import {ApiResponseGetFunctionVersions} from "@/types/functions";
import {getFunctionVersions} from "@/services/functionServices";
import Spinner from "@/components/utils/Spinner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";

export default function FunctionDelete() {
  const router = useRouter();
  const id = router.query.id as string;

  const [response, setResponse] = useState<ApiResponseGetFunctionVersions>({} as unknown as ApiResponseGetFunctionVersions);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [resultOk, setResultOk] = useState(false);

  //Controls for an id to be loaded from API and loading
  useEffect(() => {
    setLoading(true);
      getFunctionVersions(id as string)
        .then(ver => {
          console.log(ver);
          setResponse(ver);
          setLoading(false);
        })
        .catch(error => console.error(error)); //TODO: Error threw
  }, []);



  return (
    <Layout title={`View function: ${id}`}>
      {loading && <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>}
      {!loading && response.versions.length>0 && <Card>
        <CardHeader>
          <CardTitle>General information</CardTitle>
        </CardHeader>
        <CardContent className="max-w-5xl">
          <div className="flex my-3">
            <div className="w-48 font-bold">Id:</div>
            <div className="w-96">{id}</div>
            <div className="flex justify-end">
              <Button className="ml-6">Delete Function</Button>
            </div>
          </div>
        </CardContent>
      </Card>}
      {!loading && response.versions.length>0 && <Card className="mt-4">
        <CardHeader>
          <CardTitle>Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {response.versions.map(v => (
                  <TableRow key={v}>
                    <TableCell>{v}</TableCell>
                    <TableCell className="text-right">
                      <Button className="ml-2">Delete</Button>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>}
      <div className="flex justify-between my-8">
        <Button
            variant="outline"
            onClick={() => { router.back() }}
        >Go back</Button>
      </div>
    </Layout>
  );
}