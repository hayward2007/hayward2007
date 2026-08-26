export type CaseStudyAccent = "robotics" | "ai" | "signal";

export type CaseStudyMedia = {
  items: Array<{
    src: string;
    alt: string;
  }>;
  caption: string;
};

export type CaseStudyDecision = {
  title: string;
  issue: string;
  framing: string;
  options: string;
  solution: string;
};

export type CaseStudyChapter = {
  id: string;
  number: string;
  title: string;
  summary?: string[];
  media?: CaseStudyMedia;
  decisions?: CaseStudyDecision[];
  findings?: string[];
};

export type ProjectCaseStudy = {
  slug: string;
  name: string;
  order: number;
  accent: CaseStudyAccent;
  statusLabel: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  tags: string[];
  repositoryUrl?: string;
  heroImage: string;
  heroImageAlt: string;
  heroFit?: "contain" | "cover";
  summary: string[];
  metrics: Array<{
    value: string;
    label: string;
    detail?: string;
  }>;
  chapters: CaseStudyChapter[];
  conclusion: string[];
  limitations: string[];
  nextSteps?: string[];
};

const studies: ProjectCaseStudy[] = [
  {
    slug: "scone",
    name: "SCONE",
    order: 0,
    accent: "robotics",
    statusLabel: "2023-2024 · Robotics",
    tagline: "주행과 보행을 하나의 다리에 담은 6족 응급 전달 로봇",
    taglineEn: "A six-legged emergency-delivery robot that combines driving and walking in each leg",
    description:
      "평지 속도와 계단 등반을 함께 확보하기 위해 부채꼴 프레임을 바퀴이자 발로 설계한 6족 로봇 연구입니다.",
    descriptionEn:
      "A six-legged robot whose sector-shaped frames act as both wheels and feet, balancing speed on flat ground with stair-climbing ability.",
    tags: ["Robotics", "Mechanical Design", "Control", "Python"],
    repositoryUrl: "https://github.com/hayward2007/SCONE",
    heroImage: "/project-assets/scone/hero.png",
    heroImageAlt: "완성된 SCONE v2 6족 로봇",
    summary: [
      "SCONE은 지하철 역사와 도심 건물 내부에서 자동제세동기(AED)를 신속하게 전달하기 위해 개발한 6족 로봇이다. 다리 끝의 중심각 240도 부채꼴 프레임은 여섯 개가 같은 방향으로 회전할 때 바퀴가 되고, 독립적으로 움직일 때는 발이 된다.",
      "이 프로젝트의 핵심은 같은 실패를 두 번 다르게 정의한 과정이다. v1은 구동기 증가를 무게와 전력 예산의 문제로 보고 평행 링크로 모터 수를 줄였지만 배터리로 서지 못했다. v2는 이를 하중 경로의 문제로 다시 정의하고 평행 링크를 제거했다.",
    ],
    metrics: [
      { value: "0.7 m/s", label: "보행 속도", detail: "v1 대비 14배" },
      { value: "2.0 m/s", label: "주행 속도", detail: "v1 대비 약 2.9배" },
      { value: "23초", label: "계단 1단", detail: "54초에서 57% 단축" },
      { value: "15단+", label: "연속 계단", detail: "배터리 단독 구동" },
    ],
    chapters: [
      {
        id: "scone-background",
        number: "01",
        title: "평지 속도를 잃지 않고 계단을 넘는 문제",
        media: {
          items: [
            { src: "/project-assets/scone/drive-start.jpg", alt: "SCONE v2의 주행 초기 자세" },
            { src: "/project-assets/scone/drive-motion.jpg", alt: "SCONE v2가 부채꼴 프레임으로 주행하는 모습" },
          ],
          caption: "SCONE v2 주행 초기 자세와 주행 중 모습",
        },
        decisions: [
          {
            title: "도심 실내 공간에서의 자동제세동기 전달",
            issue:
              "AED 사용까지의 시간이 생존율을 좌우하지만, 계단으로 층이 갈린 대형 건물에서는 장비가 가까이 있어도 발생 지점까지 제때 이동하기 어렵다.",
            framing:
              "배송 로봇의 낮은 턱·계단 통과 실패와 보행 로봇의 느린 평지 속도를 함께 보고, 이를 속도를 잃지 않으면서 턱과 계단을 넘는 문제로 정의하였다.",
            options:
              "트럭형은 계단을 통과하지 못하고, 차체를 기울이는 방식은 무게중심과 속도에 불리해 기각하였다. 주행과 보행을 한 기계에서 수행하는 방향을 택하였다.",
            solution:
              "240도 부채꼴 프레임을 다리 끝에 배치하였다. 여섯 프레임이 엇갈려 회전하면 하나의 원처럼 주행하고, 독립 구동하면 보행과 계단 등반을 수행한다.",
          },
        ],
        findings: [
          "요구조건은 200 mm 이상의 다리 가동 범위, 회전 주행, 160 x 250 x 90 mm 적재 공간, 11.1 V 자립 구동, 연속 계단 15단, SLAM 자율 이동, AED 적재 하중으로 정리하였다.",
          "배달 시장에서는 계단 능력이 과잉 사양이지만, AED 전달에서는 우회 시간을 없애는 최소 사양이다. 적용 무대를 고르는 일도 설계의 일부로 보았다.",
        ],
      },
      {
        id: "scone-v1",
        number: "02",
        title: "v1, 예산을 지켰지만 하중 경로를 잃다",
        summary: [
          "회전체를 추가하면 다리당 구동기가 네 개, 전체 24개가 필요했다. v1은 이를 무게·전력 예산으로 정의해 평행 링크로 수직 자유도를 만들고 구동기 수를 18개로 유지했다.",
        ],
        media: {
          items: [{ src: "/project-assets/scone/v1-overview.jpg", alt: "평행 링크 다리를 사용한 SCONE v1 전경" }],
          caption: "배터리 구동에서 하중 경로의 한계가 드러난 SCONE v1",
        },
        decisions: [
          {
            title: "하나의 다리에 보행과 주행을 함께 넣기",
            issue: "24개 구동기는 자유로운 동작을 주지만 자중과 소비 전력을 크게 늘린다.",
            framing:
              "구동기 개수 자체가 아니라 다리당 세 개라는 무게·전력 예산 안에서 수직 자유도를 확보하는 문제로 정의하였다.",
            options:
              "24개로 늘리는 안과 회전체를 포기하는 안을 모두 기각하고, 자유도를 기구 구조로 대신 만드는 방법을 선택하였다.",
            solution:
              "평행 링크로 수직 구동기 하나를 줄여 그 자리에 회전체 모터를 배치하였다. 하지만 구동기에서 말단까지 길어진 하중 경로는 계산에 포함하지 못했다.",
          },
          {
            title: "다리 치수를 감으로 정하지 않기",
            issue: "링크를 길게 하면 가동 범위와 모멘트 팔이 함께 커져 길이의 근거가 필요했다.",
            framing: "계단 높이 160-200 mm에서 역산하는 문제로 정의하였다.",
            options: "계단을 우회하거나 차체를 기울이는 방식은 프로젝트의 존재 이유와 충돌해 기각하였다.",
            solution:
              "가동 범위 200 mm 초과 조건으로 L1 150 mm, L2 300 mm를 정했다. 다만 연속 계단과 몸체 크기는 식에 포함되지 않았다.",
          },
        ],
        findings: [
          "유선에서는 동작했지만 필요 토크는 세 다리 지지 기준 약 5.51 N·m로 MX-28AT 최대 토크의 2.2배였다.",
          "무선 전환 시 전압은 12 V에서 11.1 V, 전류는 5 A에서 1 A로 줄고 무게는 3.75 kg에서 4.149 kg으로 늘어 로봇이 주저앉았다.",
          "v1 실측은 보행 0.05 m/s, 주행 0.7 m/s, 등반 높이 10 cm 이하였고 외부 전원 없이는 운행할 수 없었다.",
        ],
      },
      {
        id: "scone-v2",
        number: "03",
        title: "v2, 하중 경로로 문제를 다시 정의하다",
        media: {
          items: [
            { src: "/project-assets/scone/v2-frame-before.jpg", alt: "평행 링크를 제거하기 전 SCONE 다리 프레임" },
            { src: "/project-assets/scone/v2-frame-after.jpg", alt: "부채꼴과 다리 역할을 합친 SCONE v2 프레임" },
          ],
          caption: "평행 링크 제거 전후의 다리 구조 비교",
        },
        decisions: [
          {
            title: "평행 링크 구조의 제거",
            issue:
              "v1의 링크는 하중 집중, 제한된 가동 범위, 링크 마찰이라는 세 증상을 동시에 만들었다.",
            framing:
              "부품 강성이나 마찰이 아니라 구동기에서 말단까지의 경로가 길고 관절이 많은 문제로 정의하였다.",
            options:
              "더 강한 구동기는 무게·전력을 늘리고, 베어링 개선은 마찰만 해소하므로 기각하였다.",
            solution:
              "평행 링크를 제거하고 부채꼴을 확대해 회전체와 다리 프레임의 역할을 합쳤다. 하중 경로는 짧아졌지만 접지가 새 병목이 되었다.",
          },
          {
            title: "회전축과 하중축의 일치",
            issue: "v1은 부채꼴 회전축이 다리 하중축 밖에 있어 무게중심이 계속 어긋났다.",
            framing: "제어 보정이 아니라 축이 어긋난 기하의 문제로 정의하였다.",
            options: "부채꼴 지름을 줄이면 계단 성능을 되돌리므로, 프레임이 회전체를 비켜 가는 형상을 선택하였다.",
            solution:
              "다리를 ㄷ자 프레임으로 재설계해 부채꼴이 다리 축 위에서 회전하게 하고 하중을 두 지점으로 분산하였다.",
          },
          {
            title: "전원과 접지를 설계 변수로 올리기",
            issue: "PLA의 낮은 마찰과 부족한 접지 면적으로 회전력이 지면에 전달되지 않았다.",
            framing: "형상은 맞았으므로 재질과 접지 면적이 형상을 받치지 못하는 문제로 정의하였다.",
            options: "표면 패턴만 추가하는 안은 접지 면적을 늘리지 못해 기각하고, 3D 출력 가능한 TPU를 선택하였다.",
            solution:
              "TPU 에어리스 타이어를 장착하고 배터리·전원을 본체 지지 토크와 함께 설계하여 배터리 단독 구동을 확보하였다.",
          },
        ],
      },
      {
        id: "scone-control",
        number: "04",
        title: "센서와 알고리즘을 기구 형상으로 옮기다",
        media: {
          items: [
            { src: "/project-assets/scone/stair-start.jpg", alt: "SCONE v2의 계단 이동 초기 자세" },
            { src: "/project-assets/scone/stair-climb.jpg", alt: "부채꼴 프레임으로 계단을 오르는 SCONE v2" },
          ],
          caption: "센서 없이 부채꼴 형상으로 구현한 계단 이동",
        },
        decisions: [
          {
            title: "이종 구동기 제어의 추상화",
            issue: "MX·XM 시리즈의 EEPROM과 RAM 주소가 달라 하드웨어 교체마다 제어 코드가 흔들렸다.",
            framing: "가독성보다 이종 구동기 혼용을 인덱싱으로 추상화하는 문제로 정의하였다.",
            options: "공통 TTL 통신은 유지하고 모델별 주소만 분리하는 구조를 선택하였다.",
            solution: "Python 클래스 API와 모델별 주소 매핑, 대화형 CLI를 만들어 하드웨어 변경의 영향을 격리하였다.",
          },
          {
            title: "계단 이동, 센서 하나 없이",
            issue: "v1은 LiDAR로 계단마다 폭과 높이를 읽고 여섯 다리를 복잡하게 제어해야 했다.",
            framing: "인식 알고리즘이 아니라 센서·연산 문제를 기구 형상으로 옮기는 문제로 정의하였다.",
            options: "LiDAR 궤적 생성은 비용과 연산 때문에, 복잡한 보행은 몸체 제약을 풀지 못해 기각하였다.",
            solution:
              "확대된 부채꼴 세 개를 평행하게 움직여 계단 모서리에 걸치도록 했다. 계단 1단 평균 시간은 54초에서 23초로 줄었다.",
          },
          {
            title: "자세 사이의 전환 비용",
            issue: "보행·주행·계단 이동은 서로 다른 초기 자세를 요구했다.",
            framing: "모션 개수가 아니라 자세와 자세 사이의 전환 비용으로 정의하였다.",
            options: "모든 조합을 구현하지 않고 관절각 차이가 작은 자세를 인접시키는 단일 순환 시퀀스를 택하였다.",
            solution: "보행 → 주행 → 계단 이동 → 보행 순서로 전환해 구현 경로와 불필요한 관절 이동을 줄였다.",
          },
        ],
      },
      {
        id: "scone-results",
        number: "05",
        title: "잘못 정의했던 항목이 가장 크게 개선되다",
        summary: [
          "SCONE v2는 주행 2.0 m/s와 보행 0.7 m/s를 기록했다. v1 대비 보행은 14배, 주행은 약 2.9배 개선되었다. 주행보다 보행의 개선 폭이 큰 것은 v2가 실제로 고친 것이 하중 경로였음을 보여 준다.",
          "요구조건 중 계단 1단 통과, 평지 주행, 자립 구동, 연속 계단 15단은 달성했다. AED 적재 하중과 자율 이동은 아직 달성하지 못했다.",
        ],
        media: {
          items: [{ src: "/project-assets/scone/stair-comparison.png", alt: "SCONE v1과 v2의 계단 이동 성능 비교 그래프" }],
          caption: "계단 1단 통과 시간: 평균 54초에서 23초로 단축",
        },
        findings: [
          "2023 KSEF 은상",
          "2024 Genius Olympiad 동메달",
          "2024 대한민국인재상",
          "International Journal of STEAM 논문 게재",
        ],
      },
    ],
    conclusion: [
      "v1은 모터 개수를 아꼈고 v2는 구동기에서 지면까지의 거리를 아꼈다. 예산을 지키기 위해 도입한 구조가 새로운 제약을 만들었는지 확인하는 일이 이 연구의 가장 큰 학습이었다.",
    ],
    limitations: [
      "모션이 하드코딩되어 자율 주행과 부드러운 보행에 한계가 있다.",
      "AED 적재 하중, 소비 전력, 연속 가동 시간을 아직 실측하지 않았다.",
      "어떤 계단 형상에서 실패하는지 허용 범위를 지표화하지 못했다.",
      "실내 목적지까지 이동하는 SLAM 기반 자율 주행은 미구현이다.",
    ],
    nextSteps: [
      "MuJoCo에서 강화학습 기반 보행·주행 정책을 학습하고 실기로 이전한다.",
      "최대 적재 하중과 연속 가동 시간을 측정해 AED 전달 용도를 검증한다.",
      "계단 성공 사례가 아니라 실패 경계를 포함한 지형 허용 범위를 정의한다.",
    ],
  },
  {
    slug: "desky",
    name: "DESKY",
    order: 1,
    accent: "ai",
    statusLabel: "2026 · Physical AI",
    tagline: "스마트폰이 보고 듣고 움직이는 책상 위 5축 AI 비서",
    taglineEn: "A five-axis desktop AI assistant that uses a smartphone to see, listen, and interact",
    description:
      "스마트폰을 센서·연산·출력 장치로 활용하고 5축 매니퓰레이터가 사용자를 추종하는 개인용 AI 비서입니다.",
    descriptionEn:
      "A personal AI assistant that uses a smartphone for sensing, computing, and display while a five-axis manipulator follows the user.",
    tags: ["Manipulator", "MediaPipe", "Kinematics", "Physical AI"],
    repositoryUrl: "https://github.com/hayward2007/desky",
    heroImage: "/project-assets/desky/hero.png",
    heroImageAlt: "책상 위 5축 매니퓰레이터 DESKY",
    summary: [
      "DESKY는 팔 끝에 스마트폰을 장착한 5자유도 매니퓰레이터다. 휴대폰 카메라로 얼굴·손·몸을 인식하고 팔이 사용자를 향하도록 움직이며, 제스처·음성·문서 읽기·조명 제어를 하나의 인터페이스로 묶었다.",
      "초기 구현은 서버가 모델 추론과 3D 렌더링, 하드웨어 제어를 동시에 맡아 느리고 끊겼다. 이를 모델 성능이 아니라 인식을 어느 주체가 실행할 것인가의 배치 문제로 다시 정의하고, 인식을 휴대폰으로 옮겼다.",
    ],
    metrics: [
      { value: "0.901 mm", label: "역기구학 오차", detail: "목표 1 mm 미만" },
      { value: "약 20 fps", label: "인지 주기", detail: "66 ms 간격" },
      { value: "0.15초", label: "명령 최소 간격", detail: "안티 지터" },
      { value: "0.4375 m", label: "최대 도달 반경", detail: "30만 샘플 스윕" },
    ],
    chapters: [
      {
        id: "desky-background",
        number: "01",
        title: "더 똑똑한 가전보다 먼저 다가가는 가전",
        media: {
          items: [
            { src: "/project-assets/desky/look-face.jpg", alt: "사용자의 얼굴을 향해 자세를 잡은 DESKY" },
            { src: "/project-assets/desky/look-body.jpg", alt: "사용자의 몸 위치를 따라 움직이는 DESKY" },
          ],
          caption: "얼굴과 몸의 위치에 따라 사용자 쪽으로 자세를 바꾸는 DESKY",
        },
        decisions: [
          {
            title: "2035년의 가전은 왜 움직여야 하는가",
            issue: "고령 인구와 1인 가구가 늘면 기기를 찾아가 조작하기 어려운 사용자와 혼자 사는 사용자가 함께 늘어난다.",
            framing: "더 똑똑한 가전이 아니라 사용자에게 먼저 다가가 상호작용하는 가전을 정의하는 문제로 보았다.",
            options: "AI 스피커는 사용자의 위치를 찾거나 문서를 볼 수 없고, 이동형 서비스 로봇은 주거 공간의 단가와 안전 부담이 크다.",
            solution:
              "책상에 고정되는 5축 팔 끝에 스마트폰을 장착해 카메라·연산·화면·마이크를 겸용하는 DESKY를 만들었다.",
          },
        ],
      },
      {
        id: "desky-system",
        number: "02",
        title: "인식은 휴대폰, 판단과 기구학은 서버",
        summary: [
          "AX-18A 서보 다섯 개를 U2D2와 Protocol 1.0으로 제어한다. 순기구학은 순수 Python 동차변환 행렬 곱으로, 역기구학은 특이점 발산을 막는 감쇠 최소제곱법으로 구현했다.",
          "얼굴·손·몸 인식은 휴대폰 브라우저의 MediaPipe Tasks Vision이 수행한다. 서버는 전달받은 최소 랜드마크만 3차원 월드 좌표로 변환해 역기구학과 명령을 실행한다.",
          "거리와 깊이는 얼굴 9 cm, 손 3.5 cm, 어깨 40 cm라는 평균 기준자를 가정한 추정치이며 실측 캘리브레이션은 아직 없다.",
        ],
        media: {
          items: [
            { src: "/project-assets/desky/mujoco-sweep.png", alt: "MuJoCo에서 수행한 DESKY 도달 범위 시뮬레이션" },
            { src: "/project-assets/desky/printed-frame.png", alt: "3D 프린터로 출력한 DESKY 프레임 부품" },
            { src: "/project-assets/desky/architecture-arm.png", alt: "DESKY 매니퓰레이터 시스템 구조도" },
          ],
          caption: "기구학 시뮬레이션, 출력 부품, 매니퓰레이터 제어 구조",
        },
        findings: [
          "손 21개, 얼굴 3개, 몸 2개 랜드마크만 전송한다.",
          "제스처는 10-20프레임 지속 조건, 2.5초 쿨다운, 엣지 트리거를 사용한다.",
          "5자유도는 위치와 부분 자세까지만 풀 수 있으며 임의의 6자유도 자세는 구조적으로 불가능하다.",
        ],
      },
      {
        id: "desky-architecture",
        number: "03",
        title: "모델 성능이 아니라 실행 주체의 배치 문제",
        media: {
          items: [
            { src: "/project-assets/desky/hand-simulation.png", alt: "DESKY의 손 인식과 시뮬레이션 동시 실행 화면" },
            { src: "/project-assets/desky/face-simulation.png", alt: "DESKY의 얼굴 인식과 시뮬레이션 동시 실행 화면" },
            { src: "/project-assets/desky/realtime-tracking.jpg", alt: "DESKY 실시간 사용자 추종 시연" },
          ],
          caption: "인식을 휴대폰으로 옮긴 뒤의 손·얼굴 인식과 실시간 추종",
        },
        decisions: [
          {
            title: "인식 주체의 재배치",
            issue: "서버가 추론·렌더링·제어를 매 프레임 처리해 약 20 fps 입력을 따라가지 못했고 JPEG 압축으로 인식도 실패했다.",
            framing: "모델 정확도가 아니라 원본 프레임을 가진 휴대폰과 여러 작업을 맡은 서버 사이의 배치 문제로 정의하였다.",
            options: "서버 모델 경량화와 스레드 분리는 압축 화질 문제를 남기므로 기각하였다.",
            solution: "손·얼굴·몸 인식을 모두 휴대폰으로 옮기고 서버의 mediapipe 의존성을 0으로 만들었다.",
          },
          {
            title: "관절각 캐시 동기화",
            issue: "오래된 하드웨어 읽기값에 보정치를 계속 더해 팔 움직임이 점점 커지는 폭주가 발생했다.",
            framing: "캐시 TTL이 아니라 무엇을 현재 기준각으로 볼 것인가의 동기화 문제로 보았다.",
            options: "TTL을 줄이면 관절마다 시리얼 왕복이 추가되어 성능 문제가 되므로 기각하였다.",
            solution: "이동 직후 캐시를 마지막 읽기값이 아니라 마지막 명령값으로 갱신해 통신량 증가 없이 폭주를 제거했다.",
          },
          {
            title: "얼굴과 몸 사이의 히스테리시스",
            issue: "추정 거리 1.0 m 경계에서 얼굴·몸 우선순위가 매 프레임 뒤집혀 팔이 진동했다.",
            framing: "순간 미검출이 아니라 판정 경계가 하나뿐인 구조적 문제로 정의하였다.",
            options: "디바운스를 늘리는 안은 반응만 늦추므로 기각하고 방향별 임계값을 나눴다.",
            solution: "1.0 m ± 0.15 m 히스테리시스와 대상 전환 디바운스를 적용했다.",
          },
          {
            title: "높이 보정 스텝의 재산정",
            issue: "높이 보정 0.03 m는 역기구학을 거쳐 세 관절을 함께 움직여 좌우 회전보다 크게 흔들렸다.",
            framing: "게인 숫자가 아니라 스텝이 만드는 실제 관절각 변화량의 문제로 정의하였다.",
            options: "게인만 낮추지 않고 역기구학 솔버로 관절별 델타를 직접 측정했다.",
            solution: "관측값을 근거로 높이 보정 스텝을 0.015 m로 낮췄다.",
          },
        ],
      },
      {
        id: "desky-simplification",
        number: "04",
        title: "경로를 하나로 만들고 불필요한 단계를 제거하다",
        media: {
          items: [
            { src: "/project-assets/desky/architecture-phone.png", alt: "DESKY 휴대폰 인지 시스템 구조도" },
            { src: "/project-assets/desky/mobile-ui.png", alt: "DESKY 제어용 모바일 화면" },
            { src: "/project-assets/desky/document-reader.png", alt: "문서를 읽어 주는 DESKY 모바일 화면" },
          ],
          caption: "휴대폰 인지 경로와 제어 UI, 단순화된 문서 읽기 기능",
        },
        decisions: [
          {
            title: "인식 경로의 단일화",
            issue: "브랜치 병합 과정에서 휴대폰과 서버가 각각 손 인식을 수행하는 두 경로가 생겼다.",
            framing: "텍스트 병합이 아니라 서로 다른 프레임레이트의 결과를 하나로 통일하는 재설계 문제로 보았다.",
            options: "두 결과를 사후 병합하면 시점 차이가 남으므로 인식 한 번, 소비자 여러 개 구조를 택하였다.",
            solution: "휴대폰 랜드마크 스트림을 추종 컨트롤러와 제스처 인식기로 팬아웃했다.",
          },
          {
            title: "app.py 책임 분리",
            issue: "두 브랜치의 app.py가 각각 약 500줄 전역 스크립트여서 같은 상태를 서로 다르게 변경했다.",
            framing: "병합 충돌이 아니라 책임을 객체와 모듈로 분리하는 문제로 정의하였다.",
            options: "알고리즘 차이가 없음을 확인하고 추적 브랜치의 구조 위에 웹 기능만 이식했다.",
            solution: "ArmService, 렌더링, 인지 루프, 제스처 브리지, API 라우트로 나누고 app.py에는 조립만 남겼다.",
          },
          {
            title: "문서 스캐너의 제거",
            issue: "OpenCV 3단계 스캐너 없이 라이브 프레임만 보내도 문서 읽기 결과가 같았다.",
            framing: "정확도를 올리는 문제가 아니라 불필요한 단계를 제거하는 문제로 다시 정의하였다.",
            options: "검출 알고리즘을 더 복잡하게 만드는 대신 배경 무시 프롬프트로 역할을 대체했다.",
            solution: "document_scanner.py를 삭제하고 라이브 프레임을 직접 모델에 전달했다.",
          },
          {
            title: "HTTPS와 로컬 장치 사이의 중계",
            issue: "HTTPS 휴대폰 페이지가 HTTP 라즈베리파이 조명 장치를 직접 호출하면 혼합 콘텐츠로 차단됐다.",
            framing: "카메라 권한 때문에 HTTPS를 포기할 수 없어 중계자를 두는 문제로 정의하였다.",
            options: "포트포워딩과 고정 IP 없이 양쪽 모두 바깥으로 나가는 연결만 허용했다.",
            solution: "같은 네트워크에서는 PC가, 다른 네트워크에서는 공개 pub/sub가 중계하도록 했다. 분리 네트워크 재현 시험은 남아 있다.",
          },
        ],
      },
      {
        id: "desky-results",
        number: "05",
        title: "안티 지터 장치를 겹쳐 안정성을 만들다",
        summary: [
          "위치 오차는 URDF 로더를 재실행해 0.901 mm로 확인했다. 서버의 mediapipe 의존성은 0이며 명령 최소 간격은 코드 상수 0.15초다.",
          "데드존, 지수이동평균, 속도 제한, 0.015 m 높이 스텝, 얼굴·몸 히스테리시스, 전환 디바운스, 명령값 기준 관절 캐시를 겹쳐 관찰된 진동을 제거했다.",
        ],
        findings: [
          "개발 기간: 2026년 7월 13-24일, 11일",
          "코드베이스: 약 6,850줄",
          "검증 환경: 하드웨어·MediaPipe·API 키·라즈베리파이 없는 폴백 상태",
          "하드웨어가 없을 때 서보 엔드포인트는 503을 반환하고 앱은 계속 동작",
        ],
      },
    ],
    conclusion: [
      "DESKY의 가장 중요한 변화는 모델이나 부품 교체가 아니라 인식 작업의 실행 위치를 다시 정한 것이다. 같은 기준을 손·얼굴·몸에 반복 적용하면서 서버 부하와 압축 화질 문제를 동시에 해소했다.",
    ],
    limitations: [
      "5자유도 구조로는 임의의 6자유도 자세를 만족시킬 수 없다.",
      "거리와 깊이는 인구 평균 기준자에 의존한 미보정 추정치다.",
      "엔드투엔드 추종 정확도와 이전 대비 프레임레이트 향상은 실측하지 않았다.",
      "음성 명령은 의도 이해가 아니라 정규식·부분 문자열 매칭이다.",
      "분리된 네트워크에서 조명 중계 경로를 재현한 기록이 없다.",
    ],
    nextSteps: [
      "실측 거리로 핀홀 기준자와 얼굴·몸 전환 임계값을 캘리브레이션한다.",
      "추종 정확도와 엔드투엔드 지연을 하드웨어에서 정량 측정한다.",
      "의도 분류 기반 음성 명령과 6자유도 관절 구성을 검토한다.",
    ],
  },
  {
    slug: "punch",
    name: "PUNCH!",
    order: 2,
    accent: "signal",
    statusLabel: "2021-2022 · On-device ML",
    tagline: "스마트폰 하나로 완성하는 실시간 섀도우복싱 트레이너",
    taglineEn: "A real-time shadowboxing trainer built around a single smartphone",
    description:
      "스마트폰 관성 센서 시퀀스로 네 가지 펀치를 분류하고, 높은 정확도의 검증 한계까지 추적한 온디바이스 ML 프로젝트입니다.",
    descriptionEn:
      "An on-device machine-learning project that classifies four punches from smartphone motion-sensor sequences and examines the limits behind its accuracy.",
    tags: ["GRU", "Sensor Fusion", "PyTorch", "Mobile"],
    repositoryUrl: "https://github.com/punch-boxing",
    heroImage: "/project-assets/punch/hero.png",
    heroImageAlt: "스마트폰 기반 섀도우복싱 앱 PUNCH",
    heroFit: "cover",
    summary: [
      "PUNCH!는 별도 웨어러블이나 펀칭백 없이 스마트폰 가속도계와 자이로스코프만으로 스트레이트·훅·어퍼컷·보디를 실시간 분류하는 모바일 앱이다.",
      "자세 추정과 중력 제거, GRU 분류 파이프라인을 직접 설계해 최고 검증 정확도 99.15%를 얻었다. 그러나 더 중요한 결론은 그 지표가 슬라이딩 윈도우와 0.2% 검증셋 때문에 실제 일반화 성능을 과대평가했을 가능성을 스스로 특정한 데 있다.",
    ],
    metrics: [
      { value: "4종", label: "실시간 펀치 분류", detail: "스트레이트·훅·어퍼컷·보디" },
      { value: "20 Hz", label: "최대 추론 빈도", detail: "20샘플 윈도우" },
      { value: "99.15%", label: "최고 검증 정확도", detail: "데이터 누수 가능성 있음" },
      { value: "0.2%", label: "검증셋 비율", detail: "회고의 핵심 한계" },
    ],
    chapters: [
      {
        id: "punch-background",
        number: "01",
        title: "운동을 막는 네 장벽을 한 기기로 낮추기",
        decisions: [
          {
            title: "최소 장비 구성",
            issue: "시간·공간·비용·동기 부족은 운동 프로그램을 시작하기 전 사용자를 막는다.",
            framing: "더 좋은 프로그램이 아니라 네 진입 장벽을 동시에 낮추는 최소 장비를 찾는 문제로 정의하였다.",
            options: "웨어러블과 펀칭백은 비용·공간을 늘리고 카메라는 촬영 공간과 조명을 요구해 기각하였다.",
            solution: "사용자가 이미 가진 스마트폰의 IMU와 화면·스피커를 센서와 피드백 장치로 함께 사용했다.",
          },
        ],
        findings: [
          "초당 최대 20회 추론하고 정지 구간은 임계값으로 걸러 모델을 호출하지 않는다.",
          "개발·검증은 MacBook Pro M1과 iPhone 14 Pro에서만 수행했으며 iOS 외 플랫폼은 검증하지 않았다.",
        ],
      },
      {
        id: "punch-sensors",
        number: "02",
        title: "고정 바이어스에서 자세 추적으로",
        media: {
          items: [
            { src: "/project-assets/punch/gravity-estimate.jpg", alt: "시간에 따라 추정한 스마트폰의 중력 성분" },
            { src: "/project-assets/punch/gravity-removed.jpg", alt: "스마트폰 가속도에서 중력 성분을 제거한 결과" },
            { src: "/project-assets/punch/auto-calibration.jpg", alt: "정지 상태를 이용한 PUNCH 자동 재보정 순서도" },
          ],
          caption: "자세 추적을 이용한 중력 제거와 자동 재보정 루프",
        },
        decisions: [
          {
            title: "캘리브레이션과 차분의 한계",
            issue: "기준 자세에서 기록한 중력 바이어스를 빼는 방식은 폰이 기울면 중력 투영 방향이 바뀌어 깨졌다.",
            framing: "바이어스를 더 정확히 측정하는 문제가 아니라 자세를 계속 추적하는 문제로 다시 정의하였다.",
            options: "차분값을 적분한 3차원 경로는 시간이 갈수록 실제 궤적에서 멀어져 기각하였다.",
            solution: "가속도계로 초기 자세를 구하고 자이로스코프로 연속 추적하는 구조로 전환하였다.",
          },
          {
            title: "자세 계산의 유효 범위",
            issue: "단순 닫힌 형은 특정 축 값이 0에 가까워질 때 발산하고 80도 이상에서는 센서 노이즈도 커졌다.",
            framing: "정확도만 올릴 문제가 아니라 계산을 언제 신뢰할지 판정하는 문제로 정의하였다.",
            options: "불안정한 각도 자체를 임계값으로 쓰지 않고 기준 중력과 측정 벡터의 코사인 유사도를 사용했다.",
            solution: "유사도 0.5 초과, 즉 수직 대비 약 60도 이내에서만 가속도계 자세를 신뢰하도록 했다.",
          },
          {
            title: "중력 제거와 자동 재보정",
            issue: "자이로 적분은 운동 가속도에 강하지만 시간이 지날수록 드리프트가 쌓였다.",
            framing: "적분식을 무한히 정밀하게 만드는 대신 언제 절대 기준으로 돌아갈지를 정하는 문제로 보았다.",
            options: "고정 시간 재보정은 펀치 중 개입할 수 있어 기각하고 정지·유효 자세 조건을 함께 사용했다.",
            solution: "가속도 크기 1.1 g 미만과 코사인 유사도 조건을 동시에 만족할 때 자세를 재산출하고 중력을 제거했다.",
          },
        ],
      },
      {
        id: "punch-pivot",
        number: "03",
        title: "노이즈 제거가 아니라 이중 적분을 포기하다",
        media: {
          items: [
            { src: "/project-assets/punch/kalman-position.jpg", alt: "칼만 필터 적용 후에도 누적되는 위치 오차" },
            { src: "/project-assets/punch/fft-position.jpg", alt: "FFT 필터 적용 후에도 누적되는 위치 오차" },
          ],
          caption: "칼만 필터와 FFT 적용 뒤에도 남은 위치 드리프트",
        },
        decisions: [
          {
            title: "피벗, 위치 추정의 포기",
            issue: "임계값, 칼만 필터, FFT를 차례로 적용해도 위치 정확도는 실용 수준에 이르지 못했다.",
            framing: "노이즈를 더 제거하는 문제가 아니라 이중 적분 자체가 모바일 센서에서 감당할 수 없는 오차 구조를 갖는 문제로 정의하였다.",
            options: "더 정교한 필터는 모바일 실시간 추론과 양립하기 어려워, 위치라는 중간 표현을 없애는 경로를 검토했다.",
            solution: "중력만 제거한 가속도 시퀀스를 GRU에 직접 넣어 펀치 유형을 분류하고 적분 드리프트를 우회했다.",
          },
        ],
      },
      {
        id: "punch-model",
        number: "04",
        title: "모바일에서 충분히 작은 시계열 모델",
        media: {
          items: [
            { src: "/project-assets/punch/data-collector.jpg", alt: "브라우저 기반 펀치 데이터 기록 화면" },
            { src: "/project-assets/punch/data-records.jpg", alt: "수집된 펀치 센서 데이터 확인 화면" },
          ],
          caption: "사용자가 자기 스마트폰으로 참여하는 데이터 수집 웹",
        },
        decisions: [
          {
            title: "아키텍처와 입력 피처",
            issue: "짧은 펀치 시퀀스를 초당 최대 20회 분류하면서 IMU 아홉 채널의 사용 범위를 정해야 했다.",
            framing: "최고 정확도만이 아니라 정확도와 온디바이스 연산 비용을 함께 만족하는 문제로 정의하였다.",
            options: "CNN·RNN 하이브리드는 불필요한 오버헤드가 크고, 지자기계와 자이로 입력은 가치 대비 비용이 커 제외했다.",
            solution: "3축 가속도 또는 자세각을 더한 5입력을 단일 GRU 계열에 넣고 입력 직후 tanh로 정규화했다.",
          },
          {
            title: "데이터 수집 인프라",
            issue: "스마트폰을 손에 쥔 조건의 공개 펀치 데이터셋이 없었다.",
            framing: "직접 녹화보다 여러 사용자가 자기 폰으로 레이블을 붙여 수집하는 경로를 만드는 문제로 보았다.",
            options: "네이티브 앱은 설치 장벽이 있어 브라우저 기반 수집 사이트를 택했다.",
            solution: "센서 권한만 허용하면 녹화하고 Cloudflare Workers를 거쳐 업로드하는 수집 웹을 만들었다.",
          },
          {
            title: "슬라이딩 윈도우와 프레임워크 전환",
            issue: "데이터가 적고 펀치 시작 시점이 윈도우마다 달랐다. TensorFlow 구현은 입력 직후 정규화 배치 제어도 까다로웠다.",
            framing: "기존 스트림에서 시간 오프셋 샘플을 만들고 아키텍처를 세밀하게 제어하는 문제로 정의하였다.",
            options: "20샘플 윈도우와 stride 1을 사용하고, 정규화 위치를 직접 기술할 수 있는 PyTorch로 옮겼다.",
            solution: "마지막 타임스텝 레이블로 학습·추론 조건을 맞췄다. 다만 인접 윈도우가 19/20 샘플을 공유하는 누수 위험을 만들었다.",
          },
        ],
      },
      {
        id: "punch-results",
        number: "05",
        title: "99.15%를 성과가 아니라 질문으로 돌려놓다",
        summary: [
          "입력 3·5개, 히든 5·10개, GRU 1·2·4·8층, 중력 제거 여부를 스윕했다. 최고 모델 GRU_5I_10H_4L_20W_A는 99.15%를 기록했다.",
          "자세각 추가와 중력 제거는 평균 정확도에 거의 영향을 주지 않았다. 2장 전체의 물리 전처리가 지표를 바꾸지 못했다는 사실은 모델이 본질보다 세션 패턴을 외웠을 가능성을 가리켰다.",
          "정지 구간은 별도 클래스로 학습하지 않고 가속도 크기 임계값으로 먼저 걸러 클래스 불균형과 불필요한 추론을 줄였다.",
        ],
        media: {
          items: [
            { src: "/project-assets/punch/training-gru-small.jpg", alt: "GRU 3입력 5히든 1층 모델의 학습 곡선" },
            { src: "/project-assets/punch/training-gru-deep.jpg", alt: "GRU 3입력 10히든 4층 모델의 학습 곡선" },
          ],
          caption: "입력·히든 크기·레이어 수를 바꾼 하이퍼파라미터 스윕",
        },
      },
      {
        id: "punch-retrospective",
        number: "06",
        title: "검증 방법론과 실사용 분포의 한계",
        media: {
          items: [
            { src: "/project-assets/punch/grip-1.jpg", alt: "스마트폰을 쥔 첫 번째 사용자 그립" },
            { src: "/project-assets/punch/grip-2.jpg", alt: "스마트폰을 쥔 두 번째 사용자 그립" },
            { src: "/project-assets/punch/grip-3.jpg", alt: "스마트폰을 쥔 세 번째 사용자 그립" },
          ],
          caption: "사용자마다 달라지는 스마트폰 그립과 학습 분포",
        },
        decisions: [
          {
            title: "검증 지표의 데이터 누수",
            issue: "96.67-99.15%의 검증 정확도가 실사용 성능과 연결되지 않았다.",
            framing: "모델 부족이 아니라 0.2% 검증셋과 stride 1 윈도우가 만든 검증 방법론의 문제로 보았다.",
            options: "같은 세션의 거의 같은 윈도우가 학습과 검증에 섞였을 가능성을 추적했다.",
            solution: "다음 반복의 기준을 세션 단위 분리와 더 큰 검증 비율로 다시 세웠다.",
          },
          {
            title: "사용자·기종·샘플링의 다양성",
            issue: "소수 사용자와 iPhone 14 Pro 한 기종의 데이터는 실제 그립·체격·센서 차이를 대표하지 못한다.",
            framing: "모델 용량이 아니라 학습 분포와 입력 시간 해상도의 문제로 정의하였다.",
            options: "윈도우 길이만 늘려도 순간 가속 스파이크는 더 잘 보이지 않으므로 기각하였다.",
            solution: "사용자·기종 단위 데이터 확장과 더 짧은 센서 샘플링 간격을 다음 실험으로 정했다.",
          },
        ],
      },
    ],
    conclusion: [
      "PUNCH!에서 남는 것은 99.15%가 아니라 두 번의 재정의다. 첫째는 이중 적분을 더 다듬는 대신 위치 추정을 포기한 것, 둘째는 높은 지표를 받아들이는 대신 검증 경로 자체를 의심한 것이다.",
    ],
    limitations: [
      "검증셋이 0.2%이고 인접 윈도우가 19/20 타임스텝을 공유해 데이터 누수 가능성이 높다.",
      "소수 사용자와 iPhone 14 Pro 한 기종에서만 검증했다.",
      "약 0.05초 샘플링은 펀치의 짧은 가속·감속 구간을 충분히 해상하지 못할 수 있다.",
      "자세 추정과 중력 제거가 최종 정확도에 기여했다는 근거가 약하다.",
    ],
    nextSteps: [
      "같은 녹화 세션이 학습과 검증에 동시에 들어가지 않도록 세션 단위로 분리한다.",
      "사용자·기종·그립별 데이터를 늘리고 iOS 외 플랫폼을 검증한다.",
      "센서 샘플링 간격을 줄여 순간 동역학을 더 세밀하게 포착한다.",
    ],
  },
  {
    slug: "pluto",
    name: "PLUTO",
    order: 3,
    accent: "robotics",
    statusLabel: "In progress · Artificial muscle",
    tagline: "나일론과 전도성 실로 만드는 저가 선형 인공근육",
    taglineEn: "A low-cost linear artificial muscle made from nylon and conductive thread",
    description:
      "초나선 나일론 섬유와 펠티어 열제어를 결합해 작고 가벼운 근육형 구동기를 검증하는 진행 중 연구입니다.",
    descriptionEn:
      "An ongoing study of a compact, lightweight artificial-muscle actuator combining coiled nylon fibers with Peltier thermal control.",
    tags: ["Artificial Muscle", "Peltier", "Experiment Design", "Robotics"],
    heroImage: "/project-assets/pluto/test-rig.jpg",
    heroImageAlt: "PLUTO 인공근육 시험 장치",
    heroFit: "cover",
    summary: [
      "PLUTO는 나일론 낚싯줄과 전도성 실을 열로 수축시켜 저가·저부피 선형 구동기를 만드는 진행 중 연구다. 완성 결과보다 어떤 변수를 분리하고 어떤 검증을 남겼는지를 중심으로 정리했다.",
      "근육형 구동기는 가격뿐 아니라 힘, 반응 속도, 반복 내구성, 안전 범위를 동시에 만족해야 한다. 따라서 완성된 팔을 먼저 만들기보다 단일 섬유와 열제어 실험부터 시작했다.",
    ],
    metrics: [
      { value: "12 V · 5 A", label: "기본 실험 전원", detail: "조건별 비교 예정" },
      { value: "1.5-2.0 m", label: "구리선 길이", detail: "독립 변수" },
      { value: "5종", label: "다발 구조 후보", detail: "효율·내구성 비교" },
      { value: "진행 중", label: "검증 상태", detail: "수치 확정 전" },
    ],
    chapters: [
      {
        id: "pluto-background",
        number: "01",
        title: "저가 재료를 제어 가능한 선형 구동기로",
        media: {
          items: [
            { src: "/project-assets/pluto/fabrication.jpg", alt: "나일론 인공근육을 제작하는 과정" },
            { src: "/project-assets/pluto/test-rig.jpg", alt: "제작한 인공근육을 시험하는 장치" },
            { src: "/project-assets/pluto/prototype-1.jpg", alt: "PLUTO 인공근육 초기 시험 시제품" },
            { src: "/project-assets/pluto/prototype-2.jpg", alt: "다른 권선 조건으로 제작한 PLUTO 인공근육 시제품" },
            { src: "/project-assets/pluto/failed-prototype.png", alt: "과열과 구조 문제로 실패한 인공근육 시제품" },
          ],
          caption: "초나선 섬유 제작, 시험 장치, 초기 시제품과 실패 사례",
        },
        decisions: [
          {
            title: "특화 로봇과 근육형 구동기",
            issue: "상용 로봇은 활동에 특화되고 휴머노이드는 모터가 프레임에 직접 힘을 가하는 구조가 대부분이다.",
            framing: "모터를 교체하는 문제가 아니라 작고 가볍고 유연한 근육형 구동기를 만드는 문제로 정의하였다.",
            options: "공압식 근육은 유체 관의 부피와 질량 때문에 기각하고 나일론·구리선 열수축 방식을 선택했다.",
            solution: "PLUTO의 기본 개념을 세웠다. 수축률·힘·반응 속도는 아직 실험으로 검증해야 한다.",
          },
          {
            title: "열로 제어되는 저가 인공근육",
            issue: "싼 재료만으로는 의수나 로봇에 필요한 출력·정밀도·반응성을 판단할 수 없었다.",
            framing: "저렴한 재료를 찾는 것이 아니라 제어 가능한 선형 구동기로 바꾸는 문제로 정의하였다.",
            options: "완성된 팔은 구동기와 기구 실패를 분리하기 어려워 단일 섬유 실험을 먼저 택했다.",
            solution: "1 m 낚싯줄, 350 g 무게추, 구리선, 전동 드릴, 열풍으로 초나선 섬유 제작 절차를 정했다.",
          },
        ],
      },
      {
        id: "pluto-plan",
        number: "02",
        title: "결과보다 먼저 실험 변수를 고정하다",
        media: {
          items: [
            { src: "/project-assets/pluto/fiber-example.jpg", alt: "PLUTO 인공근육 섬유의 기본 형태" },
            { src: "/project-assets/pluto/supercoiled-example.png", alt: "수축률을 높이기 위한 초나선 섬유 구조" },
            { src: "/project-assets/pluto/peltier-control.png", alt: "펠티어 소자를 이용한 양방향 열제어 구성" },
          ],
          caption: "초나선 구조 후보와 수축·이완을 위한 펠티어 열제어",
        },
        decisions: [
          {
            title: "실험 변수 분리",
            issue: "구리선 길이, 전압·전류, 다발 구조가 함께 바뀌면 어떤 변수가 성능을 만들었는지 알 수 없다.",
            framing: "많이 만들어 보는 문제가 아니라 전류·열·구조를 하나씩 고정해 비교하는 문제로 보았다.",
            options: "바로 팔에 붙이는 안과 구리선 한 조건만 쓰는 안을 기각했다.",
            solution: "1.5-2.0 m 구리선, 12 V 5 A, 다발 구조, 펠티어 전류, 온도 센서, PCB를 순서대로 검증한다.",
          },
          {
            title: "수축률과 반복 내구성의 균형",
            issue: "여러 섬유를 묶으면 수축 효율과 내구성이 서로 다른 방향으로 움직인다.",
            framing: "최대 수축률이 아니라 반복 사용 가능한 섬유 배열의 문제로 정의하였다.",
            options: "평행, 2·3가닥 꼬기, 두 묶음 재꼬기, 3가닥 땋기를 비교 대상으로 남겼다.",
            solution: "다섯 후보를 수축 효율과 손상 여부로 판정하며 최종 구조는 반복 하중 시험 뒤에 선택한다.",
          },
          {
            title: "수축과 이완의 양방향 열제어",
            issue: "가열 수축 뒤 냉각이 느리면 근육이 아니라 느린 열 변형 장치에 머문다.",
            framing: "더 뜨겁게 가열하는 대신 수축과 이완을 함께 다루는 열제어 문제로 보았다.",
            options: "과열 위험이 있는 방식과 열을 버리기만 하는 방식을 낮은 우선순위로 두고 펠티어를 선택했다.",
            solution: "펠티어·온도 센서·제어칩을 PCB에 올리는 구조를 정했다. 적정 전류와 차단 기준은 미확정이다.",
          },
        ],
      },
      {
        id: "pluto-validation",
        number: "03",
        title: "예상 결과와 남은 검증",
        summary: [
          "공개 자료는 최대 40% 수축을 제시하지만 선행 실험에서는 약 20% 수축, 느린 반응, 과열 손상이 관측됐다. 이를 재료 하나의 문제가 아니라 온도·하중·최대 이완 지점이 함께 만드는 안전 작동 범위 문제로 보았다.",
          "구리선 길이, 다발 구조, 펠티어 전류, 제한 장치를 각각 검증한다. 현재는 예상 결과이며 실제 판정은 수축률·반응 시간·반복 손상 데이터를 확보한 뒤에만 가능하다.",
        ],
      },
    ],
    conclusion: [
      "PLUTO는 아직 완성품이 아니다. 현재의 솔루션은 후보와 검증 순서를 정의한 것이며, 결과를 미리 성과처럼 쓰지 않는 것이 이 연구의 상태를 가장 정확히 보여 준다.",
    ],
    limitations: [
      "수축률·출력·반응 시간·반복 수명 실측이 아직 확정되지 않았다.",
      "펠티어 적정 전류와 과열 차단 기준이 정해지지 않았다.",
      "최종 섬유 다발 구조는 반복 하중 시험 전에는 선택할 수 없다.",
    ],
    nextSteps: [
      "독립 변수를 고정한 수축률·반응 시간 실험을 수행한다.",
      "반복 하중과 과열 조건에서 손상 경계를 측정한다.",
      "구동기 성능이 확인된 뒤에만 의수 또는 로봇 관절 적용을 검토한다.",
    ],
  },
  {
    slug: "noongil",
    name: "NOONGIL",
    order: 4,
    accent: "ai",
    statusLabel: "Research · Computer Vision",
    tagline: "특수 장비 없이 내장 카메라만으로 시선 입력을 만들기",
    taglineEn: "Gaze input using only a built-in camera, without specialized hardware",
    description:
      "FaceMesh 기반 기하 모델로 접근 가능한 시선 입력을 시도하고, 얼굴 위상 이후 드러난 모델 한계를 기록한 연구입니다.",
    descriptionEn:
      "A computer-vision study that explores accessible gaze input with a FaceMesh-based geometric model and documents its limitations.",
    tags: ["Computer Vision", "FaceMesh", "Geometry", "Accessibility"],
    repositoryUrl: "https://github.com/hayward2007/noongil",
    heroImage: "/project-assets/noongil/hero.png",
    heroImageAlt: "장애인과 노약자를 위한 내장 카메라 기반 시선 입력 서비스 설명",
    heroFit: "cover",
    summary: [
      "눈길은 마우스나 손가락 사용이 어려운 사람이 노트북 또는 휴대폰의 내장 카메라만으로 화면을 조작할 수 있게 하려는 아이트래킹 연구다.",
      "FaceMesh 랜드마크로 얼굴 기준 좌표계와 눈 회전을 기하적으로 구성했다. 얼굴 위상 추정까지는 확인했지만 시선 위치는 눈 크기와 얼굴 자세에 대한 가정 때문에 안정적으로 동작하지 않았다.",
    ],
    metrics: [
      { value: "0", label: "추가 장비", detail: "내장 카메라만 사용" },
      { value: "3점", label: "얼굴 기준 좌표", detail: "상단·하단·코끝" },
      { value: "양안", label: "화면 교점 계산", detail: "두 시선 교점의 중점" },
      { value: "미달", label: "시선 위치 정확도", detail: "기하 모델 한계" },
    ],
    chapters: [
      {
        id: "noongil-background",
        number: "01",
        title: "정확도보다 접근성을 먼저 두다",
        media: {
          items: [{ src: "/project-assets/noongil/hero.png", alt: "보조장치 없는 시선 입력의 필요성" }],
          caption: "장애인 및 노약자를 위한 추가 장비 없는 입력 서비스",
        },
        decisions: [
          {
            title: "보조장치 없는 시선 입력",
            issue: "기존 아이트래킹은 특수 카메라나 안경을 요구해 장비가 없으면 시작하기 어렵다.",
            framing: "고정밀 장비를 만드는 대신 이미 가진 기기의 내장 카메라로 접근성을 얻는 문제로 정의하였다.",
            options: "특수 카메라·안경과 손동작 입력을 추가 장비 또는 사용자 배제 때문에 기각하였다.",
            solution: "노트북·휴대폰 카메라만으로 화면상의 응시 위치를 추정하는 시스템을 목표로 정했다.",
          },
        ],
      },
      {
        id: "noongil-geometry",
        number: "02",
        title: "얼굴 좌표계에서 화면의 한 점까지",
        media: {
          items: [
            { src: "/project-assets/noongil/facemesh-landmarks.png", alt: "MediaPipe FaceMesh로 추출한 얼굴 랜드마크" },
            { src: "/project-assets/noongil/head-pose-landmarks.png", alt: "얼굴 위상 추정에 선택한 FaceMesh 랜드마크" },
            { src: "/project-assets/noongil/face-vector.png", alt: "영상 위에 투영한 얼굴 위상 벡터" },
            { src: "/project-assets/noongil/gaze-diagram-1.png", alt: "시선 벡터와 화면 평면 교점 계산 도식" },
          ],
          caption: "랜드마크 추출에서 얼굴 좌표계와 화면 교점 계산까지",
        },
        decisions: [
          {
            title: "정규화 좌표의 변환",
            issue: "FaceMesh의 X·Y는 입력 이미지 기준 정규화 값이고 Z는 추정 거리라 화면 좌표로 바로 쓸 수 없다.",
            framing: "얼굴 검출이 아니라 카메라 영상과 화면 좌표계로 옮기는 문제로 정의하였다.",
            options: "새 모델 학습과 수작업 검출은 데이터·실시간성 비용 때문에 기각하였다.",
            solution: "필요 랜드마크를 추출해 X·Y에 영상 크기를 곱했다. Z 추정 오차는 이후 단계에 남았다.",
          },
          {
            title: "얼굴 위상 추정",
            issue: "같은 동공 위치도 머리 방향이 달라지면 화면상의 의미가 달라진다.",
            framing: "동공만 읽지 않고 얼굴 기준 좌표계를 먼저 세우는 문제로 보았다.",
            options: "모든 랜드마크는 복잡하고 단일 코 점은 회전축을 만들 수 없어 세 점을 선택했다.",
            solution: "10번·152번 중점을 원점, 코끝 방향을 Z축, 상단 방향을 Y축으로 정의했다.",
          },
          {
            title: "중간 결과의 시각화",
            issue: "3차원 얼굴 위상 벡터를 계산해도 방향이 맞는지 화면에서 확인할 수 없었다.",
            framing: "최종 UI가 아니라 좌표 변환 오류를 찾는 검증 장치의 문제로 정의하였다.",
            options: "수치 로그와 별도 3D 뷰어 대신 이미지 평면 투영을 택했다.",
            solution: "가상 초점 거리와 길이 계수로 벡터를 2D 영상 위에 그려 중간 결과를 검증했다.",
          },
          {
            title: "눈 회전과 화면 평면의 교점",
            issue: "동공 중심은 화면 좌표가 아니며 최종 목표는 회전각이 아니라 화면상의 한 점이다.",
            framing: "안구 중심과 동공의 상대 위치, 두 시선 직선과 화면 평면의 교점 문제로 정의하였다.",
            options: "동공 좌표 직접 매핑과 단안 추정은 머리 자세·개인차에 취약해 기각하였다.",
            solution: "양쪽 눈의 시선 직선이 화면 평면과 만나는 두 점의 중점을 응시 지점으로 간주했다.",
          },
        ],
      },
      {
        id: "noongil-result",
        number: "03",
        title: "노이즈가 아니라 기하 모델의 가정이 무너지다",
        media: {
          items: [
            { src: "/project-assets/noongil/ellipse-eye-model.png", alt: "타원 방정식으로 눈의 위상을 구하는 대안 모델" },
            { src: "/project-assets/noongil/gaze-diagram-2.png", alt: "양쪽 눈의 시선 벡터를 화면 좌표로 변환하는 도식" },
          ],
          caption: "기존 삼각 모델의 한계와 타원 기반 눈 모델 후보",
        },
        decisions: [
          {
            title: "얼굴 위상 이후의 한계",
            issue: "얼굴 위상은 도출했지만 눈 위상은 눈 크기와 얼굴이 화면에 평행하다는 조건에서만 안정적이었다.",
            framing: "랜드마크 노이즈가 아니라 실제 눈과 얼굴 형태를 충분히 표현하지 못한 모델의 문제로 다시 정의하였다.",
            options: "기존 삼각 관계에 보정값만 더하면 같은 가정이 남으므로 타원 모델과 이미지 기반 학습을 후보로 두었다.",
            solution: "현재 구현의 범위를 얼굴 위상 추정까지로 한정하고 시선 위치 추정은 다음 모델로 피벗할 과제로 남겼다.",
          },
        ],
      },
    ],
    conclusion: [
      "눈길은 정확한 아이트래킹을 달성한 프로젝트가 아니라, 추가 장비 없는 접근성을 우선한 기하 접근이 어디까지 작동하고 어디서 무너지는지 확인한 연구다.",
    ],
    limitations: [
      "FaceMesh의 Z와 안구 중심은 추정값이며 개인별 캘리브레이션이 없다.",
      "눈 위상 모델은 눈 크기와 얼굴 자세에 대한 강한 가정을 요구한다.",
      "양안 교점의 중점은 사시 등 시각적 개인차에서 부정확할 수 있다.",
      "정량 정확도 지표 없이 얼굴 위상 구현 확인 단계에 머물렀다.",
    ],
    nextSteps: [
      "눈 외형을 타원으로 모델링해 현재 삼각 관계의 가정을 줄인다.",
      "눈·동공 이미지를 입력으로 하는 회귀 모델과 기하 모델을 비교한다.",
      "사용자별 화면 캘리브레이션과 정량 오차 측정 절차를 추가한다.",
    ],
  },
];

export const PROJECT_CASE_STUDY_INDEX = studies.map((study) => ({
  slug: study.slug,
  name: study.name,
  order: study.order,
  accent: study.accent,
  statusLabel: study.statusLabel,
  tagline: study.tagline,
  taglineEn: study.taglineEn,
  description: study.description,
  descriptionEn: study.descriptionEn,
  tags: study.tags,
  repositoryUrl: study.repositoryUrl,
  heroImage: study.heroImage,
  heroImageAlt: study.heroImageAlt,
  heroFit: study.heroFit,
}));

const studyBySlug = new Map(studies.map((study) => [study.slug, study]));

export function getProjectCaseStudy(slug: string): ProjectCaseStudy | null {
  return studyBySlug.get(slug) || null;
}

export function getProjectCaseStudySlugs(): string[] {
  return studies.map((study) => study.slug);
}
