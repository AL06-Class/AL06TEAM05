import {
  AuthErrorCodes,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type AuthError,
  type User
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

export type LoginProvider = "google" | "kakao" | "naver";

export type LoginResult =
  | {
      readonly status: "success";
      readonly user: User;
    }
  | {
      readonly status: "error";
      readonly message: string;
    };

const providerIds: Record<LoginProvider, string> = {
  google: "google.com",
  kakao: "oidc.kakao",
  naver: "oidc.naver"
};

export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  const auth = getFirebaseAuth();

  if (auth === null) {
    return {
      status: "error",
      message: "Firebase 환경변수가 설정되지 않았습니다."
    };
  }

  if (email.trim().length === 0 || password.length === 0) {
    return {
      status: "error",
      message: "이메일과 비밀번호를 입력해 주세요."
    };
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

    return {
      status: "success",
      user: credential.user
    };
  } catch (error) {
    return {
      status: "error",
      message: getLoginErrorMessage(error)
    };
  }
}

export async function loginWithProvider(provider: LoginProvider): Promise<LoginResult> {
  const auth = getFirebaseAuth();

  if (auth === null) {
    return {
      status: "error",
      message: "Firebase 환경변수가 설정되지 않았습니다."
    };
  }

  try {
    const authProvider =
      provider === "google" ? new GoogleAuthProvider() : new OAuthProvider(providerIds[provider]);
    const credential = await signInWithPopup(auth, authProvider);

    return {
      status: "success",
      user: credential.user
    };
  } catch (error) {
    return {
      status: "error",
      message: getLoginErrorMessage(error)
    };
  }
}

function getLoginErrorMessage(error: unknown): string {
  if (!isAuthError(error)) {
    return "로그인 중 알 수 없는 오류가 발생했습니다.";
  }

  switch (error.code) {
    case AuthErrorCodes.INVALID_PASSWORD:
    case "auth/invalid-credential":
    case "auth/user-not-found":
      return "이메일 또는 비밀번호를 확인해 주세요.";
    case "auth/popup-closed-by-user":
      return "로그인 창이 닫혔습니다.";
    case "auth/unauthorized-domain":
      return "Firebase 승인 도메인 설정을 확인해 주세요.";
    case "auth/operation-not-allowed":
      return "Firebase 로그인 제공자 설정을 확인해 주세요.";
    default:
      return "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

function isAuthError(error: unknown): error is AuthError {
  return typeof error === "object" && error !== null && "code" in error;
}
