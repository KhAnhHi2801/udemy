import { useState } from "react";
import { useRegister } from "../hooks/use-auth";
import { useTranslation } from "next-i18next/pages";
import { GetStaticProps } from "next";
import { getTranslationProps } from "../lib/with-translations";
import Link from "next/link";
import { SyncOutlined } from "@ant-design/icons";

const Register = () => {
  const { t } = useTranslation(["common", "errors"]);
  const [name, setName] = useState("Anya");
  const [email, setEmail] = useState("anya@example.com");
  const [password, setPassword] = useState("anyapassword");
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutate: registerUser, isPending } = useRegister(); // Assuming you have a mutation hook for registering users

  const onChangeValue = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(value);
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeValue(e.target.value, setName);
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeValue(e.target.value, setEmail);
  };

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeValue(e.target.value, setPassword);
  };

  const parseError = (code?: string, message?: string): string => {
    if (!code) return message ?? t("errors:SOMETHING_WENT_WRONG");
    // Backend Zod errors: "FIELD_TOO_SHORT:3" → key="FIELD_TOO_SHORT", param=3
    const [key, param] = code.split(":");
    if (param) {
      const paramKey =
        key === "FIELD_TOO_LONG" ? { max: param } : { min: param };
      return t(`errors:${key}`, paramKey);
    }
    return t(`errors:${code}`, { defaultValue: message ?? code });
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    // Prevent the default form submission behavior as page reload is not desired in a single-page application (SPA) like Next.js. This allows for handling the form submission logic without refreshing the page.
    e.preventDefault();
    setApiError(null);
    // Handle form submission logic here
    registerUser(
      { name, email, password },
      {
        onError: (err: any) => {
          const data = err?.response?.data;
          // Zod validation returns errors as an array, Prisma returns 1 object with a code
          if (data?.errors?.[0]) {
            setApiError(parseError(data.errors[0].message));
          } else {
            setApiError(parseError(data?.code, data?.message));
          }
        },
      },
    );
  };

  return (
    <>
      <h1 className="jumbotron bg-primary text-center square">
        {t("register")}
      </h1>

      <div className="container col-md-4 offset-md-4 pb-5">
        {apiError && <div className="alert alert-danger">{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control mb-4 p-4"
            placeholder={t("enter-name")}
            value={name}
            onChange={onChangeName}
            required
          />
          <input
            type="email"
            className="form-control mb-4 p-4"
            placeholder={t("enter-email")}
            value={email}
            onChange={onChangeEmail}
            required
          />
          <input
            type="password"
            className="form-control mb-4 p-4"
            placeholder={t("enter-password")}
            value={password}
            onChange={onChangePassword}
            required
          />
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!email || !password || isPending}
          >
            {isPending ? <SyncOutlined spin /> : t("submit")}
          </button>
        </form>

        <p className="text-center pt-3">
          {t("already-registered")}{" "}
          <Link className="text-decoration-none" href="/login">
            {t("login")}
          </Link>
        </p>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = getTranslationProps();

export default Register;
