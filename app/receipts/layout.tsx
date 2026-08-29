import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function ReceiptsLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
