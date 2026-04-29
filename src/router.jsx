import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminProtectedRoute from '@/features/auth/AdminProtectedRoute'
import AdminLoginPage from '@/features/auth/AdminLoginPage'
import AdminLayout from '@/features/components/layout/AdminLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'
import OrderManagementPage from '@/features/order/OrderManagementPage'
import PaymentReconciliationPage from '@/features/payment/PaymentReconciliationPage'
import InventoryMonitorPage from '@/features/inventory/InventoryMonitorPage'
import ServiceHealthPage from '@/features/monitoring/ServiceHealthPage'
import LogViewerPage from '@/features/monitoring/LogViewerPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/',
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'orders', element: <OrderManagementPage /> },
      { path: 'payments', element: <PaymentReconciliationPage /> },
      { path: 'inventory', element: <InventoryMonitorPage /> },
      { path: 'monitoring', element: <ServiceHealthPage /> },
      { path: 'logs', element: <LogViewerPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

export default router
