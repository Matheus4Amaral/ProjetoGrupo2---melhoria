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
import { Toaster } from 'react-hot-toast'

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
  //Configuração do Toaster para exibir notificações de sucesso e erro com estilos personalizados
 <StrictMode>
  <RouterProvider router={router} />

  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3500,
      style: {
        background: '#ffffff',
        color: '#12372a',
        border: '1px solid #d9e8df',
      },
      success: {
        iconTheme: {
          primary: '#14966f',
          secondary: '#ffffff',
        },
      },
      error: {
        iconTheme: {
          primary: '#d14343',
          secondary: '#ffffff',
        },
      },
    }}
  />
</StrictMode>
)
