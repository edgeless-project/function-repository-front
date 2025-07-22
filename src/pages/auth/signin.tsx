"use client";

import { setSessionAccessToken } from '@/features/account/sessionSlice';
import { getSession, signIn } from 'next-auth/react';
import React, {  } from 'react';
import { useDispatch } from "react-redux";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {useRouter} from 'next/router';

const formSchema = z.object({
	email: z.string().email("The email must be a valid email address"),
	password: z.string()
}).refine((data) => {
	return data.password.length>0
},{
	message: "Password is required",
	path: ["password"]
}).refine((data) => {
	return data.password.length>=8
},{
	message: "Password must be longer than 8 characters",
	path: ["password"]
});

const Signin: React.FC = () => {

	const dispatch = useDispatch();
	const router = useRouter();

	const form = useForm<z.infer< typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		}
	});

	const handleSubmit = async (data: z.infer< typeof formSchema>) => {
		const res = await signIn('credentials', {
			redirect: false,
			email: data.email,
			password: data.password,
			callbackUrl: '/',
		});
		if (res?.ok && res.url) {
			const session = await getSession();
			dispatch(setSessionAccessToken(session?.accessToken as string));
			await router.push(res.url);
		}else {
			form.setError("email", {
				type: "custom",
				message: "",
			});
			form.setError("password", {
				type: "custom",
				message: res? ""+res.error : "An error occurred",
			});
		}
	}

	return (
		<div className="w-full h-svh bg-gray-100 relative">
			<Card className="w-1/4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg">
				<CardHeader className="flex flex-col">
					<div className="flex flex-col items-center p-4 rounded-b-2xl mb-14">
						<img src="/assets/images/logo_edgeless_colorless.svg" alt="Logo" className="w-32 h-32" />
						<div className="text-xl font-semibold">Function repository</div>
					</div>
					<CardTitle className="text-left ml-2">Access your account</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)}>
							<CardContent className="max-w-2xl">
								<FormField
									control={form.control}
									name="email"
									render={({field}) => {
										return (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input type="text" placeholder="email" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										);
									}}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({field}) => {
										return (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input type="password" placeholder="password" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										);
									}}
								/>
							</CardContent>
							<CardFooter className="flex-col max-w-5xl mt-8">
								<Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color w-1/2" type="submit">Log In</Button>
							</CardFooter>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default Signin; 