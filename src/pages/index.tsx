import Layout from '../components/layout/Layout';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import { useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";

export default function Page() {
	const role = useSelector(selectRole)
	const roleAllowed = [ "FUNC_DEVELOPER", "APP_DEVELOPER", "CLUSTER_ADMIN"];

	const cardsData = {

		"FUNC_DEVELOPER": {
			title: "Functions Management",
			description: "Click on this card to access and manage your functions.",
			link: "/function",
			rolesAllowed: ["FUNC_DEVELOPER", "APP_DEVELOPER", "CLUSTER_ADMIN"]
		},
		"APP_DEVELOPER": {
			title: "Workflow Management",
			description: "Click on this card to access and manage your workflows.",
			link: "/workflow",
			rolesAllowed: ["APP_DEVELOPER", "CLUSTER_ADMIN"]
		},
		"CLUSTER_ADMIN": {
			title: "Users Management",
			description: "Click on this card to access and manage users.",
			link: "/users",
			rolesAllowed: ["CLUSTER_ADMIN"]
		},
		"API_KEY": {
			title: "API Keys Management",
			description: "Click on this card to access and manage your API keys.",
			link: "/apikey",
			rolesAllowed: ["CLUSTER_ADMIN", "APP_DEVELOPER", "FUNC_DEVELOPER"]
		}
	}

	return (
		<Layout title='Dashboard'>
			<div id='home' className="grid grid-cols-3 gap-4">
				{Object.entries(cardsData)
					.filter(([,card],) => card.rolesAllowed.includes(role))
					.map(([key, card], idx) => (
						<div key={key} id={idx.toString()}>
							<Link href={card.link}>
								<Card>
									<CardHeader>
										<CardTitle className="text-center">{card.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<p>{card.description}</p>
									</CardContent>
								</Card>
							</Link>
						</div>
					))}
			</div>
		</Layout>
	);
}