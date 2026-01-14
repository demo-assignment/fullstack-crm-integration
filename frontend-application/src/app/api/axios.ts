import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: `${process?.env?.NEXT_PUBLIC_BACKEND_API_URL}/api`,
  timeout: 10_000,
});

const handleError = (error: AxiosError) => {
  return Promise.reject(error?.message || error || "Something went wrong! Please try again later.");
};

api.interceptors.request.use(config => {
  return config;
}, handleError);

api.interceptors.response.use(response => {
  return response?.data || response;
}, handleError);
