# EUM Backoffice — 프로젝트 구조

_Last updated: 2026-04-29_

## 전체 디렉토리

```
eum_backoffice/
  src/
    api/
      apiSlice.js           RTK Query 베이스 슬라이스 (createApi)
      authApi.js            adminLogin / adminLogout / getAdminMe
      orderApi.js           주문 관리 + Outbox 이벤트 API
      paymentApi.js         결제 관리 + 정산 + 멱등성 위반 API
      inventoryApi.js       재고 현황 + 이벤트 히스토리 + 추적 API
      monitoringApi.js      서비스 헬스 + Kafka lag + 로그 검색 API
    features/
      auth/
        authSlice.js        isInitialized 상태
        useAdminAuth.js     useGetAdminMeQuery 래퍼
        AdminProtectedRoute.jsx  미인증 → /login 리디렉트
        AdminLoginPage.jsx  다크 테마 로그인 폼
      components/
        layout/
          AdminLayout.jsx   Sidebar + TopBar + <Outlet> 레이아웃
          Sidebar.jsx       좌측 네비게이션 (접기/펼치기)
          TopBar.jsx        상단바 (페이지 제목, 로그아웃)
        ui/
          Toast.jsx         Redux toasts 구독 알림 컴포넌트
      dashboard/
        DashboardPage.jsx   시스템 요약 (StatCard 그리드, 30s 폴링)
      order/
        OrderManagementPage.jsx   주문 목록 + Outbox + 불일치 탭
        OutboxRetryPanel.jsx      Outbox 미처리 이벤트 재시도/보상
      payment/
        PaymentReconciliationPage.jsx  결제 목록 + 정산 + 멱등성 탭
      inventory/
        InventoryMonitorPage.jsx  재고 현황 + 이벤트 + 추적 탭
      monitoring/
        ServiceHealthPage.jsx  서비스 헬스 카드 + Kafka lag (15s 폴링)
        LogViewerPage.jsx      ELK 로그 검색 + 주문 타임라인 + 감사 로그
      ui/
        uiSlice.js          toasts 배열 + sidebarCollapsed
    hooks/
      useAppDispatch.js
      useAppSelector.js
    shared/
      components/
        Spinner.jsx         로딩 스피너 (fullscreen / inline)
        Badge.jsx           상태 뱃지 (status → 색상 자동 매핑)
        DataTable.jsx       columns+data 기반 공통 테이블
      utils/
        formatters.js       formatPrice / formatDate / getStatusLabel 등
    store/
      store.js              Redux configureStore
    router.jsx              createBrowserRouter 라우트 트리
    main.jsx                RouterProvider + Provider 루트
    index.css               Tailwind v4 + @theme 다크 변수
  index.html
  vite.config.js            포트 5174, usePolling, @theme 플러그인
  CLAUDE.md
```

## 라우트 트리

```
/login                    AdminLoginPage (비보호)
/                         AdminProtectedRoute > AdminLayout
  /dashboard              DashboardPage
  /orders                 OrderManagementPage
  /payments               PaymentReconciliationPage
  /inventory              InventoryMonitorPage
  /monitoring             ServiceHealthPage
  /logs                   LogViewerPage
*                         → /dashboard
```

## RTK Query 태그 타입

| 태그 | 관련 API |
|------|---------|
| `AdminOrder` | 주문 목록, 불일치 |
| `AdminOutbox` | Outbox 이벤트 |
| `AdminPayment` | 결제 목록 |
| `AdminMonitoring` | 서비스 헬스, Kafka lag, 대시보드 |
| `AdminLog` | 로그 검색, 타임라인 |
| `AuditLog` | 감사 로그 |
| `AdminInventory` | 재고 현황, 이벤트, 추적 |
