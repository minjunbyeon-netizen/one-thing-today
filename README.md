<<<<<<< HEAD
# One Thing Today

> 하루에 딱 한 가지. 가장 중요한 것 하나만.

Expo (React Native) 기반 iOS/Android 앱.

---

## 앱 개요

할 일이 너무 많으면 아무것도 못 합니다.
오늘 반드시 해야 할 **한 가지**만 정하고, 완료하면 체크합니다.
매일 쌓이는 스트릭이 습관을 만들어줍니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| 오늘의 한 가지 | 제목 + 메모 입력, 완료 체크 |
| 스트릭 | 연속 달성일 자동 계산 |
| 달성 기록 | 날짜별 히스토리 (무료: 최근 7일) |
| 알림 | 아침/저녁 리마인더 (시간 설정 가능) |
| 프리미엄 | 히스토리 무제한, 타이머, 위젯 등 |
| 온보딩 | 첫 실행 시 3페이지 가이드 |
| 다크모드 | 시스템 설정 자동 연동 |

---

## 기술 스택

- **Framework**: Expo SDK 54 (React Native 0.81)
- **Router**: Expo Router v6 (파일 기반 라우팅)
- **DB**: expo-sqlite v15 (로컬 SQLite)
- **애니메이션**: react-native-reanimated v4
- **알림**: expo-notifications
- **보안 저장소**: expo-secure-store (프리미엄 상태)
- **언어**: TypeScript

---

## 프로젝트 구조

```
app/
  (tabs)/
    index.tsx          # 홈 - 오늘의 한 가지
    history.tsx        # 달성 기록
    settings.tsx       # 설정 (알림, 프리미엄)
  modal/
    premium.tsx        # 프리미엄 구독 모달
  onboarding.tsx       # 온보딩 (첫 실행)
  _layout.tsx          # 루트 레이아웃 (TaskProvider)

components/
  check-button.tsx     # 완료 체크 애니메이션 버튼
  history-item.tsx     # 히스토리 목록 아이템
  streak-badge.tsx     # 연속 달성일 배지
  premium-gate.tsx     # 프리미엄 잠금 게이트

contexts/
  TaskContext.tsx      # 전역 상태 (오늘 할일, 스트릭, 프리미엄)

hooks/
  use-database.ts      # SQLite 초기화 및 공통 쿼리
  use-today-task.ts    # 오늘 할일 CRUD
  use-history.ts       # 날짜별 달성 기록 조회
  use-streak.ts        # 연속 달성일 계산
  use-premium.ts       # 프리미엄 상태 관리
  use-notifications.ts # 알림 스케줄링
```

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# Android 에뮬레이터
npm run android

# iOS 시뮬레이터
npm run ios
```

---

## 프리미엄 플랜

| 플랜 | 가격 | 비고 |
|---|---|---|
| 월간 구독 | 2,900원/월 | |
| 연간 구독 | 19,900원/년 | 월 1,658원 (43% 할인) |
| 평생 이용권 | 39,900원 | 한 번만 |

> 실제 결제 연동은 `hooks/use-premium.ts`의 `activate()` 함수에서 처리.
> 현재는 테스트용 즉시 활성화 구현.

---

## 데이터베이스 스키마

```sql
-- 일별 할일
CREATE TABLE daily_tasks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  date         TEXT    NOT NULL UNIQUE,   -- YYYY-MM-DD
  title        TEXT    NOT NULL DEFAULT '',
  note         TEXT    NOT NULL DEFAULT '',
  completed    INTEGER NOT NULL DEFAULT 0, -- 0 | 1
  completed_at TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 설정 키-값
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 주요 설계 결정

- **하루 1개 제한**: `daily_tasks.date UNIQUE` 제약으로 DB 레벨에서 보장
- **자정 감지**: AppState `active` 이벤트로 날짜 변경 감지 → 자동 리셋
- **프리미엄 저장**: expo-secure-store 우선, 없으면 AsyncStorage 폴백
- **히스토리 잠금**: 무료 사용자는 최근 7건만 표시, 나머지 `isLocked: true`
- **알림**: expo-notifications 없는 환경도 안전하게 폴백 처리

---

## Android 빌드 정보

- **패키지명**: `com.mjbyeon.onethingtoday`
- **Adaptive Icon 배경색**: `#E6F4FE`
- **테마색**: `#6C63FF` (보라)

---

## 라이선스

Private
=======
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
