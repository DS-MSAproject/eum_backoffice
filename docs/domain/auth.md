# Auth — 관리자 인증

_Last updated: 2026-04-29_

## 개요

HttpOnly 쿠키 기반 세션 인증. CSRF 토큰은 `X-XSRF-TOKEN` 헤더로 전송.

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/admin/auth/login` | 관리자 로그인 (email + password) |
| POST | `/admin/auth/logout` | 로그아웃 (쿠키 만료) |
| GET | `/admin/auth/me` | 현재 관리자 정보 조회 |

## 컴포넌트

### `useAdminAuth`
`useGetAdminMeQuery()` 결과를 `{ admin, isLoggedIn, isLoading }` 형태로 래핑.  
`isLoggedIn = !!admin && !isError`.

### `AdminProtectedRoute`
`isLoading` 중 `<Spinner fullscreen />`, 미인증 시 `<Navigate to="/login" replace />`.

### `AdminLoginPage`
다크 테마(`#0f172a`) 로그인 폼. 실패 시 `error.data?.message` 표시.
