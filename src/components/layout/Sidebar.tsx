import Link from 'next/link';

import WorkflowIcon from "@/components/icons/WorkflowIcon";
import FunctionIcon from "@/components/icons/FunctionIcon";
import {useSelector} from "react-redux";
import {selectRole} from "@/features/account/accountSlice";
import UsersIcon from "@/components/icons/UsersIcon";
import APIKeyIcon from "@/components/icons/APIKeyIcon";

export default function Sidebar() {

  const role = useSelector(selectRole);

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <Link href="/">
            <div className="flex justify-items-center h-16 border-b border-gray-200 bg-white">
                <div className="basis-1/2 flex justify-center items-center">
                    <img className="h-14" src="/assets/images/logo_edgeless_alpha_light.png" alt={"Edgeless logo"}/>
                </div>
                <div className="flex justify-start items-center">
                    <span className="text-edgeless-secondary-color font-bold text-xs text-center">Function Repository</span>
                </div>
            </div>
        </Link>

        <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-2 py-4 bg-white">
              {role &&
                  <Link href="/function"
                        className="flex items-center px-4 py-2 text-edgeless-secondary-color hover:bg-gray-300 ">
                    <FunctionIcon className="h-6 w-6 mr-2"/>
                    Functions
                  </Link>
              }
              {(role==="APP_DEVELOPER" || role==="CLUSTER_ADMIN") &&
                  <Link href="/workflow"
                        className="flex items-center px-4 py-2 mt-2 text-edgeless-secondary-color hover:bg-gray-300">
                    <WorkflowIcon className="h-6 w-6 mr-2"/>
                    Workflows
                  </Link>
              }
              {(role==="CLUSTER_ADMIN") &&
                <Link href="/users"
                      className="flex items-center px-4 py-2 mt-2 text-edgeless-secondary-color hover:bg-gray-300">
                  <UsersIcon className="h-6 w-6 mr-2"/>
                  Users
                </Link>
              }
              {role &&
                <Link href="/apikey"
                className="flex items-center px-4 py-2 mt-2 text-edgeless-secondary-color hover:bg-gray-300">
                <APIKeyIcon className="h-6 w-6 mr-2"/>
                API Keys
                </Link>
              }
            </nav>
        </div>
    </div>
  );
};