import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { ApiResponseWorkflow } from '@/types/workflows';
import { deleteWorkflow, getWorkflow } from '@/services/workflowServices';
import Spinner from '@/components/utils/Spinner';
import { Button } from '@/components/ui/button';
import DialogSave from '@/components/utils/DialogSave';
import {date, format} from "@formkit/tempo";

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);

export default function WorkflowDelete() {
  const router = useRouter();
  const name = router.query.name;

  const [workflow, setWorkflow] = useState<ApiResponseWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [resultOk, setResultOk] = useState(false);


  useEffect(() => {
    setLoading(true);
    getWorkflow(name as string, true)
      .then(workflow => {
        setWorkflow(workflow);
        const {name, createdAt, updatedAt, ...JSON} = workflow;
        setLoading(false);
      })
      .catch(error => console.error(error));
  }, []);

  const handleDelete = async () => {
    setSaveMessage('');
    setIsSaving(true);
    setModalOpen(true);

    // Delete the workflow in the API
    try {
      await deleteWorkflow(name as string);
      setSaveMessage('The workflow has been deleted successfully');
      setResultOk(true);
    } catch (err: any) {
      const text = `ERROR: ${err.message as string}`;
      setSaveMessage(text);
    }
    setIsSaving(false);

  };

  const closeModal = () => {
    if (resultOk) {
      router.back();
    }
    setModalOpen(false);
  };

  return (
    <Layout title={`Delete workflow: ${name}`}>
            {loading && <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>}
      {!loading && workflow && <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="max-w-5xl">
          <div className="flex my-3">
            <div className="w-48 font-bold">Name:</div>
            <div className="w-96">{workflow.name}</div>
          </div>
          <div className="flex my-3">
            <div className="w-48 font-bold">Created at:</div>
            <div className="w-96">{format(date(workflow.createdAt), timeFormatGeneral,"en")}</div>
          </div>
          <div className="flex my-3">
            <div className="w-48 font-bold">Updated at:</div>
            <div className="w-96">{format(date(workflow.updatedAt), timeFormatGeneral,"en")}</div>
          </div>
        </CardContent>
      </Card>}
      <div className="flex justify-between my-8">
        <Button type="button"
          variant="outline"
          onClick={() => { router.back() }}
        >Cancel</Button>
        <Button type="button"onClick={handleDelete} className="bg-red-500">Confirm deletion</Button>
      </div>
      <DialogSave
        isOpen={modalOpen}
        title="Deleting workflow"
        description={saveMessage}
        isLoading={isSaving}
        onClose={closeModal}
      />
    </Layout>
  );
}