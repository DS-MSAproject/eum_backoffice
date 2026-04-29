import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { isInitialized: false },
  reducers: {
    setInitialized(state) { state.isInitialized = true },
    logout() {},
  },
})

export const { setInitialized, logout } = authSlice.actions
export default authSlice.reducer
