import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface AccessWarningProps {
	role: string;
}

export default function AccessWarning({role}: AccessWarningProps) {

	return (
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
	);
}