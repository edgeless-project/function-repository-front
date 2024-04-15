import Layout from '../components/layout/Layout';
import Flow from '../components/workflowUI/workflowUI';
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";

const goes = () => {
    const root = createRoot(document.getElementById('rootFlow') as HTMLElement);

    root.render(
        <StrictMode>
            <Flow />
        </StrictMode>
    );
}

export default function Page() {
  return (
    <Layout title='Workflow'>
        <div id='rootFlow'/>
        <button onClick={() => {goes()}}>Click me</button>
    </Layout>
  );
}