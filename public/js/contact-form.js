(function () {
  function showToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const bg = type === "error" ? "#f8d7da" : "#d1e7dd";
    const color = type === "error" ? "#842029" : "#0f5132";
    const border = type === "error" ? "#f5c2c7" : "#badbcc";
    const toast = document.createElement("div");
    toast.style.cssText =
      "background:" +
      bg +
      ";color:" +
      color +
      ";border:1px solid " +
      border +
      ";padding:10px 14px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.12);margin-bottom:8px;";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.remove();
    }, 4000);
  }

  function setBusy(form, busy, label) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    const btnText = btn.querySelector(".btn-text");
    const btnSpinner = btn.querySelector(".btn-spinner");
    btn.disabled = busy;
    if (btnText) btnText.textContent = label || "Escríbenos";
    if (btnSpinner) btnSpinner.style.display = busy ? "inline-block" : "none";
  }

  async function postForm(form) {
    setBusy(form, true, "Enviando...");
    try {
      const fd = new FormData(form);
      const params = new URLSearchParams();
      for (const [k, v] of fd.entries()) params.append(k, v);
      const res = await fetch(form.action, {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: params.toString(),
      });
      const isJSON = (res.headers.get("content-type") || "").includes("application/json");
      if (res.ok) {
        if (isJSON) {
          const data = await res.json();
          showToast(data.message || "Enviado", "success");
        } else {
          showToast("Correo enviado correctamente, te contactaremos a la brevedad.", "success");
        }
        form.reset();
        const tokenInput = form.querySelector('[name="g-recaptcha-response"]');
        if (tokenInput) tokenInput.value = "";
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      } else if (isJSON) {
        const data = await res.json();
        showToast((data.errors && data.errors.join("\n")) || data.message || "Error al enviar.", "error");
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      } else {
        showToast("Error al enviar el mensaje.", "error");
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      }
    } catch (err) {
      showToast("Error al enviar el mensaje. Intenta nuevamente.", "error");
      if (typeof grecaptcha !== "undefined") grecaptcha.reset();
    } finally {
      setBusy(form, false, "Escríbenos");
    }
  }

  document.addEventListener("submit", function (e) {
    const form = e.target;
    if (!form || !form.classList || !form.classList.contains("js-contact-form")) return;
    e.preventDefault();

    const name = (form.querySelector('[name="name"]') || {}).value || "";
    const email = (form.querySelector('[name="email"]') || {}).value || "";
    const message = (form.querySelector('[name="message"]') || {}).value || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errs = [];
    if (name.trim().length < 2) errs.push("El nombre debe tener al menos 2 caracteres");
    if (!emailRegex.test(email.trim())) errs.push("Correo electrónico inválido");
    if (message.trim().length < 10) errs.push("El mensaje debe tener al menos 10 caracteres");
    if (message.trim().length > 2000) errs.push("El mensaje no puede superar los 2000 caracteres");
    if (errs.length) {
      showToast(errs.join("\n"), "error");
      return;
    }

    if (typeof grecaptcha === "undefined") {
      showToast("reCAPTCHA no está disponible. Recarga la página.", "error");
      return;
    }

    setBusy(form, true, "Verificando...");

    const widget = form.querySelector(".g-recaptcha");
    window.__contactFormPending = form;

    window.onContactRecaptchaOk = function (token) {
      const f = window.__contactFormPending;
      if (!f) return;
      const tokenInput = f.querySelector('[name="g-recaptcha-response"]');
      if (tokenInput) tokenInput.value = token;
      postForm(f);
    };

    window.onContactRecaptchaErr = function () {
      showToast("Error al verificar reCAPTCHA. Recarga la página.", "error");
      const f = window.__contactFormPending;
      if (f) setBusy(f, false, "Escríbenos");
    };

    try {
      if (widget && !widget.getAttribute("data-widget-id")) {
        const id = grecaptcha.render(widget, {
          sitekey: widget.getAttribute("data-sitekey"),
          size: "invisible",
          callback: "onContactRecaptchaOk",
          "error-callback": "onContactRecaptchaErr",
        });
        widget.setAttribute("data-widget-id", String(id));
        grecaptcha.execute(id);
      } else if (widget && widget.getAttribute("data-widget-id")) {
        grecaptcha.execute(Number(widget.getAttribute("data-widget-id")));
      } else {
        grecaptcha.execute();
      }
    } catch (err) {
      try {
        grecaptcha.execute();
      } catch (e2) {
        showToast("No se pudo iniciar reCAPTCHA.", "error");
        setBusy(form, false, "Escríbenos");
      }
    }
  });
})();
