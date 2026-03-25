import {
  ForgotPassword,
  Login,
  Register,
  ResendOTP,
  ResetPassword,
} from "@/api/api-calls/auth";
import { useMutation } from "@tanstack/react-query";

const useLocalSignIn = () => {
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => Login(input),
  });
};

const useLocalSignUp = () => {
  return useMutation({
    mutationFn: (input: { firstName: string; lastName: string; email: string; password: string }) => Register(input),
  });
};

const useResetPassword = () => {
  return useMutation({
    mutationFn: (input: {  otp: string; password: string }) =>
      ResetPassword(input),
  });
};

const useForgotPassword = () => {
  return useMutation({
    mutationFn: (input: { email: string }) => ForgotPassword(input),
  });
};

const useResendOTP = () => {
  return useMutation({
    mutationFn: (input: { email: string }) => ResendOTP(input),
  });
};

// const useGoogleSignIn = () => {
//   return useMutation({
//     mutationFn: (input: { credentials: string }) => GoogleSingnIn(credentials),
//   });
// };

export {
  useLocalSignIn,
  useLocalSignUp,
  useResetPassword,
  useForgotPassword,
  useResendOTP,
};
