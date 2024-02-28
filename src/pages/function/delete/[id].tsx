import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";

export default function FunctionDelete() {
  const router = useRouter();
  const id = router.query.id;

  return (
    <Layout title={`Delete function: ${id}`}>
      <h2>TODO: Delete function</h2>
    </Layout>
  );
}