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

export default function WorkflowEdit() {
  const router = useRouter();
  const name = router.query.name;

  return (
    <Layout title={`Edit workflow: ${name}`}>
      <Tabs defaultValue="json-editor" className="w-full">
        <TabsList>
          <TabsTrigger value="json-editor">JSON Editor</TabsTrigger>
          <TabsTrigger value="visual-builder">Visual Builder</TabsTrigger>
        </TabsList>
        <TabsContent value="json-editor">
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <p>TODO: JSON Editor</p>
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