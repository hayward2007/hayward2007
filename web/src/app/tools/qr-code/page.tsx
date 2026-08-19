import { QrCodeTool } from "@/components/tools/qr-code-tool";

export default function QrCodePage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-ai)" }}>
          Tools — QR Code
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Turn a link into a scan.</h1>
        <div className="mt-10">
          <QrCodeTool />
        </div>
      </div>
    </main>
  );
}
