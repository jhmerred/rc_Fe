import { Report, ReportDetail } from "@/types/report";

export const mockReports: Report[] = [
  {
    id: "1",
    title: "리더십 역량 진단",
    date: new Date("2024-01-15"),
    description: "팀장급 이상 리더의 핵심 역량을 분석하고 개발 방향을 제시합니다",
    category: "리더십",
    score: 85,
    status: "excellent" as const,
  },
  {
    id: "2",
    title: "조직문화 적합도 평가",
    date: new Date("2024-01-10"),
    description: "현재 조직문화와 리더십 스타일의 정합성을 진단합니다",
    category: "조직",
    score: 78,
    status: "good" as const,
  },
  {
    id: "3",
    title: "성과관리 코칭 진단",
    date: new Date("2024-01-20"),
    description: "목표 설정 및 성과 피드백 능력을 평가하고 개선점을 도출합니다",
    category: "성과",
    score: 72,
    status: "good" as const,
  },
  {
    id: "4",
    title: "커뮤니케이션 스타일 분석",
    date: new Date("2024-01-08"),
    description: "팀원과의 소통 방식을 분석하고 효과적인 의사소통 전략을 제공합니다",
    category: "소통",
    score: 88,
    status: "excellent" as const,
  },
  {
    id: "5",
    title: "스트레스 관리 능력 평가",
    date: new Date("2024-01-05"),
    description: "업무 스트레스 대처 능력과 회복탄력성을 측정합니다",
    category: "건강",
    score: 65,
    status: "average" as const,
  },
  {
    id: "6",
    title: "팀워크 역량 진단",
    date: new Date("2023-12-28"),
    description: "팀 내 협업 능력과 기여도를 종합적으로 평가합니다",
    category: "협업",
    score: 82,
    status: "excellent" as const,
  },
];

export const mockReportDetails: Record<string, ReportDetail> = {
  "1": {
    id: "1",
    title: "리더십 역량 진단",
    date: new Date("2024-01-15"),
    description: "팀장급 이상 리더의 핵심 역량을 분석하고 개발 방향을 제시합니다",
    content: {
      summary: "귀하의 리더십 진단 결과, 전반적으로 우수한 리더십 역량을 보유하고 있으며, 특히 팀원들과의 소통과 비전 제시 능력이 뛰어납니다.",
      strengths: [
        "명확한 의사소통 능력",
        "팀원들의 동기부여 역량",
        "변화에 대한 적응력",
        "문제 해결 능력"
      ],
      improvements: [
        "위임 능력 개발 필요",
        "갈등 관리 스킬 향상",
        "전략적 사고 역량 강화"
      ],
      recommendations: [
        "리더십 코칭 프로그램 참여",
        "360도 피드백 정기적 실시",
        "멘토링 관계 구축",
        "리더십 관련 서적 독서"
      ]
    }
  },
  "2": {
    id: "2",
    title: "조직문화 적합도 평가",
    date: new Date("2024-01-10"),
    description: "현재 조직문화와 리더십 스타일의 정합성을 진단합니다",
    content: {
      summary: "귀하는 현재 조직문화와 높은 적합성을 보이며, 협업 중심의 리더십 스타일이 조직의 혁신 문화와 잘 부합합니다.",
      strengths: [
        "조직 가치와의 높은 일치도",
        "팀워크 중시 성향",
        "개방적 소통 스타일",
        "혁신에 대한 긍정적 태도"
      ],
      improvements: [
        "성과 지향성 강화",
        "개인별 맞춤 관리 필요",
        "변화 관리 역량 개발"
      ],
      recommendations: [
        "조직문화 워크숍 참여",
        "크로스 펑셔널 프로젝트 리드",
        "문화 전파 활동 참여",
        "조직 진단 도구 활용"
      ]
    }
  },
  "3": {
    id: "3",
    title: "성과관리 코칭 진단",
    date: new Date("2024-01-20"),
    description: "목표 설정 및 성과 피드백 능력을 평가하고 개선점을 도출합니다",
    content: {
      summary: "성과관리 측면에서 목표 설정은 우수하나, 지속적인 피드백과 성과 개선 지원 영역에서 추가 개발이 필요합니다.",
      strengths: [
        "명확한 목표 설정 능력",
        "성과 측정 체계 이해",
        "팀원 동기부여",
        "결과 중심 사고"
      ],
      improvements: [
        "정기적 피드백 제공",
        "개별 코칭 스킬",
        "성과 개선 계획 수립"
      ],
      recommendations: [
        "코칭 스킬 교육 참여",
        "1:1 미팅 정례화",
        "성과관리 도구 활용",
        "피드백 기법 학습"
      ]
    }
  },
  "4": {
    id: "4",
    title: "커뮤니케이션 스타일 분석",
    date: new Date("2024-01-08"),
    description: "팀원과의 소통 방식을 분석하고 효과적인 의사소통 전략을 제공합니다",
    content: {
      summary: "귀하는 직관적이고 협력적인 커뮤니케이션 스타일을 가지고 있으며, 팀원들과의 관계 구축에 뛰어난 능력을 보입니다.",
      strengths: [
        "경청 능력",
        "공감 능력",
        "명확한 표현력",
        "갈등 중재 능력"
      ],
      improvements: [
        "어려운 대화 진행 능력",
        "비언어적 소통 인식",
        "다양한 소통 채널 활용"
      ],
      recommendations: [
        "커뮤니케이션 워크숍 참여",
        "프레젠테이션 스킬 개발",
        "디지털 소통 도구 활용",
        "문화 간 소통 이해"
      ]
    }
  }
};

export const getReportById = (id: string): ReportDetail | null => {
  return mockReportDetails[id] || null;
};