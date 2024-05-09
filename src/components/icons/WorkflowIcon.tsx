import * as React from "react";

export default function WorkflowIcon (props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      {...props}
    >
      <defs>

        <style>
          {
            ".a{fill:none;stroke:#6e2d9f;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px}"
          }
        </style>
      </defs>
      <circle cx={12} cy={6} r={3} className="a" />
      <rect width={8} height={5} x={2} y={16} className="a" rx={2} />
      <rect width={8} height={5} x={14} y={16} className="a" rx={2} />
      <path d="M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M12 9v3" className="a" />
  </svg>
  );
};