import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./header/Header";

function AdminLayout() {

    return (
        <>
            <Outlet />
        </>
    )
}

export default AdminLayout;