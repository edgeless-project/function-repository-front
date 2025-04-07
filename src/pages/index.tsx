import Layout from '../components/layout/Layout';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import { useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";

export default function Page() {
  const role = useSelector(selectRole)

  return (
      <Layout title='Dashboard'>
          <div id='home' className="grid grid-cols-3 gap-4">
              {role &&
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
              }
              {(role==="APP_DEVELOPER" || role==="CLUSTER_ADMIN") &&
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
              }
          </div>
      </Layout>
  );
}