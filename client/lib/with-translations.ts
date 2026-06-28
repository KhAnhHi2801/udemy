import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import type { GetStaticProps } from "next";

// Namespaces that are commonly used across the application and should be included in the translation props by default. You can add more namespaces to this array if needed.
const DEFAULT_NAMESPACES = ["common", "errors"];

const getTranslationProps =
  (namespaces = DEFAULT_NAMESPACES): GetStaticProps =>
  async ({ locale }) => ({
    props: {
      ...(await serverSideTranslations(locale ?? "en", namespaces)),
    },
  });

export { getTranslationProps };
