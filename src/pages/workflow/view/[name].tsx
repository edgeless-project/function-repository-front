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
import { ApiResponseWorkflow } from '@/types/workflows';
import { getWorkflow } from '@/services/workflowServices';
import Spinner from '@/components/utils/Spinner';
import JSONEditorComponent from '@/components/JSONEditor/JSONEditorComponent';
import { Button } from '@/components/ui/button';

export default function WorkflowView() {
  const router = useRouter();
  const name = router.query.name;

  const [workflow, setWorkflow] = useState<ApiResponseWorkflow | null>(null);
  const [workflowJSON, setWorkflowJSON] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWorkflow(name as string)
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
            <div className="w-96">{workflow.createdAt}</div>
          </div>
          <div className="flex my-3">
            <div className="w-48 font-bold">Updated at:</div>
            <div className="w-96">{workflow.updatedAt}</div>
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
              <TabsTrigger value="visual-builder">Visual Builder</TabsTrigger>
            </TabsList>
            <TabsContent value="json-editor">
              <JSONEditorComponent value={workflowJSON as object} readOnly={true} />
            </TabsContent>
            <TabsContent value="visual-builder">
              <Card>
                <CardHeader></CardHeader>
                <CardContent>
                  <p>TODO: Visual Builder</p>
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
        >Go back</Button>
      </div>
    </Layout>
  );
}