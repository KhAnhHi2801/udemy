import { useMutation } from "@tanstack/react-query";
import api from "../lib/axios";
import { type User, useSetUser } from "../stores/auth";

interface RegisterData extends User {
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const useRegister = () => {
  const setUser = useSetUser();

  return useMutation({
    mutationFn: (data: RegisterData) => {
      return api.post("/register", data);
    },
    onSuccess: (res) => {
      const user: User = res.data.user;
      console.log("User registered successfully:", user);
      setUser(user);
    },
  });
};

const useLogin = () => {
  const setUser = useSetUser();

  return useMutation({
    mutationFn: (data: LoginData) => {
      return api.post("/login", data);
    },
    onSuccess: (res) => {
      const user: User = res.data.user;
      console.log("User logined successfully", user);
      setUser(user);
    },
  });
};

export { useRegister, useLogin };
