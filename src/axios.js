import axios from "axios";

export const BASE_URL = "http://localhost:8888";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    let accessToken;
    let tokenType;
    let jwt = JSON.parse(localStorage.getItem("jwt"));
    if (jwt) {
      jwt = jwt.data;
      accessToken = jwt.access_token;
      tokenType = jwt.token_type;
      config.headers["Authorization"] = `${tokenType} ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
