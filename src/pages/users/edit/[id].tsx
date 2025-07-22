import {useRouter} from "next/router";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole} from "@/features/account/accountSlice";
import {z} from "zod";
import {hasMiddleSpaces} from "@/utils/general";
import {useEffect, useState} from "react";
import {UserDTO} from "@/types/users";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import DialogSave from "@/components/utils/DialogSave";
import Layout from "@/components/layout/Layout";
import AccessWarning from "@/components/utils/AccessWarning";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {getUserById, updateUser} from "@/services/userServices";
import Spinner from "@/components/utils/Spinner";
import {User} from "@/types/account";


const roleOptions = ['APP_DEVELOPER', 'CLUSTER_ADMIN', 'FUNC_DEVELOPER'] as const;
const roleAllowed = ["CLUSTER_ADMIN"];


const formSchema = z.object({
	email: z.string().email('The email must be a valid email address'),
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


export default function EditUser() {

	const router = useRouter();
	const id = router.query.id as string;
	const tokenValue = useSelector(selectSessionAccessToken);
	const role = useSelector(selectRole);
	const hasRole = roleAllowed.includes(role);

	const [user, setUser] = useState<UserDTO>({} as UserDTO);
	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [resultOk, setResultOk] = useState(false);
	const [isLoading, setIsLoading] = useState(true);


	const form = useForm<z.infer< typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			role: 'FUNC_DEVELOPER',
		}
	});
	
	useEffect(() => {
		if (tokenValue && hasRole) {
			setIsLoading(true);
			getUserById(tokenValue, id).then(r => {
				const userData = {
					id: r.id,
					email: r.email,
					password: '',
					role: r.role
				};
				setUser(userData);
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
			const userData: User = {
				email: data.email,
				role: data.role
			}
			if (!user.id) throw new Error('Id not found');
			const res = await updateUser(tokenValue, user.id, userData);
			setSaveMessage(`The user ${res.email} has been updated successfully`);
			setResultOk(true);
		} catch (err: any) {
			const text = `User not updated. ${err.message as string}`;
			setSaveMessage(text);
		}
		setIsSaving(false);
	}

	if (isLoading){
		return (
			<Layout title="Update User ">
				<div className="flex items-center justify-center py-20">
					<Spinner />
				</div>
			</Layout>
		);
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
		<Layout title="Update User">
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
						<Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" type="submit">Save</Button>
					</div>
				</form>
			</Form>

			<DialogSave
				isOpen={modalOpen}
				title="Updating user"
				description={saveMessage}
				isLoading={isSaving}
				onClose={closeModal}/>
		</Layout>
	);
}