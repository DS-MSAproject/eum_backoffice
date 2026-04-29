import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
    sidebarCollapsed: false,
  },
  reducers: {
    addToast(state, { payload }) {
      state.toasts.push({ id: Date.now(), duration: 3000, ...payload })
    },
    removeToast(state, { payload }) {
      state.toasts = state.toasts.filter((t) => t.id !== payload)
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
  },
})

export const { addToast, removeToast, toggleSidebar } = uiSlice.actions
export const selectToasts = (s) => s.ui.toasts
export const selectSidebarCollapsed = (s) => s.ui.sidebarCollapsed
export default uiSlice.reducer
