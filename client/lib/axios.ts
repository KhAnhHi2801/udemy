import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Auto include cookies in requests for authentication
});

export default api;
