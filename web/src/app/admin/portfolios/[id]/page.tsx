import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PortfolioForm } from "@/components/portfolio-form";

export const dynamic = "force-dynamic";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [portfolio, projects] = await Promise.all([
    prisma.portfolioBuild.findUnique({ where: { id }, include: { items: true } }),
    prisma.project.findMany({ orderBy: { order: "asc" }, include: { awards: { include: { competition: true } } } }),
  ]);
  if (!portfolio) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{portfolio.title}</h1>
      <PortfolioForm
        projects={projects}
        initial={{
          id: portfolio.id,
          slug: portfolio.slug,
          title: portfolio.title,
          targetRole: portfolio.targetRole ?? "",
          targetOrg: portfolio.targetOrg ?? "",
          intro: portfolio.intro ?? "",
          accent: portfolio.accent,
          isPublished: portfolio.isPublished,
          selectedProjectIds: portfolio.items.map((i) => i.projectId),
        }}
      />
    </div>
  );
}
