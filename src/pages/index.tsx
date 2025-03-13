import Layout from '../components/layout/Layout';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import type {AppState, AppDispatch} from "@/app/store";
import Link from "next/link";
import {useSelector} from "react-redux";

export default function Page() {
    const tokenValue = useSelector((state: AppState) => state.session.accessToken);
    console.log("Index",tokenValue)
    return (
        <Layout title='Dashboard'>
            <div id='home' className="grid grid-cols-3 gap-4">
                <div id="1">
                    <Link href="/function">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Functions Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Click on this card to access and manage your functions.</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
                <div id="2">
                    <Link href="/workflow">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Workflow Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Click on this card to access and manage your workflows.</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </Layout>
    );
}