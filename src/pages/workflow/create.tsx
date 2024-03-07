import dynamic from 'next/dynamic';

import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const JSONEditorComponent = dynamic(() => import('@/components/JSONEditor/JSONEditorComponent'), { ssr: false });


export default function WorkflowCreate() {

  const testData = {
    functions: [],
    resources: [],
    annotations: {}
  };

  const handleJSONChange = (jsonData: object) => {
    console.log(jsonData);
  };

  const handleJSONError = (hasError: boolean) => {
    console.log('Error: ', hasError);
  };

  return (
    <Layout title="Create workflow">
      <Tabs defaultValue="json-editor" className="w-full">
        <TabsList>
          <TabsTrigger value="json-editor">JSON Editor</TabsTrigger>
          <TabsTrigger value="visual-builder">Visual Builder</TabsTrigger>
        </TabsList>
        <TabsContent value="json-editor">
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <JSONEditorComponent value={testData} onChange={handleJSONChange} onError={handleJSONError} />
            </CardContent>
          </Card>
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
    </Layout>
  );
}