import { useRouter } from 'next/router';

import Layout from "@/components/layout/Layout";

export default function FunctionEdit() {
  const router = useRouter();
  const id = router.query.id;
  
  return (
    <Layout title={`Edit function: ${id}`}>
      <h2>TODO: Edit function</h2>
    </Layout>
  );
}