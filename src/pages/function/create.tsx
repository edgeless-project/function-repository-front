"use client";

import {ChangeEvent, useState} from "react";
import { z } from "zod";
import {ControllerRenderProps, FieldArrayWithId, useFieldArray, useForm} from "react-hook-form";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createFunction, uploadCodeFile } from "@/services/functionServices";
import { hasMiddleSpaces, splitOutputs } from "@/utils/general";
import DialogSave from "@/components/utils/DialogSave";
import { FunctionTypes } from "@/types/functions";
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";

const functionTypesOptions = Object.keys(FunctionTypes).filter((item) => {
  return isNaN(Number(item));
});

const formSchema = z.object({
  id: z.string().min(3, 'The Id must contain at least 3 characters'),
  version: z.string().min(1, 'The version must contain at least 1 character'),
  types: z.array(z.object({functionType: z.string(), file: z.instanceof(File).optional(),})), //z.enum(['RUST_WASM','RUST_WASM1','RUST_WASM2']
  outputs: z.string()
})
.refine(
  (data) => {
    return !hasMiddleSpaces(data.id);
  },
  {
    message: "The id must not contain spaces",
    path: ["id"],
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
.superRefine(
    (data,ctx) => {
      let usedTypes : string[] = [];
      for (let type of data.types) {
        if (!type.file || type.file.name === ""){
          ctx.addIssue({
            code: "invalid_type",
            expected: "object",
            received: typeof type.file,
            message: "Code file is required",
            path: [`types.${data.types.indexOf(type)}.file`],
          });
        }
        if (!type.functionType){
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            received: typeof z.string(),
            message: "File type is required",
            path: [`types.${data.types.indexOf(type)}.functionType`],
          });
        }else if(!functionTypesOptions.includes(type.functionType) || usedTypes.includes(type.functionType)){
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            received: typeof z.string(),
            message: "Selection of an available file type is required",
            path: [`types.${data.types.indexOf(type)}.functionType`],
          });
        }else{
          usedTypes.push(type.functionType);
        }
      }
    }
);

const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN", "FUNC_DEVELOPER"];

export default function FunctionCreate() {
  const router = useRouter();
  const accessToken = useSelector(selectSessionAccessToken);
  const role = useSelector(selectRole);
  const hasRole = roleAllowed.includes(role);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [resultOk, setResultOk] = useState(false);

  const form = useForm<z.infer< typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      version: '0.1',
      types: [{
        functionType: functionTypesOptions[0],
        file: new File([], "")
      }],
      outputs: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "types",
  });

  const handleSubmit = async (data: z.infer< typeof formSchema>) => {
    setSaveMessage('');
    setIsSaving(true);
    setModalOpen(true);

    let storeTypes: { type:string,  code_file_id: string }[] = [];
    for (const t of data.types) {
      // Upload the code file
      let codeId = '';
      try {
        const response = await uploadCodeFile(t.file as File, accessToken);
        codeId = response.id;
        storeTypes.push({type: t.functionType, code_file_id: codeId});
      } catch (err: any) {
        const text = `ERROR: ${err.message as string}`;
        setSaveMessage(text);
        setIsSaving(false);
      }
    }

    // Create the function in the API
    try {
      const outputs = splitOutputs(data.outputs);
      await createFunction(data.id.trim(), storeTypes, data.version.trim(), outputs, accessToken);
      setSaveMessage('The function has been created successfully');
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

  const onTypeFileChange = (e:  ChangeEvent<HTMLInputElement>,
                            field: ControllerRenderProps<any, string>,
                            f:  FieldArrayWithId<{   types: {    functionType: string
                                file?: File | undefined   }[]
                              outputs: string }, "types", "id">) => {

    field.onChange(e.target.files ? e.target.files[0] : field.value);
    f.file = e.target.files ? e.target.files[0] : f.file;
  }

  const onChangeFunctionType = (type: string,
                                field: ControllerRenderProps<any, string>,
                                f:  FieldArrayWithId<{   types: {    functionType: string
                                    file?: File | undefined   }[]
                                  outputs: string }, "types", "id">) => {
    field.onChange(type);
    f.functionType = type;

  }

  return (
    <Layout title="Create function">
      {hasRole &&
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
            <FormItem className={"mt-5"} >
              <FormLabel>Function types</FormLabel>
              <Button className="ml-16 bg-edgeless-primary-color" type="button" onClick={()=>{append(
                  {functionType: functionTypesOptions[0], file: new File([],"")})}
              }>+ Add Type</Button>
            </FormItem>
            <FormMessage />
            <CardContent style={{ margin: 10 }}>
              {fields.map((f, i) => {
                return (
                    <Card key={f.id} className="my-6 pt-4 border-2">
                      <CardContent className="">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                                className="float-right mb-4 size-6 rounded bg-red-500 text-white"
                                type="button"
                                onClick={()=>remove(i)}>
                              -
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Type</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <FormField
                          control={form.control}
                          name = {`types.${i}.functionType`}
                          render={({field}) => {
                            return (
                                <FormItem className="">
                                  <FormLabel>Function type</FormLabel>
                                  <Select onValueChange={
                                    (v) => onChangeFunctionType(v, field, f)}
                                          defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {functionTypesOptions.map((v)=> {
                                        return(
                                            <SelectItem key={v} value = {v}>{v}</SelectItem>
                                        )})}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                            );
                          }}
                        />
                        <FormField
                            control={form.control}
                            name= {`types.${i}.file`}
                            render={({field}) => {
                              return (
                                  <FormItem className="mt-5">
                                    <FormLabel>Code file</FormLabel>
                                    <FormControl>
                                      <Input
                                          type="file"
                                          onChange={(e) => onTypeFileChange(e, field, f)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              );}
                            }
                        />
                      </CardContent>
                    </Card>
                );
              })}
            </CardContent>
            <FormField
              control={form.control}
              name="outputs"
              render={({field}) => {
                return (
                  <FormItem className="mt-1">
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
                type="button"
                variant="outline"
                onClick={() => { router.back() }}
              >Cancel</Button>
              <Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" type="submit">Create</Button>
            </CardFooter>
          </form>
        </Form>
        <DialogSave
          isOpen={modalOpen}
          title="Saving function"
          description={saveMessage}
          isLoading={isSaving}
          onClose={closeModal}/>
      </Card>}
      {!hasRole &&
          <div className="flex items-center justify-center py-20">
            <Card className="w-1/3">
              <CardHeader>
                <CardTitle className="text-center">Access Denied</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <svg className="w-32 h-32 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"></path>
                  </svg>
                  <p className="text-center">You do not have the necessary permissions to view this page.</p>
                  <p className="text-center">You are currently logged in as {role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}.</p>
                </div>
              </CardContent>
            </Card>
          </div>
      }
    </Layout>
  );
}