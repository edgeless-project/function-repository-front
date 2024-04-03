import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";
import {useEffect, useState} from "react";
import {ApiResponseGetFunctionVersions, FunctionComplete} from "@/types/functions";
import {deleteFunction, getFunctionVersions, getFunctionVersionsComplete} from "@/services/functionServices";
import Spinner from "@/components/utils/Spinner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import DialogDelete from "@/components/utils/DialogDelete"

export default function FunctionDelete() {
  const router = useRouter();
  const id = router.query.id as string;

  const [functions, setFunctions] = useState<FunctionComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [delMsg, setDelMessage] = useState('');
  const [version, setVersion] = useState('');
  const [resultOk, setResultOk] = useState(false);

  //Controls for an id to be loaded from API and loading
  useEffect(() => {
    setLoading(true);
    getFunctionVersionsComplete(id as string)
        .then(fun => {
          setFunctions(fun);
          setLoading(false);
        })
        .catch(error => console.error(error)); //TODO: Error threw
  }, []);

  const deleteVer = async (id: string, version: string = '') =>{
    try {
      const resp = await deleteFunction(id,version);
      setResultOk(true);
      return resp.deletedCount;

    }catch (e: any) {
      const text = `ERROR: ${e.message as string}`;
      setDelMessage(text);
      return 0;
    }
  }

  const handleDeleteModal = (version: string = '') => {
    setVersion(version);
    setDelMessage(`Confirm to delete function id ${id}${version?` version ${version}`:''}.`);
    setModalOpen(true);
  }

  const handleDialogDelete = (id: string, version: string = '') => {
    deleteVer(id, version).then( resp => {
      setModalOpen(false);
      if(resp > 0){
        console.log(`Deleted elements ${resp}`);
        setDelMessage(`Function deleted!`);
        setResultOk(true);
      }else{
        setDelMessage('Function could not be deleted!');
        setResultOk(true);
      }
      setModalOpen(true);
    });
  }

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
            <div className="w-96">{id}</div>
            <div className="flex justify-end">
              <Button
                  className="ml-6"
                  variant="destructive"
                  onClick={() => handleDeleteModal('')}
              >Delete Function</Button>
            </div>
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
                <TableHead>Type</TableHead>
                <TableHead>Outputs</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {functions.map(v => (
                  <TableRow key={v.version}>
                    <TableCell>{v.version}</TableCell>
                    <TableCell>{v.function_type}</TableCell>
                    <TableCell>{v.outputs.join(', ')}</TableCell>
                    <TableCell>{v.createdAt}</TableCell>
                    <TableCell>{v.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                          className="ml-2 red"
                          variant="destructive"
                          onClick={() => handleDeleteModal(v.version)}
                      >Delete</Button>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <DialogDelete
            isOpen={modalOpen}
            title={"Delete function"}
            description={delMsg}
            isLoading={isSaving}
            resultOK={resultOk}
            onClose={() => router.back()}
            onConfirm={() => handleDialogDelete(id, version)}
        />
      </Card>
      }
      <div className="flex justify-between my-8">
        <Button
            variant="outline"
            onClick={() => router.back()}
        >Go back</Button>
      </div>
    </Layout>
  );
}