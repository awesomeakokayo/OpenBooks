import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
