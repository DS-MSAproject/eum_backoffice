# Order — 주문 관리

_Last updated: 2026-04-29_

## 개요

주문 목록 조회, 주문-결제 불일치 감지, Transactional Outbox 이벤트 재시도/보상 트랜잭션 실행.

## API (orderApi.js)

| 쿼리/뮤테이션 | 경로 | 설명 |
|--------------|------|------|
| `getAdminOrders` | GET `/admin/orders` | 주문 목록 (page, size, status 필터) |
| `getOrderInconsistencies` | GET `/admin/orders/inconsistencies` | 주문-결제 불일치 목록 |
| `getOutboxPendingEvents` | GET `/admin/outbox/pending` | 처리 실패 Outbox 이벤트 목록 |
| `retryOutboxEvent` | POST `/admin/outbox/{id}/retry` | Outbox 이벤트 재시도 |
| `applyCompensation` | POST `/admin/outbox/{id}/compensate` | 보상 트랜잭션 실행 |

## 컴포넌트

### `OrderManagementPage`
3개 탭: 전체 주문 / Outbox 이벤트 / 불일치 주문.  
주문 목록은 상태 필터 + 페이지네이션 지원.

### `OutboxRetryPanel`
미처리 Outbox 이벤트 목록. 재시도 횟수 3회 이상이면 빨간색 경고.  
재시도: `retryOutboxEvent(id)`, 보상: `applyCompensation(id)` (confirm 팝업 필수).
