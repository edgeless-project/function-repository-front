import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";
import {useEffect, useState} from "react";
import {createFunction, getFunctionVersionsComplete, updateFunction, uploadCodeFile} from "@/services/functionServices";
import {FunctionComplete} from "@/types/functions";
import Spinner from "@/components/utils/Spinner";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {z} from "zod";
import {hasMiddleSpaces, splitOutputs} from "@/utils/general";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import DialogSave from "@/components/utils/DialogSave";

//Form Schema verification
const formSchema = z.object({
    version: z.string().min(1, 'The version must contain at least 1 character'),
    functionType: z.enum(['RUST_WASM']),
    file: z.instanceof(File).optional(),
    outputs: z.string()
})
    .refine(
        (data) => {
            return true;
        },
        {
            message: "Version must be newer than the las one saved",
            path: ["version"],
        }
    )
    .refine(
        (data) => {
            return !hasMiddleSpaces(data.version);
        },
        {
            message: "The version must not contain spaces",
            path: ["version"],
        }
    )
    .refine(
        (data) => {
            return !(!data.file || data.file.name === "");

        },
        {
            message: "Code file is required",
            path: ["file"],
        }
    )
    .refine(
        (data) => {
            let hasSpaces = false;
            const outputs = splitOutputs(data.outputs);
            outputs.forEach(output => {
                if (hasMiddleSpaces(output)) hasSpaces = true;
            });
            return !hasSpaces;
        },
        {
            message: "The outputs must not contain spaces",
            path: ["outputs"],
        }
    )

export default function FunctionEdit() {
  const router = useRouter();
  const id = router.query.id;

  const [functions, setFunctions] = useState<FunctionComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [resultOk, setResultOk] = useState(false);

  //Controls for an id to be passed and loading deactivated
  useEffect(() => {
    setLoading(true);
    getFunctionVersionsComplete(id as string)
        .then(functions => {
          setFunctions(functions);
          setLoading(false);
        })
        .catch(error => console.error(error));
  }, []);

  //Form Data
  const form = useForm<z.infer< typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
          version: '0.1',
          functionType: 'RUST_WASM',
          file: new File([], ""),
          outputs: '',
      }
  });

  const handleSubmit = async (data: z.infer< typeof formSchema>) => {
      setSaveMessage('');
      setIsSaving(true);
      setModalOpen(true);

      // Upload the code file
      let codeId = '';
      try {
          const response = await uploadCodeFile(data.file as File);
          codeId = response.id;
      } catch (err: any) {
          const text = `ERROR: ${err.message as string}`;
          setSaveMessage(text);
          setIsSaving(false);
          return;
      }

      // Create the function in the API
      try {
          const outputs = splitOutputs(data.outputs);
          if (id) //TODO: Throw exception if no id and create update function
              await updateFunction(id.toString(), codeId, data.functionType, data.version.trim(), outputs);

          setSaveMessage('The function has been updated successfully');
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
    <Layout title={`Edit function: ${id}`}>
        {loading && <div className="flex items-center justify-center py-20">
        <Spinner />
        </div>}
        {!loading && functions.length>0 &&<div>
         <Card>
            <CardHeader>
                <CardTitle>General information</CardTitle>
            </CardHeader>
            <CardContent className="max-w-5xl">
              <div className="flex my-3">
                <div className="w-48 font-bold">Id:</div>
                <div className="w-96">{functions[0].id}</div>
              </div>
            </CardContent>
        </Card>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardContent className="max-w-5xl">

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

        <DialogSave
            isOpen={modalOpen}
            title="Saving function"
            description={saveMessage}
            isLoading={isSaving}
            onClose={closeModal}
        />
        </div>}
    </Layout>
  );
}