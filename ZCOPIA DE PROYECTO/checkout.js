(() => {
  const params = new URLSearchParams(window.location.search);
  const eventName = params.get("event") || "Evento";
  const eventDate = params.get("date") || "Fecha por confirmar";
  const eventLocation = params.get("location") || "Ubicación por confirmar";

  const formatCurrency = (value) => new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);

  const PRICE = 1200;
  const TOTAL = PRICE;

  const nameEl = document.querySelector("[data-event-name]");
  const dateEl = document.querySelector("[data-event-date]");
  const locationEl = document.querySelector("[data-event-location]");
  const totalEl = document.querySelector("[data-total]");

  if (nameEl) nameEl.textContent = eventName;
  if (dateEl) dateEl.textContent = eventDate;
  if (locationEl) locationEl.textContent = eventLocation;
  if (totalEl) totalEl.textContent = formatCurrency(TOTAL);

  const form = document.getElementById("checkout-form");
  const payBtn = document.getElementById("pay-now");
  const toast = document.querySelector(".checkout-toast");
  const toastBtn = document.querySelector(".checkout-toast-btn");

  if (form && payBtn) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (payBtn.classList.contains("is-loading")) return;
      payBtn.classList.add("is-loading");

      window.setTimeout(() => {
        payBtn.classList.remove("is-loading");
        if (toast) {
          toast.classList.add("is-visible");
          toast.setAttribute("aria-hidden", "false");
        }
      }, 1200);
    });
  }

  if (toastBtn) {
    toastBtn.addEventListener("click", () => {
      window.location.href = "eventos.html";
    });
  }
})();
