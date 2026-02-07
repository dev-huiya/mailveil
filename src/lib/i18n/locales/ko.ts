import type en from "./en";

const ko: typeof en = {
  // Common
  "common.appName": "MailVeil",
  "common.loading": "로딩 중...",
  "common.cancel": "취소",
  "common.delete": "삭제",
  "common.deleting": "삭제 중...",
  "common.save": "저장",
  "common.saving": "저장 중...",
  "common.add": "추가",
  "common.adding": "추가 중...",
  "common.active": "활성",
  "common.inactive": "비활성",
  "common.enabled": "켜짐",
  "common.disabled": "꺼짐",
  "common.verified": "인증됨",
  "common.pending": "대기 중",
  "common.copied": "클립보드에 복사됨",
  "common.copyFailed": "복사 실패",
  "common.export": "내보내기",
  "common.search": "검색",
  "common.copy": "복사",
  "common.refresh": "새로고침",

  // Auth
  "auth.title": "MailVeil",
  "auth.subtitle": "PIN을 입력하세요",
  "auth.invalidPin": "잘못된 PIN입니다",
  "auth.connectionError": "연결 오류",
  "auth.keyboardHint": "키보드로 PIN을 입력하세요",
  "auth.logout": "로그아웃",

  // Nav
  "nav.dashboard": "대시보드",
  "nav.rules": "규칙",
  "nav.newRule": "새 규칙",
  "nav.destinations": "수신 주소",
  "nav.settings": "설정",

  // Theme
  "theme.toggle": "테마 전환",
  "theme.light": "라이트",
  "theme.dark": "다크",
  "theme.system": "시스템",

  // Dashboard
  "dashboard.title": "대시보드",
  "dashboard.totalRules": "전체 규칙",
  "dashboard.active": "활성",
  "dashboard.inactive": "비활성",
  "dashboard.catchAll": "Catch-All",
  "dashboard.recentRules": "최근 규칙",
  "dashboard.noRules": "아직 규칙이 없습니다.",
  "dashboard.createFirst": "첫 번째 규칙 만들기",
  "dashboard.viewAll": "전체 {count}개 규칙 보기",
  "dashboard.loadError": "대시보드 데이터를 불러오지 못했습니다",

  // Rules
  "rules.title": "규칙",
  "rules.newRule": "새 규칙",
  "rules.searchPlaceholder": "규칙 검색...",
  "rules.noRules": "아직 규칙이 없습니다",
  "rules.createFirst": "첫 번째 규칙 만들기",
  "rules.name": "이름",
  "rules.from": "보낸 곳",
  "rules.to": "받는 곳",
  "rules.status": "상태",
  "rules.drop": "삭제(Drop)",
  "rules.deleteTitle": "규칙 삭제",
  "rules.deleteDescription":
    '"{name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
  "rules.enabled": "규칙 활성화됨",
  "rules.disabled_toast": "규칙 비활성화됨",
  "rules.deleted": "규칙이 삭제되었습니다",
  "rules.loadError": "규칙을 불러오지 못했습니다",
  "rules.updateError": "규칙 업데이트에 실패했습니다",
  "rules.deleteError": "규칙 삭제에 실패했습니다",
  "rules.exported": "규칙을 내보냈습니다",

  // New Rule
  "newRule.title": "새 규칙 만들기",
  "newRule.category": "카테고리",
  "newRule.manualInput": "직접 입력",
  "newRule.generatedEmail": "생성된 이메일",
  "newRule.emailAddress": "이메일 주소",
  "newRule.ruleName": "규칙 이름",
  "newRule.ruleNamePlaceholder": "자동 생성된 규칙 이름",
  "newRule.forwardTo": "전달 대상",
  "newRule.selectDestination": "수신 주소 선택",
  "newRule.noDestinations":
    "인증된 수신 주소가 없습니다. 수신 주소 페이지에서 추가하세요.",
  "newRule.create": "규칙 생성",
  "newRule.creating": "생성 중...",
  "newRule.created": "규칙이 생성되었습니다",
  "newRule.selectDestError": "수신 주소를 선택하세요",
  "newRule.enterEmailError": "이메일 주소를 입력하세요",
  "newRule.loadError": "수신 주소를 불러오지 못했습니다",

  // Categories
  "category.shopping": "쇼핑",
  "category.social": "소셜",
  "category.finance": "금융",
  "category.gaming": "게임",
  "category.dev": "개발",
  "category.newsletter": "뉴스레터",
  "category.general": "일반",

  // Destinations
  "destinations.title": "수신 주소",
  "destinations.addTitle": "수신 주소 추가",
  "destinations.addDescription": "확인 이메일이 발송됩니다.",
  "destinations.emailPlaceholder": "email@example.com",
  "destinations.noDestinations": "아직 수신 주소가 없습니다",
  "destinations.addFirst": "첫 번째 수신 주소 추가",
  "destinations.email": "이메일",
  "destinations.statusCol": "상태",
  "destinations.added": "추가일",
  "destinations.emailDestinations": "이메일 수신 주소",
  "destinations.setDefault": "기본으로 설정",
  "destinations.removeDefault": "기본 설정 해제",
  "destinations.defaultSet": "{email}을(를) 기본 수신 주소로 설정했습니다",
  "destinations.defaultCleared": "기본 수신 주소가 해제되었습니다",
  "destinations.deleteTitle": "수신 주소 삭제",
  "destinations.deleteDescription":
    '"{email}"을(를) 삭제하시겠습니까? 이 주소로 전달되는 규칙이 작동하지 않게 됩니다.',
  "destinations.verificationSent":
    "인증 이메일이 발송되었습니다. 받은편지함을 확인하세요.",
  "destinations.deleted": "수신 주소가 삭제되었습니다",
  "destinations.loadError": "수신 주소를 불러오지 못했습니다",
  "destinations.addError": "수신 주소 추가에 실패했습니다",
  "destinations.deleteError": "수신 주소 삭제에 실패했습니다",

  // Settings
  "settings.title": "설정",
  "settings.emailRouting": "이메일 라우팅",
  "settings.emailRoutingDesc": "도메인의 이메일 라우팅을 켜거나 끕니다.",
  "settings.status": "상태: {status}",
  "settings.catchAll": "Catch-All 규칙",
  "settings.catchAllDesc":
    "특정 규칙에 매칭되지 않는 이메일을 처리합니다.",
  "settings.enableCatchAll": "Catch-All 활성화",
  "settings.action": "동작",
  "settings.forward": "전달",
  "settings.drop": "삭제(Drop)",
  "settings.forwardTo": "전달 대상",
  "settings.selectDestination": "수신 주소 선택",
  "settings.routingEnabled": "이메일 라우팅이 활성화되었습니다",
  "settings.routingDisabled": "이메일 라우팅이 비활성화되었습니다",
  "settings.catchAllUpdated": "Catch-all 규칙이 업데이트되었습니다",
  "settings.loadError": "설정을 불러오지 못했습니다",
  "settings.updateRoutingError": "이메일 라우팅 업데이트에 실패했습니다",
  "settings.updateCatchAllError":
    "Catch-all 규칙 업데이트에 실패했습니다",
};

export default ko;
