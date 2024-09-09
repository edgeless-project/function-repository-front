import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { ApiResponseWorkflow } from '@/types/workflows';
import { getWorkflow } from '@/services/workflowServices';
import Spinner from '@/components/utils/Spinner';
const JSONEditorComponent = dynamic(() => import('@/components/JSONEditor/JSONEditorComponent'), { ssr: false });
import { Button } from '@/components/ui/button';
import Flow from "@/components/workflowUI/WorkflowUI";
import { JsonFlowComponentState } from "@/types/workflows";
import {date, format} from "@formkit/tempo";

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);

export default function WorkflowView() {
  const router = useRouter();
  const name = router.query.name;
  const [workflow, setWorkflow] = useState<ApiResponseWorkflow | null>(null);
  const [workflowJSON, setWorkflowJSON] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWorkflow(name as string, false)
      .then(workflow => {
        setWorkflow(workflow);
        // We do not want to show name, createdAt and updatedAt in the workflow definition
        const {name, createdAt, updatedAt, ...JSON} = workflow;
        setWorkflowJSON(JSON);
        setLoading(false);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <Layout title={`View workflow: ${name}`}>
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
              <JSONEditorComponent value={workflowJSON as Object} readOnly={true} />
            </TabsContent>
            <TabsContent value="visual-builder">
              <Card>
                <CardHeader></CardHeader>
                <CardContent>
                    <Flow value={workflowJSON as JsonFlowComponentState} readOnly={true}/>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>}
      <div className="flex justify-between my-8">
        <Button
            type="button"
            variant="outline"
            onClick={() => { router.back() }}
        >Go back</Button>
      </div>
    </Layout>
  );
}