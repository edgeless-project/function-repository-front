import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import Spinner from '@/components/utils/Spinner';
import { Button } from '@/components/ui/button';
import DialogSave from '@/components/utils/DialogSave';
import {date, format} from "@formkit/tempo";
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
import {selectSessionAccessToken} from "@/features/account/sessionSlice";
import {ApiResponseUser} from "@/types/users";
import {deleteUser, getUserById} from "@/services/userServices";
import AccessWarning from "@/components/utils/AccessWarning";

const timeFormatGeneral: string = (process.env.NEXT_PUBLIC_GENERIC_DATA_FORMAT as string);
const roleAllowed = ["CLUSTER_ADMIN"];

export default function WorkflowDelete() {
	const router = useRouter();
	const id = router.query.id as string;

	const [user, setUser] = useState<ApiResponseUser>({} as ApiResponseUser);
	const [isLoading, setIsLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [resultOk, setResultOk] = useState(false);

	const role = useSelector(selectRole);
	const accessToken = useSelector(selectSessionAccessToken);
	const hasRole = roleAllowed.includes(role);


	useEffect(() => {
		setIsLoading(true);
		if (hasRole && accessToken)
			getUserById(accessToken,id)
				.then(u => {
					setUser(u);
					setIsLoading(false);
				})
				.catch(error => console.error(error));
	}, []);

	const handleDelete = async () => {
		setSaveMessage('');
		setIsSaving(true);
		setModalOpen(true);

		// Delete the workflow in the API
		try {
			const resp = await deleteUser(accessToken,id);
			if (resp.count === 0)
				throw new Error(`Error deleting user: ${user.email}`);

			setSaveMessage(`${user.email} has been deleted successfully`);
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

	if (isLoading){
		return (
			<Layout title="Delete User">
				<div className="flex items-center justify-center py-20">
					<Spinner />
				</div>
			</Layout>
		);
	}

	if (!hasRole)
		return (
			<Layout title="Delete User">
				<div className="flex items-center justify-center py-20">
					<AccessWarning role={role}/>
				</div>
			</Layout>
		)

	return (
		<Layout title={`Delete User: ${user.email}`}>
			<div>
				<Card>
					<CardHeader>
              <CardTitle>Basic information</CardTitle>
          </CardHeader>
          <CardContent className="max-w-5xl">
              <div className="flex my-3">
                  <div className="w-48 font-bold">Id:</div>
                  <div className="w-96">{user.id}</div>
              </div>
              <div className="flex my-3">
                  <div className="w-48 font-bold">Email:</div>
                  <div className="w-96">{user.email}</div>
              </div>
              <div className="flex my-3">
                  <div className="w-48 font-bold">role:</div>
                  <div className="w-96">{user.role}</div>
              </div>
              <div className="flex my-3">
                  <div className="w-48 font-bold">Created at:</div>
                  <div className="w-96">{format(date(user.createdAt), timeFormatGeneral,"en")}</div>
              </div>
              <div className="flex my-3">
                  <div className="w-48 font-bold">Updated at:</div>
                  <div className="w-96">{format(date(user.updatedAt), timeFormatGeneral,"en")}</div>
              </div>
          </CardContent>
        </Card>
				<div className="flex justify-between my-8">
					<Button type="button"
					        variant="outline"
					        onClick={() => { router.back() }}
					>Cancel</Button>
					<Button type="button"onClick={handleDelete} className="bg-red-500">Confirm deletion</Button>
				</div>
				<DialogSave
					isOpen={modalOpen}
					title="Deleting user"
					description={saveMessage}
					isLoading={isSaving}
					onClose={closeModal}
				/>
			</div>
		</Layout>
	);
}