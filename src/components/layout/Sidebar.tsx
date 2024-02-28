import Link from 'next/link';

import WorkflowIcon from "@/components/icons/WorkflowIcon";
import FunctionIcon from "@/components/icons/FunctionIcon";

export default function Sidebar() {
  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <Link href="/">
          <span className="text-white font-bold">EDGELESS Function Repository</span>
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-800">
          <Link href="/function" className="flex items-center px-4 py-2 text-gray-100 hover:bg-gray-700">
            <FunctionIcon className="h-6 w-6 mr-2" />
            Functions
          </Link>
          <Link href="/workflow" className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700">
              <WorkflowIcon className="h-6 w-6 mr-2" />
              Workflows
          </Link>
        </nav>
      </div>
    </div>
  );
};