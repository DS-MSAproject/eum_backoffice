import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import authReducer, { logout } from '@/features/auth/authSlice'
import uiReducer from '@/features/ui/uiSlice'

import { apiSlice } from '@/api/apiSlice'

import '@/api/authApi'
import '@/api/orderApi'
import '@/api/paymentApi'
import '@/api/inventoryApi'
import '@/api/monitoringApi'

const logoutMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action)
  if (action.type === logout.type) {
    storeAPI.dispatch(apiSlice.util.resetApiState())
  }
  return result
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui:   uiReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.baseQueryMeta.request', 'meta.baseQueryMeta.response'],
      },
    }).concat(apiSlice.middleware, logoutMiddleware),
  devTools: import.meta.env.DEV,
})

setupListeners(store.dispatch)
export default store
