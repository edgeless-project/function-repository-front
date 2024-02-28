import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";

export default function WorkflowDelete() {
  const router = useRouter();
  const name = router.query.name;

  return (
    <Layout title={`Delete workflow: ${name}`}>
      <h2>TODO: Delete workflow</h2>
    </Layout>
  );
}