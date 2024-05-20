import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { ApiRequestUpdateWorkflow, ApiResponseWorkflow } from '@/types/workflows';
import { getWorkflow, updateWorkflow } from '@/services/workflowServices';
import Spinner from '@/components/utils/Spinner';
import { Button } from '@/components/ui/button';
import DialogSave from '@/components/utils/DialogSave';
import Flow from '@/components/workflowUI/workflowUI';
import {date, format} from "@formkit/tempo";
const JSONEditorComponent = dynamic(() => import('@/components/JSONEditor/JSONEditorComponent'), { ssr: false });
const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);

export default function WorkflowEdit() {
  const router = useRouter();
  const name = router.query.name;

  const [workflow, setWorkflow] = useState<ApiResponseWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [workflowJSON, setWorkflowJSON] = useState<object | null>(null);
  const [hasJSONError, setHasJSONError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [resultOk, setResultOk] = useState(false);


  useEffect(() => {
    setLoading(true);
    getWorkflow(name as string, true)
      .then(workflow => {
        setWorkflow(workflow);
        // We do not want to show name, createdAt and updatedAt in the workflow definition
        const {name, createdAt, updatedAt, ...JSON} = workflow;
        setWorkflowJSON(JSON);
        setLoading(false);
      })
      .catch(error => console.error(error));
  }, []);

  const handleJSONChange = (jsonData: object) => {
    setWorkflowJSON(jsonData);
  };

  const handleJSONError = (hasJSONError: boolean) => {
    setHasJSONError(hasJSONError);
  };

  const handleSubmit = async () => {

    if (hasJSONError) {
      setSaveMessage('ERROR: The workflow definition is not valid.');
      setModalOpen(true);
      return;
    }
  
    setSaveMessage('');
    setIsSaving(true);
    setModalOpen(true);

    // Update the workflow in the API
    try {
      const workflowData: ApiRequestUpdateWorkflow = {
        ...workflowJSON as ApiRequestUpdateWorkflow
      };
      await updateWorkflow(name as string, workflowData);
      setSaveMessage('The workflow has been updated successfully');
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
    <Layout title={`Edit workflow: ${name}`}>
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
      {!loading && <Card className='mt-4'>
        <CardHeader>
          <CardTitle>Workflow definition</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="json-editor" className="w-full">
            <TabsList>
              <TabsTrigger value="json-editor">JSON</TabsTrigger>
              <TabsTrigger value="visual-builder">Workflow UI</TabsTrigger>
            </TabsList>
            <TabsContent value="json-editor">
              <JSONEditorComponent value={workflowJSON as object} onChange={handleJSONChange} onError={handleJSONError} />
            </TabsContent>
            <TabsContent value="visual-builder">
              <Card>
                <CardHeader></CardHeader>
                <CardContent>
                  <p>TODO: Workflow UI</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>}
      <div className="flex justify-between my-8">
        <Button 
          variant="outline"
          onClick={() => { router.back() }}
        >Cancel</Button>
        <Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" onClick={handleSubmit}>Save</Button>
      </div>
      <DialogSave
        isOpen={modalOpen}
        title="Saving workflow"
        description={saveMessage}
        isLoading={isSaving}
        onClose={closeModal}
      />
    </Layout>
  );
}