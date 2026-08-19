export type Locale = "en" | "ko";
export const LOCALE_COOKIE = "hk-locale";

export const dictionaries = {
  en: {
    nav: {
      about: "Abstract",
      projects: "Projects",
      awards: "Record",
      play: "Play",
      contact: "Social",
      admin: "Admin",
    },
    hero: {
      eyebrow: "Index 00 — Hayward Kim",
      titleTop: "Robots and AI, built to compete.",
      titleBottom: "Shipped as products people actually use.",
      viewProjects: "View projects",
      getInTouch: "Get in touch",
      roles: [
        { label: "Roboticist", desc: "Actuation, control loops, embedded systems" },
        { label: "Competitor", desc: "30 competitions entered nationwide" },
        { label: "Operator", desc: "Products shipped: AIO, DIMIPAY KIOSK, HANPOON" },
      ],
    },
    about: {
      eyebrow: "01 — Abstract",
      title: "Kim Hyeong-Seok — Hayward Kim.",
      bio: "Robotics and AI — control systems, embedded hardware, and the learning algorithms on top of them. Korea Digital Media High School (Hacking Defense), now at Korea University's College of Engineering.",
      quote: "“I build the physical layer of AI.”",
      highlightsTitle: "Highlights",
      highlights: [
        { year: "2023–24", text: "30 competitions entered nationwide, robotics & AI." },
        { year: "2024", text: "Korea Talent Award." },
        { year: "Now", text: "AIO, DIMIPAY KIOSK, HANPOON — shipped and running." },
      ],
      competitionsEntered: "Competitions entered",
      projectsShipped: "Projects shipped",
      seeWork: "See the work",
      getInTouch: "Get in touch",
      indexLabel: "Index",
      projectsSummaryTitle: "Selected projects",
      recordSummaryTitle: "Record",
    },
    projects: {
      eyebrow: "02 — Projects",
      title: "Selected work",
      intro: "Every project here is real — built, entered into competitions, or running in production. No case studies invented for the portfolio.",
      shown: "shown",
      goldRanked: "Gold-ranked",
    },
    awards: {
      eyebrow: "03 — Record",
      placed: "competitions placed",
      of: "of",
      enteredNationwide: "entered nationwide",
      intro: "A ledger, not a highlight reel — every competition entered is listed, ranked or not.",
    },
    activities: {
      eyebrow: "Activities",
      title: "Beyond the bench",
      intro: "Clubs, leadership, and the parts of the work that don't show up in a project list.",
      all: "All",
    },
    play: {
      eyebrow: "04 — Play & Tools",
      title: "Have fun.",
      intro: "A few small games. No robotics lecture required — just something to click around in for a minute.",
    },
    tools: {
      eyebrow: "Tools",
      title: "Small utilities",
      intro: "Everything here runs client-side — your files never leave the browser.",
    },
    contact: {
      eyebrow: "05 — Social",
      title: "Building something in robotics or physical AI?",
      intro: "Reach out directly — I read everything myself.",
      email: "Email",
      portfolio: "Portfolio",
    },
    social: {
      blogTitle: "From the blog",
      noPosts: "No posts yet — check back soon.",
      commentsTitle: "Comments",
      commentEmpty: "No comments yet — be the first.",
      namePlaceholder: "Your name",
      bodyPlaceholder: "Add a comment…",
      submit: "Post comment",
      submitting: "Posting…",
      backToSocial: "← Back to Social",
    },
    common: {
      backToProjects: "← Back to all projects",
      askDirectly: "Ask directly →",
      wantWriteup: "Want the full technical writeup or a live demo?",
      copied: "Copied",
      copy: "Copy",
      story: "Story",
      recognition: "Recognition",
      noWriteupYet: "Details for this project are being written up — check back soon.",
      seeMore: "See more →",
    },
  },
  ko: {
    nav: {
      about: "개요",
      projects: "프로젝트",
      awards: "이력",
      play: "놀기",
      contact: "소셜",
      admin: "관리자",
    },
    hero: {
      eyebrow: "인덱스 00 — 김하이워드",
      titleTop: "경쟁을 위해 만든 로봇과 AI.",
      titleBottom: "실제로 쓰이는 제품으로 출시했습니다.",
      viewProjects: "프로젝트 보기",
      getInTouch: "연락하기",
      roles: [
        { label: "로봇공학자", desc: "구동, 제어 루프, 임베디드 시스템" },
        { label: "경쟁자", desc: "전국 대회 30회 참가" },
        { label: "운영자", desc: "출시 제품: AIO, DIMIPAY KIOSK, HANPOON" },
      ],
    },
    about: {
      eyebrow: "01 — 개요",
      title: "김형석 — 하이워드 킴.",
      bio: "로보틱스와 인공지능 — 제어 시스템, 임베디드 하드웨어, 그 위의 학습 알고리즘. 한국디지털미디어고등학교(해킹방어과) 졸업, 현재 고려대학교 공과대학 재학 중.",
      quote: "“저는 AI의 물리적 층위를 만듭니다.”",
      highlightsTitle: "주요 이력",
      highlights: [
        { year: "2023–24", text: "전국 대회 30회 참가, 로보틱스 & AI." },
        { year: "2024", text: "대한민국 인재상 수상." },
        { year: "지금", text: "AIO, DIMIPAY KIOSK, HANPOON — 출시 및 운영 중." },
      ],
      competitionsEntered: "참가한 대회",
      projectsShipped: "출시한 프로젝트",
      seeWork: "작업물 보기",
      getInTouch: "연락하기",
      indexLabel: "목차",
      projectsSummaryTitle: "선정 프로젝트",
      recordSummaryTitle: "이력",
    },
    projects: {
      eyebrow: "02 — 프로젝트",
      title: "선정 작업물",
      intro: "여기 있는 모든 프로젝트는 실제로 만들어졌거나, 대회에 출전했거나, 실제로 운영 중입니다. 포트폴리오용으로 지어낸 사례는 없습니다.",
      shown: "개 표시",
      goldRanked: "금상 수상",
    },
    awards: {
      eyebrow: "03 — 이력",
      placed: "개 대회 입상",
      of: "총",
      enteredNationwide: "회 전국 대회 참가",
      intro: "하이라이트만 모은 게 아니라 참가한 모든 대회를 순위 여부와 상관없이 기록한 장부입니다.",
    },
    activities: {
      eyebrow: "활동",
      title: "책상 밖에서",
      intro: "동아리, 리더십, 그리고 프로젝트 목록에는 나오지 않는 것들.",
      all: "전체",
    },
    play: {
      eyebrow: "04 — 놀기 & 도구",
      title: "그냥 즐기세요.",
      intro: "작은 게임 몇 개입니다. 로보틱스 강의 같은 거 필요 없이, 잠깐 클릭하고 놀 수 있는 것들이요.",
    },
    tools: {
      eyebrow: "도구",
      title: "작은 유틸리티",
      intro: "여기 있는 모든 도구는 브라우저에서만 동작합니다 — 파일이 서버로 전송되지 않습니다.",
    },
    contact: {
      eyebrow: "05 — 소셜",
      title: "로보틱스나 피지컬 AI 관련해서 뭔가 만들고 계신가요?",
      intro: "직접 연락 주세요 — 전부 제가 직접 읽습니다.",
      email: "이메일",
      portfolio: "포트폴리오",
    },
    social: {
      blogTitle: "블로그",
      noPosts: "아직 글이 없습니다 — 곧 올라옵니다.",
      commentsTitle: "댓글",
      commentEmpty: "아직 댓글이 없습니다 — 첫 댓글을 남겨보세요.",
      namePlaceholder: "이름",
      bodyPlaceholder: "댓글을 남겨보세요…",
      submit: "댓글 남기기",
      submitting: "등록 중…",
      backToSocial: "← 소셜로 돌아가기",
    },
    common: {
      backToProjects: "← 모든 프로젝트로",
      askDirectly: "직접 물어보기 →",
      wantWriteup: "기술 상세 자료나 라이브 데모가 필요하신가요?",
      copied: "복사됨",
      copy: "복사",
      story: "스토리",
      recognition: "수상 내역",
      noWriteupYet: "아직 상세 내용을 작성 중입니다 — 곧 업데이트됩니다.",
      seeMore: "더보기 →",
    },
  },
} as const;

export type Dictionary = typeof dictionaries.en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as Dictionary;
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "ko" ? "ko" : "en";
}
