import axios from "axios";
import qs from "qs";
import { attachAuthInterceptor } from "./auth-interceptor";
import { attachErrorInterceptor } from "./error-interceptor";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
console.log(BASE_URL);
const PRIVACY = "public";
const VERSION = "v1";
const GLOBAL_PREFIX = `/${PRIVACY}/api/${VERSION}`;

const api = axios.create({
  baseURL: `${BASE_URL}${GLOBAL_PREFIX}`,
  paramsSerializer: (params) => qs.stringify(params, { encode: false }),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(api);
attachErrorInterceptor(api);

export default api;
