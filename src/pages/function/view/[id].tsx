import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";

export default function FunctionView() {
  const router = useRouter();
  const id = router.query.id;

  return (
    <Layout title={`View function: ${id}`}>
      <h2>TODO: View function</h2>
    </Layout>
  );
}