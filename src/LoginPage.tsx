import { useState, type FormEvent } from "react";
import { loginWithEmail, loginWithProvider, type LoginProvider } from "./lib/auth";

type LoginPageProps = {
  readonly onBack: () => void;
};

export function LoginPage({ onBack }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await loginWithEmail(email, password);

    setMessage(result.status === "success" ? "로그인되었습니다." : result.message);
    setIsSubmitting(false);
  };

  const handleProviderLogin = async (provider: LoginProvider) => {
    setIsSubmitting(true);

    const result = await loginWithProvider(provider);

    setMessage(result.status === "success" ? "로그인되었습니다." : result.message);
    setIsSubmitting(false);
  };

  return (
    <main className="login-page">
      <section className="login-shell" aria-labelledby="login-title">
        <button className="login-back" type="button" onClick={onBack}>
          메인으로 돌아가기
        </button>

        <div className="login-layout">
          <form className="login-card" onSubmit={handleSubmit}>
            <div className="login-card-header">
              <h1 id="login-title">계정으로 로그인하기</h1>
            </div>

            <label className="login-field">
              <span>이메일</span>
              <input
                type="email"
                value={email}
                placeholder="example@email.com"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="login-field">
              <span>비밀번호</span>
              <input
                type="password"
                value={password}
                placeholder="비밀번호 입력"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "로그인 중" : "로그인"}
            </button>

            <div className="social-login-divider" aria-hidden="true">
              <span>또는</span>
            </div>

            <div className="social-login-actions" aria-label="소셜 로그인">
              <button
                className="social-login-button google-login-button"
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleProviderLogin("google")}
              >
                구글로 로그인
              </button>
              <button
                className="social-login-button kakao-login-button"
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleProviderLogin("kakao")}
              >
                카카오로 로그인
              </button>
              <button
                className="social-login-button naver-login-button"
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleProviderLogin("naver")}
              >
                네이버로 로그인
              </button>
            </div>

            {message.length > 0 && <p className="login-message">{message}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}
