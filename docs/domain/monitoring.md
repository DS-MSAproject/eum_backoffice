# Monitoring — 시스템 모니터링 & 로그

_Last updated: 2026-04-29_

## 개요

서비스 헬스 체크, Kafka Consumer Lag, ELK 로그 검색, 주문 타임라인, 관리자 감사 로그.

## API (monitoringApi.js)

| 쿼리 | 경로 | 설명 |
|------|------|------|
| `getServicesHealth` | GET `/admin/monitoring/health` | 전체 서비스 상태 (UP/DOWN/DEGRADED) |
| `getKafkaConsumerLag` | GET `/admin/monitoring/kafka-lag` | Consumer Group별 lag |
| `searchLogs` | GET `/admin/monitoring/logs` | ELK 로그 검색 (keyword, service, level, from, to) |
| `getOrderLogTimeline` | GET `/admin/monitoring/logs/timeline/{orderId}` | 주문 ID 기준 서비스 간 로그 타임라인 |
| `getAuditLogs` | GET `/admin/audit-logs` | 관리자 액션 감사 로그 |
| `getDashboardSummary` | GET `/admin/dashboard/summary` | 대시보드 요약 통계 |

## 컴포넌트

### `ServiceHealthPage`
- 서비스 카드 그리드 (15초 폴링)
- Kafka Consumer Lag 테이블 — lag > 100 빨간색, lag > 10 노란색

### `LogViewerPage`
3개 탭:
- **로그 검색**: 키워드/서비스/레벨/시간범위 필터 → ELK 조회
- **주문 타임라인**: orderId 입력 → 서비스 간 이벤트 타임라인 (수직 타임라인 UI)
- **감사 로그**: 관리자 액션 이력 (DataTable)

### `DashboardPage`
- 30초 폴링
- StatCard 그리드: 오늘 주문, 오늘 결제, 재고 부족, 실패 주문, 결제 불일치, 서비스 상태
- Kafka Lag 요약 패널
