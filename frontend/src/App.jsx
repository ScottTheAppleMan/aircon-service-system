// Routing for the whole app, matching the architecture diagram: main.jsx feeds
// App, App routes to the login page, and the login page hands users on to the
// admin, technician or customer portal based on accountType.

import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import UnauthorizedPage from './pages/auth/UnauthorizedPage'
import PortalPlaceholder from './pages/PortalPlaceholder'
import CustomerLayout from './layouts/CustomerLayout'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import BookService from './pages/customer/BookService'
import MyBookings from './pages/customer/MyBookings'
import LoyaltyPoints from './pages/customer/LoyaltyPoints'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import { ACCOUNT_TYPES } from './constants/accountTypes'

function App() {
  return (
    <Routes>
      {/* Everyone starts at the login page. */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Hidden once signed in — PublicOnlyRoute sends you to your portal. */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Customer portal — booking and loyalty. */}
      <Route element={<ProtectedRoute allow={[ACCOUNT_TYPES.CUSTOMER]} />}>
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="book" element={<BookService />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="loyalty" element={<LoyaltyPoints />} />
        </Route>
      </Route>

      {/* Admin portal — Meet's inventory and promotions screens. */}
      <Route element={<ProtectedRoute allow={[ACCOUNT_TYPES.ADMIN]} />}>
        <Route
          path="/admin"
          element={
            <PortalPlaceholder
              title="Admin portal"
              owner="Meet"
              upcoming={[
                'Inventory management',
                'Promotions',
                'Manage users and technicians',
                'Assign and reassign bookings',
              ]}
            />
          }
        />
      </Route>

      {/* Technician portal — replace this route with the pages already built on
          the billie-frontend branch; the path is the one that branch uses. */}
      <Route element={<ProtectedRoute allow={[ACCOUNT_TYPES.TECHNICIAN]} />}>
        <Route
          path="/technician/dashboard"
          element={
            <PortalPlaceholder
              title="Technician portal"
              owner="Min Thaw Tar"
              upcoming={['Assigned jobs', 'Submit service report', 'Follow-ups', 'Job history']}
            />
          }
        />
      </Route>

      {/* Unknown URL: the guards decide where an unsigned user ends up. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
