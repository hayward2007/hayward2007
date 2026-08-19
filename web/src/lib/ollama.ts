// Local-LLM summarization for Notion-synced content, called from
// src/lib/notion.ts during syncFromNotion. Runs against the same Ollama
// instance used by scripts/curation-worker.mts, but that script stays a
// standalone process outside the Next app — this module is the in-app-runtime
// counterpart, used for projects/competitions/activities instead of blog posts.

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct";
const CALL_TIMEOUT_MS = 45_000;

export type SummarizeKind = "project" | "competition" | "activity";

type SummarizeResult = { summaryHtml: string; tags: string[] };

const KIND_LABEL: Record<SummarizeKind, string> = {
  project: "개인 포트폴리오의 프로젝트",
  competition: "개인 포트폴리오의 대회/공모전 참가 기록",
  activity: "개인 포트폴리오의 대외 활동 기록",
};

function systemPrompt(kind: SummarizeKind, needsTags: boolean): string {
  return `당신은 로보틱스/피지컬 AI를 전공하는 학생의 개인 포트폴리오 사이트를 정리하는 담당 에디터입니다.
사용자가 주는 내용은 ${KIND_LABEL[kind]}에 대해 노션(Notion) 페이지에서 그대로 가져온 원문입니다.
반드시 아래 형식의 JSON 객체 하나만 출력하세요. 그 외의 텍스트, 마크다운 코드 블록, 설명은 절대 포함하지 마세요.

{
  "summary": string[]${needsTags ? ",\n  \"tags\": string[]" : ""}
}

- summary: 2~4개의 한국어 문단. 각 문단은 완전한 문장으로 구성하고, 문단마다 다른 문장 구조를 쓰세요.
${needsTags ? '- tags: 1~4개의 짧은 한글 키워드 (예: "로보틱스", "임베디드", "강화학습"). 원문에 실제로 드러나는 내용만 반영하세요.\n' : ""}
규칙:
- 원문에 없는 사실, 수치, 결과를 지어내지 마세요.
- 원문이 짧거나 정보가 부족하면 그 사실을 솔직히 반영해 짧게 쓰세요 — 없는 내용을 부풀리지 마세요.
- "이것은 ~입니다" 같은 뻔한 문장을 반복하지 말고, 차분하고 자연스러운 에디터의 어투로 쓰세요.
- 1인칭으로 본인이 직접 겪은 것처럼 쓰지 말고, 3인칭 관찰자 시점으로 서술하세요.
- 순수 한글로만 쓰고, 흔히 쓰는 한자어라도 한자(漢字) 표기를 섞지 마세요.
- JSON 객체 외의 어떤 텍스트도 출력하지 마세요.`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Summarizes a Notion page's flattened body text into a short Korean
 * write-up, and — only when `existingTags` is empty — proposes tags. Returns
 * null on any failure/timeout so a single bad page can never abort a sync.
 */
export async function summarizeNotionContent(
  kind: SummarizeKind,
  name: string,
  rawText: string,
  existingTags: string[],
): Promise<SummarizeResult | null> {
  const trimmed = rawText.trim();
  if (!trimmed) return null;
  const needsTags = existingTags.length === 0;
  const userMessage = `이름: ${name}\n\n원문:\n${trimmed.slice(0, 6000)}`;

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: systemPrompt(kind, needsTags) },
          { role: "user", content: userMessage },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Ollama request failed: ${res.status} ${await res.text()}`);

    const data = (await res.json()) as { message?: { content?: string } };
    const raw = data.message?.content;
    if (!raw) throw new Error("Ollama returned no message content");

    const parsed = JSON.parse(raw) as { summary?: unknown; tags?: unknown };
    const paragraphs = Array.isArray(parsed.summary)
      ? parsed.summary.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      : [];
    if (paragraphs.length === 0) throw new Error(`Ollama returned no summary paragraphs: ${raw.slice(0, 200)}`);

    const summaryHtml = paragraphs.map((p) => `<p>${escapeHtml(p.trim())}</p>`).join("");
    const tags =
      needsTags && Array.isArray(parsed.tags)
        ? parsed.tags
            .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
            .map((t) => t.trim())
            .slice(0, 4)
        : existingTags;

    return { summaryHtml, tags };
  } catch (err) {
    console.error(`[ollama] summarize failed for ${kind} "${name}":`, err);
    return null;
  }
}
