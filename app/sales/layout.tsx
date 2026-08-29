import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
