(() => {
  "use strict";

  const form = document.querySelector("#resetPasswordForm");
  const newPasswordInput = document.querySelector("#newPassword");
  const confirmPasswordInput = document.querySelector("#confirmPassword");
  const resetButton = document.querySelector("#resetBtn");
  const cancelButton = document.querySelector("#cancelBtn");
  const status = document.querySelector("#status");
  const resetButtonLabel = resetButton.textContent;
  let recoveryCancelled = false;

  function showStatus(message, isError = false) {
    status.className = `status ${isError ? "error" : "success"}`;
    status.textContent = message;
    status.style.display = "block";
  }

  function setRecoveryControlsDisabled(disabled) {
    newPasswordInput.disabled = disabled;
    confirmPasswordInput.disabled = disabled;
    resetButton.disabled = disabled;
  }

  function setResetButtonLoading(loading) {
    resetButton.replaceChildren();
    if (loading) {
      const spinner = document.createElement("span");
      spinner.className = "loading";
      spinner.setAttribute("aria-hidden", "true");
      resetButton.append(spinner, "재설정 중...");
    } else {
      resetButton.textContent = resetButtonLabel;
    }
    resetButton.disabled = loading;
    cancelButton.disabled = loading;
  }

  function clearPasswordInputs() {
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
  }

  function readAuthParameters() {
    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return {
      unsupportedCode: query.get("code"),
      error: query.get("error") || fragment.get("error"),
      errorCode: query.get("error_code") || fragment.get("error_code"),
      implicitAccessToken: fragment.get("access_token"),
      implicitRefreshToken: fragment.get("refresh_token"),
      implicitType: (fragment.get("type") || "").toLowerCase(),
      queryType: (query.get("type") || "").toLowerCase(),
      tokenHash: query.get("token_hash"),
    };
  }

  function clearAuthParameters() {
    try {
      const url = new URL(window.location.href);
      [
        "access_token",
        "code",
        "error",
        "error_code",
        "error_description",
        "refresh_token",
        "token",
        "token_hash",
        "type",
      ].forEach((name) => url.searchParams.delete(name));
      url.hash = "";
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    } catch {
      return;
    }
  }

  function requireSession(data) {
    if (!data?.session) {
      throw new Error("복구 세션을 만들 수 없습니다. 이메일 링크를 다시 요청해 주세요.");
    }
    return data.session;
  }

  function recoveryErrorMessage(parameters) {
    if (parameters.errorCode === "otp_expired") {
      return "재설정 링크가 만료되었습니다. Liberaflow 앱에서 새 링크를 요청해 주세요.";
    }
    return "재설정 링크를 사용할 수 없습니다. Liberaflow 앱에서 새 링크를 요청해 주세요.";
  }

  if (!window.supabase?.createClient) {
    setRecoveryControlsDisabled(true);
    showStatus(
      "보안 모듈을 불러오지 못했습니다. 네트워크를 확인한 뒤 이메일 링크를 다시 열어 주세요.",
      true,
    );
    return;
  }

  const supabaseClient = window.supabase.createClient(
    "https://ezfarkofsfjqgnsyignt.supabase.co",
    "sb_publishable_LGf78b_MaI-jXGItaMn3Qg_VsudrYLu",
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  async function clearRecoverySession() {
    try {
      const { error } = await supabaseClient.auth.signOut({ scope: "local" });
      return !error;
    } catch {
      return false;
    }
  }

  async function createRecoverySession(parameters) {
    if (parameters.error || parameters.errorCode) {
      throw new Error(recoveryErrorMessage(parameters));
    }

    if (parameters.tokenHash) {
      if (parameters.queryType !== "recovery") {
        throw new Error("비밀번호 재설정용 링크가 아닙니다.");
      }
      const { data, error } = await supabaseClient.auth.verifyOtp({
        token_hash: parameters.tokenHash,
        type: "recovery",
      });
      if (error) {
        throw new Error(
          "재설정 링크가 만료되었거나 사용할 수 없습니다. Liberaflow 앱에서 새 링크를 요청해 주세요.",
        );
      }
      return requireSession(data);
    }

    if (parameters.unsupportedCode) {
      throw new Error(
        "이 재설정 링크는 현재 웹 페이지와 호환되지 않습니다. 새 링크를 반복 요청하지 말고 Liberaflow 지원에 Recovery 이메일 설정 확인을 요청해 주세요.",
      );
    }

    if (parameters.implicitAccessToken && parameters.implicitRefreshToken) {
      if (parameters.implicitType !== "recovery") {
        throw new Error("비밀번호 재설정용 링크가 아닙니다.");
      }
      const { data, error } = await supabaseClient.auth.setSession({
        access_token: parameters.implicitAccessToken,
        refresh_token: parameters.implicitRefreshToken,
      });
      if (error) {
        throw new Error(
          "재설정 링크가 만료되었거나 사용할 수 없습니다. Liberaflow 앱에서 새 링크를 요청해 주세요.",
        );
      }
      return requireSession(data);
    }

    throw new Error(
      "유효한 인증 정보를 찾을 수 없습니다. 이메일 링크를 다시 요청해 주세요.",
    );
  }

  async function prepareRecoverySession() {
    setRecoveryControlsDisabled(true);
    showStatus("비밀번호 재설정 링크를 확인하는 중입니다.");
    const parameters = readAuthParameters();
    clearAuthParameters();
    try {
      const session = await createRecoverySession(parameters);
      if (recoveryCancelled) {
        await clearRecoverySession();
        return null;
      }
      form.hidden = false;
      setRecoveryControlsDisabled(false);
      showStatus("새로운 비밀번호를 설정해 주세요.");
      newPasswordInput.focus();
      return session;
    } catch (error) {
      if (recoveryCancelled) return null;
      form.hidden = true;
      showStatus(
        `비밀번호 재설정 링크를 확인할 수 없습니다: ${error.message}`,
        true,
      );
      return null;
    }
  }

  const recoverySessionPromise = prepareRecoverySession();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const recoverySession = await recoverySessionPromise;
    if (!recoverySession || recoveryCancelled) return;

    const newPassword = newPasswordInput.value;
    const confirmedPassword = confirmPasswordInput.value;
    if (newPassword !== confirmedPassword) {
      showStatus("비밀번호가 일치하지 않습니다.", true);
      return;
    }
    if (newPassword.length < 8) {
      showStatus("비밀번호는 8자 이상이어야 합니다.", true);
      return;
    }

    setResetButtonLoading(true);
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw new Error(
          "새 비밀번호를 저장할 수 없습니다. 비밀번호 정책을 확인하고 다시 시도해 주세요.",
        );
      }
      const sessionCleared = await clearRecoverySession();
      clearPasswordInputs();
      form.hidden = true;
      if (!sessionCleared) {
        showStatus(
          "비밀번호는 재설정되었지만 복구 세션 정리를 확인할 수 없어 홈으로 이동합니다.",
          true,
        );
        window.setTimeout(() => window.location.replace("index.html"), 1000);
        return;
      }
      showStatus(
        "비밀번호가 성공적으로 재설정되었습니다. Liberaflow 앱에서 새 비밀번호로 로그인해 주세요.",
      );
      window.setTimeout(() => {
        window.close();
        window.setTimeout(() => {
          if (!window.closed) {
            window.location.replace("index.html");
          }
        }, 100);
      }, 5000);
    } catch (error) {
      setResetButtonLoading(false);
      showStatus(`비밀번호를 재설정하지 못했습니다: ${error.message}`, true);
    }
  });

  cancelButton.addEventListener("click", async () => {
    recoveryCancelled = true;
    form.hidden = true;
    clearPasswordInputs();
    setRecoveryControlsDisabled(true);
    cancelButton.disabled = true;
    showStatus("비밀번호 재설정을 취소하는 중입니다.");
    const recoverySession = await recoverySessionPromise;
    if (recoverySession) await clearRecoverySession();
    showStatus("비밀번호 재설정을 취소했습니다. 이 창을 닫아 주세요.");
    window.close();
    window.setTimeout(() => {
      if (!window.closed) {
        window.location.replace("index.html");
      }
    }, 100);
  });
})();
