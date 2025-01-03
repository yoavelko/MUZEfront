import './App.css'
import { Route, Routes, Outlet } from "react-router-dom";
import Client from './components/client/Client'
import Admin from './components/admin/Admin';
import AdminLayout from './components/admin/AdminLayout';
import { SocketProvider } from './contexts/SocketContext';
import Dashboard from './components/dashboard/Dashboard';

function App() {

  return (
    <>
      <div id='app-container'>
        <SocketProvider>
          <Routes>
            <Route path='/' element={<><Outlet /></>}>
              <Route index element={<Client />} />
              <Route path='/admin' element={<AdminLayout />}>
                <Route index element={<Admin />} />
                <Route path='dashboard' element={<Dashboard />} />
              </Route>
              <Route path='/callback' element={<>error</>} />
            </Route>
          </Routes>
        </SocketProvider>
      </div>
    </>
  )
}

export default App
