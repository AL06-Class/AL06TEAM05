import { useState, type FormEvent } from "react";

type LoginPageProps = {
  readonly onBack: () => void;
};

export function LoginPage({ onBack }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("로그인 기능 연결 전 화면 확인용입니다.");
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

            <button className="login-submit" type="submit">
              로그인
            </button>

            <div className="social-login-divider" aria-hidden="true">
              <span>또는</span>
            </div>

            <div className="social-login-actions" aria-label="소셜 로그인">
              <button className="social-login-button kakao-login-button" type="button">
                카카오로 로그인
              </button>
              <button className="social-login-button naver-login-button" type="button">
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
