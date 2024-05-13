import Layout from '../components/layout/Layout';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
    return (
        <Layout title='Workflow'>
            <div id='home' className="grid grid-cols-3 gap-4">
                <div id="1">
                    <Link href="/function">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Functions Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Click card to access Functions page</p>
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
                                <p>Click card to access Workflow page</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </Layout>
    );
}