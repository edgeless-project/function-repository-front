import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";
import React, {useEffect, useState} from "react";
import {FunctionComplete} from "@/types/functions";
import {deleteFunction, getFunctionVersionsComplete} from "@/services/functionServices";
import Spinner from "@/components/utils/Spinner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import DialogDelete from '@/components/utils/DialogDelete'
import {date, format} from "@formkit/tempo";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole} from "@/features/account/accountSlice";
const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN", "FUNC_DEVELOPER"];

export default function FunctionDelete() {
  const router = useRouter();
  const id = router.query.id as string;
  const tokenValue = useSelector(selectSessionAccessToken);
  const role = useSelector(selectRole);
  const hasRole = roleAllowed.includes(role);


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
    if (hasRole && tokenValue)
      getFunctionVersionsComplete(id as string, tokenValue)
          .then(fun => {
            setFunctions(fun);
            setLoading(false);
          })
          .catch(error => console.error(error));
  }, []);

  const deleteVer = async (id: string, version: string = '') =>{
    try {
      const resp = await deleteFunction(id,version, tokenValue);
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
                      <TableCell>{v.function_types.flatMap(ft => {
                        return ft.type
                      }).join(", ")}</TableCell>
                      <TableCell>{v.outputs.join(', ')}</TableCell>
                      <TableCell>{format(date(v.createdAt), timeFormatGeneral,"en")}</TableCell>
                      <TableCell>{format(date(v.updatedAt), timeFormatGeneral,"en")}</TableCell>
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
          </div>}
    </Layout>
  );
}