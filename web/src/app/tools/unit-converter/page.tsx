import { UnitConverterTool } from "@/components/tools/unit-converter-tool";

export default function UnitConverterPage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-ai)" }}>
          Tools — Unit Converter
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Angle, length, mass, torque.</h1>
        <div className="mt-10">
          <UnitConverterTool />
        </div>
      </div>
    </main>
  );
}
