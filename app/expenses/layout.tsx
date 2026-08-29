import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
