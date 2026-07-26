import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import Login from './screens/Login.jsx'
import Register from './screens/Register.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Stock from './screens/Stock.jsx'
import Sale from './screens/Sale.jsx'
import Profile from './screens/Profile.jsx'
import ForgotPassword from './screens/ForgotPassword.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/dashboard',
    element:(
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ) 
  },
  {
    path: '/stock',
    element: (
      <ProtectedRoute>
        <Stock />
      </ProtectedRoute>
    ) 
  },
  {
    path: '/sale',
    element: (
      <ProtectedRoute>
        <Sale />
      </ProtectedRoute>
    ) 
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ) 
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword/>
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
