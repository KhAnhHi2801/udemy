import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import { Button, Dropdown, Menu } from "antd";
import Link from "next/link";
import {
  AppstoreOutlined,
  UserAddOutlined,
  LoginOutlined,
  GlobalOutlined,
  DownOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
];

const DEFAULT_LOCALE = "en";

const LocaleDropdown = () => {
  const router = useRouter();
  const currentLocale = router.locale ?? DEFAULT_LOCALE;
  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  const menuItems: MenuProps["items"] = LOCALES.filter(
    (l) => l.code !== currentLocale,
  ).map((l) => ({
    key: l.code,
    label: (
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{l.flag}</span>
        <span>{l.label}</span>
      </span>
    ),
    onClick: () =>
      router.push(router.pathname, router.asPath, { locale: l.code }),
  }));

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
      <Button icon={<GlobalOutlined />} shape="round">
        {current.flag} {current.code.toUpperCase()}{" "}
        <DownOutlined style={{ fontSize: 10 }} />
      </Button>
    </Dropdown>
  );
};

const TopNav = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  const navItems: MenuProps["items"] = [
    { key: "/", icon: <AppstoreOutlined />, label: <Link href="/">App</Link> },
    {
      key: "/login",
      icon: <LoginOutlined />,
      label: <Link href="/login">{t("nav.login")}</Link>,
    },
    {
      key: "/register",
      icon: <UserAddOutlined />,
      label: <Link href="/register">{t("nav.register")}</Link>,
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", padding: "0 16px" }}>
      <Menu
        mode="horizontal"
        items={navItems}
        selectedKeys={[router.pathname]}
        style={{ flex: 1, borderBottom: "none" }}
      />
      <LocaleDropdown />
    </div>
  );
};

export default TopNav;
