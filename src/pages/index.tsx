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
      link: "/function"
    },
    "APP_DEVELOPER": {
      title: "Workflow Management",
      description: "Click on this card to access and manage your workflows.",
      link: "/workflow"
    },
    "CLUSTER_ADMIN": {
      title: "Users Management",
      description: "Click on this card to access and manage users.",
      link: "/users"
    }
  }


  return (
      <Layout title='Dashboard'>
          <div id='home' className="grid grid-cols-3 gap-4">
            {Object.entries(cardsData)
            .filter(([],idx) => roleAllowed.indexOf(role) >= idx)
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