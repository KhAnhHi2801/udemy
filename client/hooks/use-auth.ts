import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { type User, useSetUser, useLogout } from "../stores/auth";

interface RegisterData extends Omit<User, "id"> {
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

const useMe = () => {
  const setUser = useSetUser();
  const logout = useLogout();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const res = await api.get("/me");
        const user: User = res.data.user;
        setUser(user);

        return user;
      } catch (error) {
        logout();

        throw error;
      }
    },
    retry: false,
  });
};

export { useRegister, useLogin, useMe };
