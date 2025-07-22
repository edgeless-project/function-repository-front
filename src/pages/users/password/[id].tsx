import {useRouter} from "next/router";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole} from "@/features/account/accountSlice";
import {z} from "zod";
import {hasMiddleSpaces} from "@/utils/general";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import DialogSave from "@/components/utils/DialogSave";
import Layout from "@/components/layout/Layout";
import AccessWarning from "@/components/utils/AccessWarning";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {changeUserPassword, getUserById} from "@/services/userServices";
import Spinner from "@/components/utils/Spinner";


const roleOptions = ['APP_DEVELOPER', 'CLUSTER_ADMIN', 'FUNC_DEVELOPER'] as const;
const roleAllowed = ['CLUSTER_ADMIN'];


const formSchema = z.object({
	email: z.string().optional(),
	password: z.string().min(8, 'The password must contain at least 8 characters'),
	role: z.string().optional()
})
	.refine((data) => {
			return !hasMiddleSpaces(data.password);
		},
		{
			message: "The password must not contain spaces",
			path: ["password"],
		}
	);


export default function SetUserPassword() {

	const router = useRouter();
	const id = router.query.id as string;
	const tokenValue = useSelector(selectSessionAccessToken);
	const role = useSelector(selectRole);
	const hasRole = roleAllowed.includes(role);

	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [resultOk, setResultOk] = useState(false);
	const [isLoading, setIsLoading] = useState(true);


	const form = useForm<z.infer< typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
			role: 'FUNC_DEVELOPER',
		}
	});

	useEffect(() => {
		if (tokenValue && hasRole) {
			setIsLoading(true);
			getUserById(tokenValue, id).then(r => {
				form.setValue('email', r.email);
				form.setValue('role', roleOptions.includes(r.role as any) ? r.role : 'FUNC_DEVELOPER' as any);
				setIsLoading(false);
			})
		}
	},[id, form, hasRole, tokenValue]);

	const closeModal = () => {
		if (resultOk) {
			router.back();
		}
		setModalOpen(false);
	};

	const handleSubmit = async (data: z.infer< typeof formSchema>) => {
		setSaveMessage('');
		setIsSaving(true);
		setModalOpen(true);

		//Create user
		try {
			if (!id) throw new Error('Id not found');
			const res = await changeUserPassword(tokenValue, id, data.password);
			setSaveMessage(`The user ${res.email} password has been updated successfully`);
			setResultOk(true);
		} catch (err: any) {
			const text = `Can't change password. ${err.message}`;
			setSaveMessage(text);
		}
		setIsSaving(false);
	}

	if (isLoading){
		return (
			<Layout title="Update user password">
				<div className="flex items-center justify-center py-20">
					<Spinner />
				</div>
			</Layout>
		);
	}

	if (!hasRole)
		return (
			<Layout title="Update user password">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		)

	return (
		<Layout title="Update user password">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<Card>
						<CardHeader>
							<CardTitle>Basic information</CardTitle>
						</CardHeader>
						<CardContent className="max-w-5xl">
							<FormField
								control={form.control}
								name="email"
								disabled={true}
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
								render={({field}) =>{
									return (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input type="password" placeholder="Password" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
							<FormField
								control={form.control}
								name="role"
								disabled={true}
								render={({field}) =>{
									return (
										<FormItem>
											<FormLabel>Role</FormLabel>
											<FormControl>
												<select {...field} className="border rounded px-3 py-2 w-full">
													{roleOptions.map((r) => (
														<option key={r} value={r}>{r.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
													))}
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</CardContent>
					</Card>
					<div className="flex justify-between my-8">
						<Button
							type="button"
							variant="outline"
							onClick={() => { router.back() }}
						>Cancel</Button>
						<Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" type="submit">Change password</Button>
					</div>
				</form>
			</Form>

			<DialogSave
				isOpen={modalOpen}
				title="Changing password"
				description={saveMessage}
				isLoading={isSaving}
				onClose={closeModal}/>
		</Layout>
	);
}