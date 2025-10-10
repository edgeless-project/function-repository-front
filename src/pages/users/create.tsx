import Layout from "@/components/layout/Layout";
import AccessWarning from "@/components/utils/AccessWarning";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole} from "@/features/account/accountSlice";
import {z} from "zod";
import {hasMiddleSpaces} from "@/utils/general";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {router} from "next/client";
import DialogSave from "@/components/utils/DialogSave";
import {createUser} from "@/services/userServices";
import {UserDTO} from "@/types/users";

const roleOptions = ['APP_DEVELOPER', 'CLUSTER_ADMIN', 'FUNC_DEVELOPER'] as const;
const roleAllowed = ["CLUSTER_ADMIN"];

const formSchema = z.object({
	email: z.string().email('The email must be a valid email address'),
	password: z.string().min(8, 'The password must contain at least 8 characters'),
	role: z.enum(roleOptions)
})
	.refine((data) => {
			return !hasMiddleSpaces(data.email);
		},
		{
			message: "The name must not contain spaces",
			path: ["email"],
		}
	).refine((data) => {
		return roleOptions.includes(data.role)
	},{
		message: "The role is not valid",
		path: ["role"]
	});


export default function CreateUser() {

	const tokenValue = useSelector(selectSessionAccessToken);
	const role = useSelector(selectRole);
	const hasRole = roleAllowed.includes(role);

	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [resultOk, setResultOk] = useState(false);

	const form = useForm<z.infer< typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
			role: 'FUNC_DEVELOPER',
		}
	});

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
			const userData: UserDTO = {
				email: data.email,
				password: data.password,
				role: data.role
			}

			const res = await createUser(tokenValue, userData);
			setSaveMessage(`The user ${res.email} has been created successfully`);
			setResultOk(true);
		} catch (err: any) {
			const text = `User not created: ${err.message as string}`;
			setSaveMessage(text);
		}
		setIsSaving(false);
	}

	if (!hasRole)
		return (
			<Layout title="Create User">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		)

	return (
		<Layout title="Create User">
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
						<Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" type="submit">Create</Button>
					</div>
				</form>
			</Form>

			<DialogSave
				isOpen={modalOpen}
				title="Creating user"
				description={saveMessage}
				isLoading={isSaving}
				onClose={closeModal}/>
		</Layout>
	);
}