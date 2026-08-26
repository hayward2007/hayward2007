"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Magnetic } from "@/components/magnetic";
import { HeroDiagram } from "@/components/hero-diagram";
import { useDict } from "@/components/locale-provider";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Hero() {
  const dict = useDict();

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="wrap relative z-10">
        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="type-page-kicker mb-6"
          style={{ color: "var(--accent-robotics)" }}
        >
          {dict.hero.eyebrow}
        </motion.p>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="type-page-title max-w-4xl"
        >
          <motion.span variants={fadeUp} className="block">
            {dict.hero.titleTop}
          </motion.span>
          <motion.span variants={fadeUp} className="block" style={{ color: "var(--fg-3)" }}>
            {dict.hero.titleBottom}
          </motion.span>
        </motion.h1>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Magnetic strength={0.22}>
            <Link
              href="/projects"
              data-cursor="View"
              data-physics
              className="type-nav inline-flex h-12 items-center gap-2 rounded-lg px-6 text-sm"
              style={{ background: "var(--fg)", color: "var(--bg)" }}
            >
              {dict.hero.viewProjects}
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
            </Link>
          </Magnetic>
          <Magnetic strength={0.22}>
            <Link
              href="/social"
              data-cursor="true"
              data-physics
              className="type-nav inline-flex h-12 items-center gap-2 rounded-lg border px-6 text-sm"
              style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
            >
              <Mail aria-hidden="true" size={16} strokeWidth={1.8} />
              {dict.hero.getInTouch}
            </Link>
          </Magnetic>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 border-t pt-10 md:grid-cols-3" style={{ borderColor: "var(--line)" }}>
          {dict.hero.roles.map((item, i) => (
            <motion.div
              key={item.label}
              data-physics
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: "var(--bg)" }}
            >
              <h2 className="type-index text-sm" style={{ color: "var(--accent-robotics)" }}>
                {String(i + 1).padStart(2, "0")}
              </h2>
              <p className="type-card-title mt-2 text-lg">{item.label}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <HeroDiagram />
    </section>
  );
}
