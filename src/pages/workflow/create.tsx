import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, {useState} from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasMiddleSpaces } from '@/utils/general';
import DialogSave from '@/components/utils/DialogSave';
import { createWorkflow } from '@/services/workflowServices';
import {ApiRequestCreateWorkflow, JsonFlowComponentState} from '@/types/workflows';
import Flow from "@/components/workflowUI/WorkflowUI";
import CreatePanel from "@/components/workflowUI/create/CreatePanel";
const JSONEditorComponent = dynamic(() => import('@/components/JSONEditor/JSONEditorComponent'), { ssr: false });

const formSchema = z.object({
  name: z.string().min(3, 'The Id must contain at least 3 characters')
})
.refine(
  (data) => {
    return !hasMiddleSpaces(data.name);
  },
  {
    message: "The name must not contain spaces",
    path: ["name"],
  }
);

const defaultJSON: object = {
  functions: [],
  resources: [],
  annotations: {}
};

export default function WorkflowCreate() {
  const router = useRouter();
  const [workflowJSON, setWorkflowJSON] = useState(defaultJSON);
  const [hasJSONError, setHasJSONError] = useState(false);
  const [reloadWorkflow, setReloadWorkflow] = useState(false);
  const [createNode, isCreateNode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [resultOk, setResultOk] = useState(false);
  const [createResource, isCreateNodeResource] = useState(false);
  const [tabIdx, setTabIdx] = useState("json-editor");

  const form = useForm<z.infer< typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ''
    }
  });

  const handleJSONChange = (jsonData: object) => {
    setWorkflowJSON(jsonData);
    setReloadWorkflow(v => !v);
  };

  const handleJSONError = (hasJSONError: boolean) => {
    setHasJSONError(hasJSONError);
  };

  const createNodeFunction = () => {
    isCreateNodeResource(false);
    isCreateNode(true);

  };

  const createNodeResource = () => {
    isCreateNodeResource(true);
    isCreateNode(true);
  };

  const closeNewResource = () => {
    isCreateNode(false);
  };

  const handleSubmit = async (data: z.infer< typeof formSchema>) => {

    if (hasJSONError) {
      setSaveMessage('ERROR: The workflow definition is not valid.');
      setModalOpen(true);
      return;
    }
  
    setSaveMessage('');
    setIsSaving(true);
    setModalOpen(true);

    // Create the workflow in the API
    try {
      const workflowData: ApiRequestCreateWorkflow = {
        ...workflowJSON as ApiRequestCreateWorkflow, 
        name: data.name
      };
      await createWorkflow(workflowData);
      setSaveMessage('The workflow has been created successfully');
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
    <Layout title="Create workflow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Basic configuration</CardTitle>
            </CardHeader>
            <CardContent className="max-w-5xl">
              <FormField
                control={form.control}
                name="name"
                render={({field}) => {
                  return (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }} 
              />
            </CardContent>
          </Card>
          <Card className='mt-4'>
            <CardHeader>
              <CardTitle>Workflow definition</CardTitle>
            </CardHeader>
            <CardContent>
              {tabIdx==="visual-builder" && <div className="float-right">
                <Button type="button" className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color text-white py-2 px-4 mr-4 rounded" onClick={createNodeFunction}>
                  Add Function
                </Button>
                <Button type="button" className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color text-white py-2 px-6 rounded" onClick={createNodeResource}>
                  Add Resource
                </Button>
              </div>}
              <Tabs defaultValue="json-editor" onValueChange={(tabName) => setTabIdx(tabName)} value={tabIdx} className="w-full">
                <TabsList>
                  <TabsTrigger value="json-editor">JSON Editor</TabsTrigger>
                  <TabsTrigger value="visual-builder">Workflow UI</TabsTrigger>
                </TabsList>
                <TabsContent value="json-editor">
                  <JSONEditorComponent value={workflowJSON} onChange={handleJSONChange} onError={handleJSONError} />
                </TabsContent>
                <TabsContent value="visual-builder">
                  <Card>
                    <CardHeader></CardHeader>
                    <CardContent className="relative">
                      <Flow value={workflowJSON as JsonFlowComponentState} readOnly={false} onChange={handleJSONChange} reload={reloadWorkflow}/>
                      {createNode && <div className="absolute top-0 left-6">
                        <CreatePanel isResource={createResource} value={workflowJSON as JsonFlowComponentState} onChange={handleJSONChange} onClose={closeNewResource} />
                      </div>}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="flex justify-between my-8">
            <Button
                type="button"
                variant="outline"
                onClick={() => { router.back() }}
            >Cancel</Button>
            <Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" type="submit">Save</Button>
          </div>
        </form>
      </Form>

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