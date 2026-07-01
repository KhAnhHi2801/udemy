import "bootstrap/dist/css/bootstrap.min.css";
import { ConfigProvider } from "antd";
import "../public/css/styles.css";
import "../components/TopNav";
import TopNav from "../components/TopNav";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../lib/query-client";
import { appWithTranslation } from "next-i18next/pages";
import nextI18nextConfig from "../next-i18next.config.js";
import { useMe } from "../hooks/use-auth";

function SessionVerifier({ children }) {
  useMe();
  return children;
}

function MyApp({ Component, pageProps }) {
  return (
    <ConfigProvider theme={{ cssVar: {} }}>
      <QueryClientProvider client={queryClient}>
        <SessionVerifier>
          <TopNav />
          <Component {...pageProps} />
        </SessionVerifier>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default appWithTranslation(MyApp, nextI18nextConfig);
