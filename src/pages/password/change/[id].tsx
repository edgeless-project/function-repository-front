import {useRouter} from "next/router";
import {useSelector} from "react-redux";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {selectRole} from "@/features/account/accountSlice";
import {z} from "zod";
import {hasMiddleSpaces} from "@/utils/general";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import DialogSave from "@/components/utils/DialogSave";
import Layout from "@/components/layout/Layout";
import AccessWarning from "@/components/utils/AccessWarning";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {changePassword} from "@/services/userServices";
const roleAllowed = ['APP_DEVELOPER', 'CLUSTER_ADMIN', 'FUNC_DEVELOPER'];


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


export default function ChangeUserPassword() {

	const router = useRouter();
	const id = router.query.id as string;
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
			password: ''
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
			if (!id) throw new Error('Id not found');
			const res = await changePassword(tokenValue, data.password);
			setSaveMessage(`The user ${res.email} password has been changed successfully`);
			setResultOk(true);
		} catch (err: any) {
			const text = `Can't change password. ${err.message}`;
			setSaveMessage(text);
		}
		setIsSaving(false);
	}

	if (!hasRole)
		return (
			<Layout title="Change password">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		)

	return (
		<Layout title="Change Password">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<Card>
						<CardHeader>
							<CardTitle>Basic information</CardTitle>
						</CardHeader>
						<CardContent className="max-w-5xl">
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