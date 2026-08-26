import { UnitConverterTool } from "@/components/tools/unit-converter-tool";

export default function UnitConverterPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
          Tools — Unit Converter
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Angle, length, mass, torque.</h1>
        <div className="mt-12">
          <UnitConverterTool />
        </div>
      </div>
    </main>
  );
}
