import { QrCodeTool } from "@/components/tools/qr-code-tool";

export default function QrCodePage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
          Tools — QR Code
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Turn a link into a scan.</h1>
        <div className="mt-12">
          <QrCodeTool />
        </div>
      </div>
    </main>
  );
}
