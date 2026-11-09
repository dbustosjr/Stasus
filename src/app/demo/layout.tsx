import { AppShell } from "@/components/app-shell";
import { DemoProvider } from "@/components/demo/demo-provider";
import { DemoClientGate } from "@/components/demo/demo-client-gate";

/**
 * Public portfolio demo shell. No auth.
 * Isolated from `/app` live product data paths.
 */
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <AppShell basePath="/demo" demo email="demo@stasus.app" showAdmin={false}>
        <DemoClientGate>{children}</DemoClientGate>
      </AppShell>
    </DemoProvider>
  );
}
