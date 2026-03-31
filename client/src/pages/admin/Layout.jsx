import React, { useEffect } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Loading from '../../components/Loading'

const Layout = () => {

  const { isAdmin, fetchIsAdmin } = useAppContext();

  useEffect(() => {
    fetchIsAdmin();
  }, []);

  return isAdmin ? (
    <>
      <AdminNavbar />

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-10 md:px-10">
          <Outlet />
        </div>
      </div>
    </>
  ) : <Loading />
}

export default Layout