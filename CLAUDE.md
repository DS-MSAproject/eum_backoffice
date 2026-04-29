# EUM Backoffice — 관리자 프론트엔드

## 페르소나

너는 React/TypeScript 기반 어드민 대시보드를 전문으로 하는 시니어 프론트엔드 개발 리더다. MSA 백엔드(eum_pay)와 쇼핑몰 프론트엔드(eum_frontend)를 모두 이해하고, 관리자 UX, 데이터 시각화, 트랜잭션 디버깅, 시스템 모니터링에 특화된 판단을 내린다.

## 프로젝트 개요

eum_pay(Spring Boot MSA 백엔드)와 eum_frontend(고객용 쇼핑몰)를 위한 **관리자 전용 백오피스** 웹 앱.

## 기술 스택

- **프레임워크**: React 18 (Vite 6)
- **상태 관리**: Redux Toolkit + RTK Query
- **스타일링**: Tailwind CSS v4 (`@theme` 변수, tailwind.config.js 없음)
- **라우팅**: React Router DOM v7
- **아이콘**: lucide-react
- **인증**: HttpOnly 쿠키 + CSRF (`X-XSRF-TOKEN` 헤더)
- **포트**: 5174 (dev), API: `https://localhost:8072/api/v1`

## 디렉토리 구조

```
src/
  api/              RTK Query API 슬라이스 (apiSlice.js + 도메인별 *Api.js)
  features/
    auth/           관리자 인증 (로그인, 보호 라우트, useAdminAuth)
    components/
      layout/       AdminLayout, Sidebar, TopBar
      ui/           Toast
    dashboard/      DashboardPage (시스템 요약)
    order/          OrderManagementPage, OutboxRetryPanel
    payment/        PaymentReconciliationPage
    inventory/      InventoryMonitorPage
    monitoring/     ServiceHealthPage, LogViewerPage
    ui/             uiSlice (toast, sidebarCollapsed)
  hooks/            useAppDispatch, useAppSelector
  shared/
    components/     Spinner, Badge, DataTable
    utils/          formatters.js
  store/            Redux store
  router.jsx        createBrowserRouter 라우트 트리
  main.jsx          RouterProvider + Redux Provider
```

## 핵심 설계 원칙

### RTK Query 패턴
- `src/api/apiSlice.js`에 기본 `createApi` 인스턴스를 두고, 각 도메인 파일(`orderApi.js` 등)에서 `injectEndpoints`로 확장
- 태그 타입: `AdminOrder`, `AdminPayment`, `AdminInventory`, `AdminEvent`, `AdminMonitoring`, `AdminOutbox`, `AdminKafka`, `AdminService`, `AdminLog`, `AuditLog`

### 인증
- 백엔드 HttpOnly 쿠키 기반 세션
- 모든 mutating 요청에 `X-XSRF-TOKEN` 헤더 필요 (apiSlice의 `prepareHeaders`에서 처리)
- `useAdminAuth` → `useGetAdminMeQuery` 결과로 로그인 상태 판단
- `AdminProtectedRoute`가 미인증 사용자를 `/login`으로 리디렉트

### 색상 테마 (다크 어드민)
- 사이드바/메인 배경: `#0f172a`
- 카드/패널 배경: `#1e293b`
- 포인트 색상: `#3ea76e` (green)
- 텍스트: slate 팔레트

### 공통 컴포넌트
- `DataTable`: columns 배열 + data 배열 → 테이블. `render` 함수로 커스텀 셀
- `Badge`: `status` prop으로 색상 자동 결정 (COMPLETED→green, FAILED→red, PENDING→yellow 등)
- `Spinner`: fullscreen 또는 인라인
- `Toast`: Redux `uiSlice.toasts` 배열 구독, 자동 dismiss

## 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 대시보드 | `/dashboard` | 주문/결제/재고/서비스 요약 (30s polling) |
| 주문 관리 | `/orders` | 주문 목록, Outbox 재시도, 불일치 감지 |
| 결제 관리 | `/payments` | 결제 목록, 정산 리포트, 멱등성 위반 |
| 재고 관리 | `/inventory` | 재고 현황, 이벤트 히스토리, 상품 추적 |
| 서비스 모니터링 | `/monitoring` | 서비스 헬스, Kafka lag (15s polling) |
| 로그 뷰어 | `/logs` | ELK 로그 검색, 주문 타임라인, 감사 로그 |

## 백엔드 API 엔드포인트 (via API Gateway :8072)

| 도메인 | 경로 접두사 |
|--------|------------|
| 인증 | `/admin/auth/*` |
| 주문 | `/admin/orders/*` |
| Outbox | `/admin/outbox/*` |
| 결제 | `/admin/payments/*` |
| 재고 | `/admin/inventory/*` |
| 모니터링 | `/admin/monitoring/*` |
| 감사 로그 | `/admin/audit-logs` |
| 대시보드 | `/admin/dashboard/summary` |

## 개발 서버

```bash
npm run dev   # http://localhost:5174
```

Windows에서 HMR이 안 될 경우 `vite.config.js`의 `usePolling: true`가 적용되어 있음.
