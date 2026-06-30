import { useTranslation } from "next-i18next/pages";
import { getTranslationProps } from "../lib/with-translations";
import { GetStaticProps } from "next/types";

const Login = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="jumbotron bg-primary text-center square">{t("login")}</h1>
    </>
  );
};

export const getStaticProps: GetStaticProps = getTranslationProps();

export default Login;
