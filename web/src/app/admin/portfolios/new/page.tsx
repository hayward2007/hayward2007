import { prisma } from "@/lib/prisma";
import { PortfolioForm } from "@/components/portfolio-form";

export const dynamic = "force-dynamic";

export default async function NewPortfolioPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: { awards: { include: { competition: true } } },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New portfolio</h1>
      <PortfolioForm projects={projects} />
    </div>
  );
}
