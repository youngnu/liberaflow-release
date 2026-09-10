(() => {
  "use strict";

  const icon = document.querySelector("#confirmationIcon");
  const title = document.querySelector("#confirmationTitle");
  const message = document.querySelector("#confirmationMessage");
  const status = document.querySelector("#status");
  const closeButton = document.querySelector("#closeWindowBtn");

  function showStatus(text, isError = false) {
    status.className = `status ${isError ? "error" : "success"}`;
    status.textContent = text;
    status.style.display = "block";
  }

  function readCallback() {
    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return {
      error: query.get("error") || fragment.get("error"),
      errorCode: query.get("error_code") || fragment.get("error_code"),
      fragmentCode: fragment.get("code"),
      fragmentHasSession: Boolean(
        fragment.get("access_token") && fragment.get("refresh_token"),
      ),
      queryCode: query.get("code"),
      queryHasSession: Boolean(
        query.get("access_token") && query.get("refresh_token"),
      ),
    };
  }

  function clearCallbackParameters() {
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

  function errorMessage(callback) {
    if (callback.errorCode === "otp_expired") {
      return "확인 링크가 만료되었습니다. Liberaflow 앱에서 새 링크를 요청해 주세요.";
    }
    return "확인 링크를 사용할 수 없습니다. Liberaflow 앱에서 새 링크를 요청해 주세요.";
  }

  const callback = readCallback();
  const hasCallbackEvidence = Boolean(
    callback.queryCode ||
      callback.fragmentCode ||
      callback.queryHasSession ||
      callback.fragmentHasSession,
  );

  if (callback.error || callback.errorCode) {
    icon.textContent = "⚠️";
    title.textContent = "이메일을 확인하지 못했습니다";
    message.textContent = errorMessage(callback);
    showStatus("링크를 다시 요청한 뒤 가장 최근 이메일을 열어 주세요.", true);
  } else if (hasCallbackEvidence) {
    icon.textContent = "ℹ️";
    title.textContent = "이메일 확인 정보 수신";
    message.textContent =
      "확인 링크 정보를 받았습니다. Liberaflow 앱에서 로그인해 계정 상태를 확인해 주세요.";
    showStatus("이 페이지는 계정 활성화 여부를 직접 검증하지 않습니다.");
  } else {
    icon.textContent = "ℹ️";
    title.textContent = "확인 정보가 없습니다";
    message.textContent =
      "이메일의 확인 링크를 다시 열거나 Liberaflow 앱에서 로그인 상태를 확인해 주세요.";
    showStatus("이 페이지를 직접 열었다면 계정 확인은 처리되지 않습니다.", true);
  }

  clearCallbackParameters();

  closeButton.addEventListener("click", () => {
    window.close();
    window.setTimeout(() => {
      if (!window.closed) {
        showStatus("이 창을 수동으로 닫아 주세요.", true);
      }
    }, 100);
  });
})();
