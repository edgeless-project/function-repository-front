import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Layout from "@/components/layout/Layout";

export default function WorkflowView() {
  const router = useRouter();
  const name = router.query.name;

  return (
    <Layout title={`View workflow: ${name}`}>
      <Tabs defaultValue="json-editor" className="w-full">
        <TabsList>
          <TabsTrigger value="json-editor">JSON Editor</TabsTrigger>
          <TabsTrigger value="visual-builder">Visual Builder</TabsTrigger>
        </TabsList>
        <TabsContent value="json-editor">
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <p>TODO: JSON Editor (view mode only)</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="visual-builder">
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <p>TODO: Visual builder (view mode only)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}