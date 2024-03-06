"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  id: z.string().min(3),
  version: z.string().min(1),
  functionType: z.enum(['RUST_WASM']),
  file: z.instanceof(File).optional(),
  outputs: z.string()
})
.refine(
  (data) => {
    if (!data.file || data.file.name === "") {
      return false;
    }
    return true;
  },
  {
    message: "Code file is required",
    path: ["file"],
  }
)

export default function FunctionCreate() {

  const router = useRouter();

  const form = useForm<z.infer< typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      version: '0.1',
      functionType: 'RUST_WASM',
      file: new File([], ""),
      outputs: '',
    }
  });

  const handleSubmit = (data: z.infer< typeof formSchema>) => {
    console.log(data);
  };

  return (
    <Layout title="Create function">
      <Card>
        <CardHeader>
          <CardTitle>Function class specification</CardTitle>
        </CardHeader>
        
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="max-w-5xl">
              <FormField
                control={form.control}
                name="id"
                render={({field}) => {
                  return (
                    <FormItem>
                      <FormLabel>Id</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Id" {...field} />
                      </FormControl>
                      <FormDescription>The function id must be unique.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }} 
              />
              <FormField
                control={form.control}
                name="version"
                render={({field}) => {
                  return (
                    <FormItem className="mt-5">
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="version" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }} 
              />
              <FormField
                control={form.control}
                name="functionType"
                render={({field}) => {
                  return (
                    <FormItem className="mt-5">
                      <FormLabel>Function type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RUST_WASM">RUST_WASM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }} 
              />
              <FormField
                control={form.control}
                name="file"
                render={({field}) => {
                  return (
                    <FormItem className="mt-5">
                      <FormLabel>Code file</FormLabel>
                      <FormControl>
                        <Input
                          type="file" 
                          onChange={(e) =>
                            field.onChange(e.target.files ? e.target.files[0] : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }} 
              />
              <FormField
                control={form.control}
                name="outputs"
                render={({field}) => {
                  return (
                    <FormItem className="mt-5">
                      <FormLabel>Outputs</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Outputs" {...field} />
                      </FormControl>
                      <FormDescription>Here you can define the outputs, separated by commas.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }} 
              />
              </CardContent>
              <CardFooter className="flex justify-between max-w-5xl mt-8">
                <Button 
                  variant="outline"
                  onClick={() => { router.back() }}
                >Cancel</Button>
                <Button type="submit">Save</Button>
              </CardFooter>
            </form>
          </Form>
        
      </Card>
    </Layout>
  );
}