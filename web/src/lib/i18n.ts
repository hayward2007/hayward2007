export type Locale = "en" | "ko";
export const LOCALE_COOKIE = "hk-locale";

export const dictionaries = {
  en: {
    nav: {
      about: "Portfolio",
      projects: "Projects",
      awards: "Record",
      play: "Play",
      contact: "Social",
      admin: "Admin",
    },
    hero: {
      eyebrow: "Index 00 — Hayward Kim",
      titleTop: "I make unique robots.",
      titleBottom: "Mechanisms, control, and intelligence in one system.",
      viewProjects: "View projects",
      getInTouch: "Get in touch",
      roles: [
        { label: "Mechanism designer", desc: "Structures and motion designed around the problem" },
        { label: "System builder", desc: "Embedded control, software, and integration" },
        { label: "Robotics researcher", desc: "Sensing, machine learning, and validation" },
      ],
    },
    about: {
      role: "Robotics & Physical AI",
      titleTop: "Hayward Kim",
      titleBottom: "Kim Hyeong Seok.",
      bio: "I design structures and motion around the problem instead of starting from a familiar robot shape. I connect mechanical design, control, and AI, then test each idea as a complete robotic system.",
      quote: "“I make unique robots.”",
      highlightsTitle: "HIGHLIGHTS",
      highlights: [
        "Korea Talent Award · Presidential Science Scholarship",
        "National team representative, twice",
        "Currently studying at Korea University",
        "14 awards across robotics, software, and engineering competitions",
      ],
      highlightLabels: [
        "National recognition",
        "Representation",
        "University",
        "Competition record",
      ],
      seeWork: "See the work",
      getInTouch: "Get in touch",
      indexLabel: "Index",
      education: [
        { cohort: "Current", institution: "Korea University", program: "Convergence Energy Engineering" },
        { cohort: "22ND", institution: "Korea Digital Media High School", program: "Hacking Defense" },
      ],
      featuredProjectsTitle: "PROJECT FOCUS",
      featuredProjectsIntro:
        "SCONE and PUNCH! approach different problems through original mechanisms and sensor-driven intelligence.",
      featuredProjectDescriptions: {
        scone:
          "SCONE began with delays in delivering AEDs across stairs inside large buildings and subway stations. I designed a six-legged robot whose sector-shaped frames act as wheels on flat ground and feet on stairs. Two structural iterations addressed load-path and traction failures, leading to battery-powered operation and continuous stair climbing.",
        punch:
          "PUNCH! began with the time, space, and cost barriers that keep people from exercising, while wearables and punching bags add more equipment. I used only a smartphone accelerometer and gyroscope to classify straight, hook, uppercut, and body punches on-device in real time. The model reached 99.15% validation accuracy, but I documented the risk of data leakage instead of treating the number as final proof.",
      },
      projectsIntro:
        "Projects I carried from problem framing through design, implementation, and validation across robotics, AI, and integrated hardware-software.",
      sections: {
        highlights: "HIGHLIGHTS",
        awards: "Awards",
        activities: "Activities",
        skills: "Skills",
        education: "Education",
        projects: "All Projects",
      },
    },
    projects: {
      eyebrow: "02 — Projects",
      title: "Projects",
      intro: "Robotics, on-device AI, and integrated hardware-software projects I designed and built.",
      shown: "Projects",
      goldRanked: "Gold awards",
    },
    awards: {
      eyebrow: "03 — Record",
      placed: "awards",
      of: "of",
      enteredNationwide: "competitions entered",
      intro: "Competition entries and results, organized by year and placement.",
      placedOnly: "Placed only",
      viewAll: "View all",
    },
    activities: {
      eyebrow: "Activities",
      title: "Beyond projects",
      intro: "Clubs, leadership, research, and other activities outside the project list.",
      all: "All",
    },
    play: {
      eyebrow: "04 — Play & Tools",
      title: "Playground.",
      intro: "A collection of small games and tools I built.",
    },
    tools: {
      eyebrow: "Tools",
      title: "Tools",
      intro: "Practical utilities that process files locally whenever possible.",
    },
    contact: {
      eyebrow: "05 — Social",
      title: "Let's talk about robots and new ideas.",
      intro: "For projects, collaboration, or technical conversations, reach me by email.",
      email: "Email",
      portfolio: "Portfolio",
    },
    social: {
      blogTitle: "From the blog",
      noPosts: "No posts yet.",
      commentsTitle: "Comments",
      commentEmpty: "No comments yet.",
      namePlaceholder: "Your name",
      bodyPlaceholder: "Add a comment…",
      submit: "Post comment",
      submitting: "Posting…",
      commentError: "Couldn't post that comment. Try again.",
      commentRateLimited: "Too many comments. Wait a few minutes and try again.",
      backToSocial: "Back to Social",
      allTags: "All",
    },
    common: {
      backToProjects: "← Back to all projects",
      askDirectly: "Ask directly",
      wantWriteup: "Want the full technical writeup or a live demo?",
      copied: "Copied",
      copy: "Copy",
      story: "Project overview",
      recognition: "Recognition",
      noWriteupYet: "Project details are being prepared.",
      seeMore: "See all projects",
      close: "Close",
      noSummaryYet: "Details are not available yet.",
    },
  },
  ko: {
    nav: {
      about: "포트폴리오",
      projects: "프로젝트",
      awards: "이력",
      play: "놀기",
      contact: "소셜",
      admin: "관리자",
    },
    hero: {
      eyebrow: "인덱스 00 — 김하이워드",
      titleTop: "저는 독창적인 로봇을 만듭니다.",
      titleBottom: "기구, 제어, 지능을 하나의 시스템으로 설계합니다.",
      viewProjects: "프로젝트 보기",
      getInTouch: "연락하기",
      roles: [
        { label: "기구 설계", desc: "문제에 맞는 구조와 움직임 설계" },
        { label: "시스템 구현", desc: "임베디드 제어, 소프트웨어, 시스템 통합" },
        { label: "로봇 연구", desc: "센서, 머신러닝, 실험을 통한 검증" },
      ],
    },
    about: {
      role: "로보틱스 & 피지컬 AI",
      titleTop: "Hayward Kim",
      titleBottom: "Kim Hyeong Seok.",
      bio: "익숙한 로봇 형태에서 출발하기보다 문제에 맞는 구조와 움직임을 새롭게 설계합니다. 기구 설계부터 제어와 AI까지 직접 연결하고, 아이디어를 하나의 로봇 시스템으로 완성해 검증합니다.",
      quote: "“저는 독창적인 로봇을 만듭니다.”",
      highlightsTitle: "HIGHLIGHTS",
      highlights: [
        "대한민국인재상 · 대통령과학장학금",
        "국가대표 2회",
        "고려대학교 재학 중",
        "로봇·소프트웨어·공학 분야 경진대회 14회 수상",
      ],
      highlightLabels: ["국가 인정", "대표 경력", "대학교", "수상 기록"],
      seeWork: "프로젝트 보기",
      getInTouch: "연락하기",
      indexLabel: "목차",
      education: [
        { cohort: "재학 중", institution: "고려대학교", program: "융합에너지공학과" },
        { cohort: "22ND", institution: "한국디지털미디어고등학교", program: "해킹방어과" },
      ],
      featuredProjectsTitle: "PROJECT FOCUS",
      featuredProjectsIntro:
        "SCONE과 PUNCH!는 서로 다른 문제를 새로운 기구 구조와 센서 기반 지능으로 풀어낸 대표 프로젝트입니다.",
      featuredProjectDescriptions: {
        scone:
          "대형 건물과 지하철역에서 계단 때문에 AED 전달이 늦어지는 문제에서 시작했습니다. 평지에서는 바퀴처럼 달리고 계단에서는 발처럼 움직이도록 부채꼴 프레임을 적용한 6족 로봇을 설계했습니다. 두 차례의 구조 개선을 거쳐 하중 경로와 접지 문제를 해결하고, 배터리 단독 구동과 연속 계단 이동을 검증했습니다.",
        punch:
          "시간·공간·비용 때문에 운동을 시작하기 어렵고, 별도 웨어러블이나 펀칭백은 진입 장벽이 된다는 문제에서 시작했습니다. 스마트폰의 가속도계와 자이로스코프만으로 스트레이트·훅·어퍼컷·보디를 실시간 분류하는 온디바이스 AI를 설계했습니다. 최고 검증 정확도 99.15%를 얻었지만, 데이터 누수 가능성을 발견해 높은 수치보다 검증 방법의 한계를 명확히 기록했습니다.",
      },
      projectsIntro:
        "로봇, AI, 하드웨어와 소프트웨어를 연결하며 문제 정의부터 설계, 구현, 검증까지 직접 진행한 프로젝트를 모았습니다.",
      sections: {
        highlights: "HIGHLIGHTS",
        awards: "수상",
        activities: "활동",
        skills: "스킬",
        education: "교육",
        projects: "전체 프로젝트",
      },
    },
    projects: {
      eyebrow: "02 — 프로젝트",
      title: "프로젝트",
      intro: "직접 설계하고 구현한 로봇, 온디바이스 AI, 하드웨어·소프트웨어 통합 프로젝트입니다.",
      shown: "프로젝트",
      goldRanked: "금상 수상 프로젝트",
    },
    awards: {
      eyebrow: "03 — 이력",
      placed: "회 수상",
      of: "총",
      enteredNationwide: "개 대회 참가",
      intro: "참가한 대회와 수상 결과를 연도와 성과별로 정리했습니다.",
      placedOnly: "입상만",
      viewAll: "전체보기",
    },
    activities: {
      eyebrow: "활동",
      title: "프로젝트 밖의 활동",
      intro: "동아리, 리더십, 연구 등 프로젝트 목록 밖의 활동을 정리했습니다.",
      all: "전체",
    },
    play: {
      eyebrow: "04 — 놀기 & 도구",
      title: "플레이그라운드.",
      intro: "직접 만든 간단한 게임과 도구를 한곳에 모았습니다.",
    },
    tools: {
      eyebrow: "도구",
      title: "도구",
      intro: "가능한 작업은 브라우저 안에서 처리하도록 만든 실용적인 도구입니다.",
    },
    contact: {
      eyebrow: "05 — 소셜",
      title: "로봇과 새로운 아이디어를 함께 이야기해요.",
      intro: "프로젝트, 협업, 기술에 관한 이야기는 이메일로 연락해 주세요.",
      email: "이메일",
      portfolio: "포트폴리오",
    },
    social: {
      blogTitle: "블로그",
      noPosts: "아직 작성된 글이 없습니다.",
      commentsTitle: "댓글",
      commentEmpty: "아직 댓글이 없습니다.",
      namePlaceholder: "이름",
      bodyPlaceholder: "댓글을 남겨보세요…",
      submit: "댓글 남기기",
      submitting: "등록 중…",
      commentError: "댓글을 등록하지 못했습니다. 다시 시도해 주세요.",
      commentRateLimited: "댓글을 너무 자주 등록했습니다. 잠시 후 다시 시도해 주세요.",
      backToSocial: "소셜로 돌아가기",
      allTags: "전체",
    },
    common: {
      backToProjects: "← 모든 프로젝트로",
      askDirectly: "직접 문의하기",
      wantWriteup: "기술 상세 자료나 라이브 데모가 필요하신가요?",
      copied: "복사됨",
      copy: "복사",
      story: "프로젝트 개요",
      recognition: "수상 내역",
      noWriteupYet: "프로젝트 상세 내용을 준비하고 있습니다.",
      seeMore: "전체 프로젝트 보기",
      close: "닫기",
      noSummaryYet: "아직 등록된 상세 내용이 없습니다.",
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
