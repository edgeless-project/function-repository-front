import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";
import React, {ChangeEvent, useEffect, useState} from "react";
import {
    getFunction,
    updateFunction,
    uploadCodeFile
} from "@/services/functionServices";
import {FunctionType, FunctionComplete, FunctionTypes} from "@/types/functions";
import Spinner from "@/components/utils/Spinner";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {z} from "zod";
import {hasMiddleSpaces, splitOutputs} from "@/utils/general";
import {ControllerRenderProps, FieldArrayWithId, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import DialogSave from "@/components/utils/DialogSave";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
const roleAllowed = ["APP_DEVELOPER", "CLUSTER_ADMIN", "FUNC_DEVELOPER"];

const TypesOptions = Object.keys(FunctionTypes).filter((item) => {
  return isNaN(Number(item));
});

//Form Schema verification
const formSchema = z.object({
    types: z.array(z.object({functionType: z.string(), file: z.instanceof(File).optional(),})),
    outputs: z.string()
})
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
        if (!type.functionType){
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            received: typeof z.string(),
            message: "File type is required",
            path: [`types.${data.types.indexOf(type)}.functionType`],
          });
        }else if(!(type.functionType in FunctionTypes) || usedTypes.includes(type.functionType)){
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

export default function FunctionEdit() {
  const router = useRouter();
  const id = router.query.id as string;
  const role = useSelector(selectRole);
  const accessToken = useSelector(selectSessionAccessToken);
  const hasRole = roleAllowed.includes(role);

  const [fun, setFunctions] = useState<FunctionComplete>({} as unknown as FunctionComplete);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [resultOk, setResultOk] = useState(false);

  //Form Data
  const form = useForm<z.infer< typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
      types:[{
        functionType: "",
        file: new File([], ""),
      }],
      outputs: fun.outputs? fun.outputs.join(', ') : "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "types",
  });

  //Controls for an id to be loaded from API and loading
  useEffect(() => {
    setLoading(true);
    if (hasRole && accessToken)
      getFunction(id as string, '', accessToken)
          .then(fun => {
            //Set form default values from Docker response and save to global var
            const newFunTypes = fun.function_types.map(t => {return {functionType: t.type, file: new File([], t.code_file_id)}});
            form.setValue('types',newFunTypes);
            form.setValue('outputs',fun.outputs? fun.outputs.join(', ') : "");
            setFunctions(fun);
            setLoading(false);
          })
          .catch(error => console.error(error));
  }, []);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setSaveMessage('');
    setIsSaving(true);
    setModalOpen(true);

    // Upload the code file
    let function_types: FunctionType[] = [];
    const oldFunctionTypes = fun.function_types.map(f => f.type);

    try {
      for (const type of data.types) {
        const find = fun.function_types.find((f) => f.type === type.functionType && f.code_file_id === type.file?.name);
        if (find){ //Load old code
          function_types.push({type: find.type, code_file_id: find.code_file_id});
        }else { //Create new
          const response = await uploadCodeFile(type.file as File, accessToken);
          function_types.push({type: type.functionType, code_file_id: response.id})
        }
      }
    } catch (err: any) {
      const text = `ERROR: ${err.message as string}`;
      setSaveMessage(text);
      setIsSaving(false);
      return;
    }

    // Create the function with an API call
    try {
        const outputs = splitOutputs(data.outputs);

        await updateFunction(id, function_types, fun.version, outputs, accessToken);

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

  const onTypeFileChange = (e:  ChangeEvent<HTMLInputElement>,
                            field: ControllerRenderProps<any, string>,
                            f:  FieldArrayWithId<{   types: {    functionType: string
                                file?: File | undefined   }[]
                              outputs: string }, "types", "id">) => {

    field.onChange(e.target.files ? e.target.files[0] : field.value);
    f.file = e.target.files ? e.target.files[0] : f.file;
  }
  
  return (

    <Layout title={`Edit function: ${id}`}>
      {hasRole && <div>
        {loading && <div className="flex items-center justify-center py-20">
        <Spinner />
        </div>}
        {!loading && fun.id &&<div>
            <Card>
               <CardHeader>
                   <CardTitle>General information</CardTitle>
               </CardHeader>
               <CardContent className="max-w-5xl">
                   <div className="flex my-3">
                       <div className="w-48 font-bold">Id:</div>
                       <div className="w-96">{fun.id}</div>
                   </div>
                   <div className="flex my-3">
                       <div className="w-48 font-bold">Version:</div>
                       <div className="w-96">{fun.version}</div>
                   </div>
               </CardContent>
            </Card>
            <br/>
            <Card>
                <CardHeader>
                    <CardTitle>Function class specification</CardTitle>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <CardContent className="max-w-5xl">
                        <FormItem className={"mt-5"} >
                          <FormLabel>Function types</FormLabel>
                          <Button className="ml-16 bg-edgeless-primary-color" type="button" onClick={()=>{append(
                              {functionType: TypesOptions[0], file: new File([],"")})}
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
                                                <Select onValueChange={(v) => {
                                                  field.onChange(v);
                                                  f.functionType = v;
                                                }} defaultValue={field.value}>
                                                  <FormControl>
                                                    <SelectTrigger
                                                        disabled={f.file?f.file.name!="":false}
                                                    >
                                                      <SelectValue placeholder="Select a type" />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    {TypesOptions.map((v)=> {
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
                                                      disabled={f.file?f.file.name!="":false}
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
                                    <FormItem className="mt-5">
                                        <FormLabel>Outputs</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Outputs" {...field}/>
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
                        <Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" type="submit">Update</Button>
                    </CardFooter>
                </form>
            </Form>
            <DialogSave
                isOpen={modalOpen}
                title="Updating function"
                description={saveMessage}
                isLoading={isSaving}
                onClose={closeModal}
            />
            </Card>
        </div>}
      </div>}
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
          </div>}
    </Layout>
  );
}