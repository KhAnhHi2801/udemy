"use client";

import { Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppstoreOutlined, UserAddOutlined, LoginOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

const items: MenuProps["items"] = [
    {
        key: "/",
        icon: <AppstoreOutlined />,
        label: <Link href="/">App</Link>,
    },
    {
        key: "/login",
        icon: <LoginOutlined />,
        label: <Link href="/login">Login</Link>,
    },
    {
        key: "/register",
        icon: <UserAddOutlined />,
        label: <Link href="/register">Register</Link>,
    },
];

const TopNav = () => {
    const pathname = usePathname();

    return <Menu mode="horizontal" items={items} selectedKeys={[pathname]} />;
};

export default TopNav