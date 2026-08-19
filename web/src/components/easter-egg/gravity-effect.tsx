"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

// Only elements a component explicitly opts into (by setting data-physics)
// participate — a blind tag-selector sweep used to pick up nested/overlapping
// fragments that jammed against each other.
const SELECTOR = "main [data-physics]";
const MAX_BODIES = 60;
const INSET = 10; // shrink each body so adjacent grid cells never spawn touching/overlapped
const FLY_BACK_MS = 600;

type Pair = { el: HTMLElement; body: Matter.Body; w: number; h: number; left: number; top: number; restTicks: number };

export function GravityEffect({ closing, onFinished }: EasterEggEffectProps) {
  const savedStyles = useRef<Map<HTMLElement, string>>(new Map());
  const runtimeRef = useRef<{ runner: Matter.Runner; pairs: Pair[] } | null>(null);
  const closingRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const all = Array.from(main.querySelectorAll<HTMLElement>(SELECTOR));
    // Safety net: if a tagged element is nested inside another tagged element,
    // keep only the outer one so we never spawn two overlapping bodies for one item.
    // Also skip anything far outside the current viewport — a long page can have
    // tagged elements well below the fold, and dropping those invisibly is just
    // wasted simulation (and a source of "why did things end up so far away" confusion).
    const viewportH = window.innerHeight;
    const targets = all
      .filter((el) => !all.some((other) => other !== el && other.contains(el)))
      .filter((el) => el.offsetWidth > 4 && el.offsetHeight > 4)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > -viewportH && r.top < viewportH * 2;
      })
      .slice(0, MAX_BODIES);

    if (targets.length === 0) {
      onFinishedRef.current();
      return;
    }

    const savedMap = savedStyles.current;
    const engine = Matter.Engine.create();
    engine.positionIterations = 10;
    engine.velocityIterations = 10;
    const world = engine.world;

    const width = window.innerWidth;
    const height = window.innerHeight;
    // Thick colliders: extra insurance against tunneling on top of the fixed timestep.
    const ground = Matter.Bodies.rectangle(width / 2, height + 100, width * 3, 200, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-100, height / 2, 200, height * 3, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(width + 100, height / 2, 200, height * 3, { isStatic: true });
    Matter.Composite.add(world, [ground, leftWall, rightWall]);

    // Pass 1: measure every target BEFORE mutating any of them. Pulling an
    // earlier element out of flow (position: fixed) reflows its siblings, so
    // measuring-then-mutating in a single loop corrupted later elements'
    // rects — that was the source of the "jammed"/oversized bodies.
    const measured = targets.map((el) => ({ el, rect: el.getBoundingClientRect() }));

    const pairs: Pair[] = [];

    // A `position: fixed` descendant is positioned relative to the nearest ancestor
    // that establishes a containing block, not the viewport — which per spec includes
    // any ancestor with a `transform` other than none (Reveal/TiltCard leave one inline
    // even at rest, e.g. rotateX(0)/translateY(0)) AND, independently, any ancestor with
    // `transform-style: preserve-3d` (TiltCard sets this permanently for its own tilt,
    // with no `transform` involved at all). Missing that second trigger is exactly what
    // let TiltCard-wrapped cards keep re-basing onto their own page position instead of
    // the viewport. Neutralize both up to <main> so position:fixed here means what it's
    // supposed to mean.
    function neutralizeAncestorTransforms(el: HTMLElement) {
      let node = el.parentElement;
      while (node && node !== main) {
        const style = getComputedStyle(node);
        if (!savedMap.has(node) && (style.transform !== "none" || style.transformStyle === "preserve-3d")) {
          savedMap.set(node, node.getAttribute("style") || "");
          node.style.transform = "none";
          node.style.transformStyle = "flat";
        }
        node = node.parentElement;
      }
    }

    // Pass 2: now that every rect is known, create bodies and detach elements.
    measured.forEach(({ el, rect }, i) => {
      const w = Math.max(4, rect.width - INSET * 2);
      const h = Math.max(4, rect.height - INSET * 2);
      neutralizeAncestorTransforms(el);
      savedMap.set(el, el.getAttribute("style") || "");

      const body = Matter.Bodies.rectangle(rect.left + rect.width / 2, rect.top + rect.height / 2, w, h, {
        restitution: 0.3,
        friction: 0.6,
        frictionAir: 0.012,
        chamfer: { radius: Math.min(6, h / 4) },
      });
      // Tiny per-item stagger so perfectly-aligned neighbors don't start in a
      // dead-even stack — deliberately small so it can't itself cause a launch.
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
      Matter.Body.setVelocity(body, { x: 0, y: i * 0.01 });
      Matter.Composite.add(world, body);
      pairs.push({ el, body, w: rect.width, h: rect.height, left: rect.left, top: rect.top, restTicks: 0 });

      el.style.position = "fixed";
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.margin = "0";
      el.style.zIndex = "400";
      el.style.transformOrigin = "center";
      el.style.willChange = "transform";
    });

    // Custom drag instead of Matter.MouseConstraint: the built-in constraint grabs
    // and starts pulling a body the instant mousedown lands on it, which displaces the
    // element enough between mousedown and mouseup that the browser never synthesizes a
    // click — silently breaking "click still does its normal thing" for every tagged
    // link/button. Only start actually moving a body once the pointer has traveled past
    // a small threshold, so a plain click never touches physics at all.
    const DRAG_THRESHOLD = 6;
    let dragBody: Matter.Body | null = null;
    let dragOffset = { x: 0, y: 0 };
    let dragStart = { x: 0, y: 0 };
    let dragging = false;
    let lastPoint = { x: 0, y: 0 };
    let lastVelocity = { x: 0, y: 0 };

    function bodyAtPoint(point: { x: number; y: number }) {
      const found = Matter.Query.point(
        pairs.map((p) => p.body),
        point,
      );
      return found[0] ?? null;
    }

    function onMouseDown(e: MouseEvent) {
      if (closingRef.current) return;
      const point = { x: e.clientX, y: e.clientY };
      const hit = bodyAtPoint(point);
      if (!hit) return;
      dragBody = hit;
      dragStart = point;
      lastPoint = point;
      lastVelocity = { x: 0, y: 0 };
      dragOffset = { x: point.x - hit.position.x, y: point.y - hit.position.y };
      dragging = false;
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragBody) return;
      const point = { x: e.clientX, y: e.clientY };
      if (!dragging && Math.hypot(point.x - dragStart.x, point.y - dragStart.y) < DRAG_THRESHOLD) return;
      dragging = true;
      lastVelocity = { x: point.x - lastPoint.x, y: point.y - lastPoint.y };
      lastPoint = point;
      Matter.Body.setPosition(dragBody, { x: point.x - dragOffset.x, y: point.y - dragOffset.y });
      Matter.Body.setAngularVelocity(dragBody, 0);
    }

    function suppressNextClick(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
    }

    function onMouseUp() {
      if (dragBody && dragging) {
        // Toss it on release using the last bit of drag movement, so letting go mid-swing
        // feels like actually throwing the card rather than just dropping it dead.
        Matter.Body.setVelocity(dragBody, { x: lastVelocity.x * 1.6, y: lastVelocity.y * 1.6 });
        // The card is dropped right back under the cursor, so the browser is about to
        // synthesize a click on it from this same mouseup — without this it would also
        // navigate immediately after every drag, which isn't what dragging is for.
        window.addEventListener("click", suppressNextClick, { capture: true, once: true });
      }
      dragBody = null;
      dragging = false;
    }

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const MAX_SPEED = 90; // px/step — clamps runaway impulses without fighting normal overlap-separation forces

    function syncTransforms() {
      // Frozen the instant a close was requested — the fly-back effect takes
      // over writing these same transforms via a CSS transition instead.
      if (closingRef.current) return;
      pairs.forEach((pair) => {
        const { el, body, w, h } = pair;
        // Prevent tunneling at the source: an overlap-resolution impulse can otherwise
        // spike a body's velocity high enough to skip clean through a thin collider.
        const speed = Math.hypot(body.velocity.x, body.velocity.y);
        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          Matter.Body.setVelocity(body, { x: body.velocity.x * scale, y: body.velocity.y * scale });
        }

        // Safety net: nothing should ever end up outside the walled play area — if it
        // does anyway, teleport it back to a safe resting spot instead of leaving it
        // to fall/drift off-screen forever.
        const outOfBounds =
          body.position.y > height + 60 ||
          body.position.y < -height ||
          body.position.x < -60 ||
          body.position.x > width + 60;
        if (outOfBounds) {
          Matter.Body.setPosition(body, { x: width / 2 + (Math.random() - 0.5) * width * 0.6, y: height * 0.3 });
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(body, 0);
        }

        // Once a body is genuinely still, stop rewriting its transform every frame.
        // A "resting" body isn't actually motionless — the solver keeps nudging it by
        // fractions of a pixel to hold contact — and continuously restamping the style
        // during that nudge is exactly what can make a real mousedown/mouseup pair land
        // on two different sub-pixel positions and silently fail to register as a click.
        // A body being actively dragged is moved via setPosition (not velocity), so it
        // must always be exempted here or its transform would freeze mid-drag.
        const quiescent =
          !outOfBounds && body !== dragBody && speed < 0.06 && Math.abs(body.angularVelocity) < 0.0006;
        pair.restTicks = quiescent ? pair.restTicks + 1 : 0;
        if (pair.restTicks > 5) return;

        el.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
      });
    }
    Matter.Events.on(engine, "afterUpdate", syncTransforms);

    // Explicit fixed delta per internal update step: without it, a rendering hiccup
    // (tab backgrounded, dropped frame) can widen the runner's frame-delta estimate
    // enough for a fast body to tunnel through the thin ground/wall colliders.
    const runner = Matter.Runner.create({ delta: 1000 / 60 });
    Matter.Runner.run(runner, engine);
    runtimeRef.current = { runner, pairs };

    function onResize() {
      Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 100 });
      Matter.Body.setPosition(leftWall, { x: -100, y: window.innerHeight / 2 });
      Matter.Body.setPosition(rightWall, { x: window.innerWidth + 100, y: window.innerHeight / 2 });
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      Matter.Events.off(engine, "afterUpdate", syncTransforms);
      Matter.Runner.stop(runner);
      Matter.Composite.clear(world, false);
      Matter.Engine.clear(engine);
      runtimeRef.current = null;

      savedMap.forEach((style, el) => {
        if (style) el.setAttribute("style", style);
        else el.removeAttribute("style");
      });
      savedMap.clear();
    };
  }, []);

  useEffect(() => {
    closingRef.current = closing;
    if (!closing) return;
    const runtime = runtimeRef.current;
    if (!runtime) {
      // Nothing ever spawned (e.g. no eligible elements) — finish immediately.
      onFinishedRef.current();
      return;
    }
    Matter.Runner.stop(runtime.runner);
    // Fly every displaced element back to exactly where it started, then let
    // the mount effect's cleanup (triggered once the parent unmounts us after
    // onFinished) snap its inline style back to the untouched original —
    // invisible, since by then it's already sitting at that exact spot.
    runtime.pairs.forEach(({ el, left, top }) => {
      el.style.transition = `transform ${FLY_BACK_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      el.style.pointerEvents = "none";
      el.style.transform = `translate(${left}px, ${top}px) rotate(0deg)`;
    });
    const t = setTimeout(() => onFinishedRef.current(), FLY_BACK_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
