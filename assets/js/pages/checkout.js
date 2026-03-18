/*
 * SUPABASE — Ejecuta este SQL en el editor de tu proyecto Supabase
 * antes de usar la funcionalidad de inscripciones:
 *
 * CREATE TABLE IF NOT EXISTS registros (
 *   id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
 *   user_name    TEXT NOT NULL,
 *   user_email   TEXT NOT NULL,
 *   evento       TEXT NOT NULL,
 *   fecha_evento TEXT,
 *   ubicacion    TEXT,
 *   total        INTEGER NOT NULL DEFAULT 1200,
 *   estado       TEXT NOT NULL DEFAULT 'completado',
 *   created_at   TIMESTAMPTZ DEFAULT now()
 * );
 *
 * ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Insertar registro propio"
 *   ON registros FOR INSERT
 *   TO authenticated
 *   WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
 *
 * CREATE POLICY "Ver registros propios"
 *   ON registros FOR SELECT
 *   TO authenticated
 *   USING (auth.uid() = user_id);
 */

(() => {
  const params        = new URLSearchParams(window.location.search);
  const eventName     = params.get("event")    || "Evento";
  const eventDate     = params.get("date")     || "Fecha por confirmar";
  const eventLocation = params.get("location") || "Ubicación por confirmar";
  const PRICE = 1200;
  const TOTAL = PRICE;

  const formatCurrency = (v) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(v);

  // --- Llenar resumen del evento ---
  const nameEl     = document.querySelector("[data-event-name]");
  const dateEl     = document.querySelector("[data-event-date]");
  const locationEl = document.querySelector("[data-event-location]");
  const totalEl    = document.querySelector("[data-total]");

  if (nameEl)     nameEl.textContent     = eventName;
  if (dateEl)     dateEl.textContent     = eventDate;
  if (locationEl) locationEl.textContent = eventLocation;
  if (totalEl)    totalEl.textContent    = formatCurrency(TOTAL);

  // --- Overlay de autenticación ---
  const authOverlay = document.getElementById("checkout-auth-overlay");
  const loginBtn    = document.getElementById("checkout-login-redirect");
  const authEventEl = document.getElementById("checkout-auth-event-name");

  if (authEventEl) authEventEl.textContent = eventName;

  if (loginBtn) {
    loginBtn.href = `perfil.html?returnTo=${encodeURIComponent(window.location.href)}`;
  }

  const showOverlay = () => authOverlay?.classList.add("is-visible");
  const hideOverlay = () => authOverlay?.classList.remove("is-visible");

  // --- Form y toast ---
  const form      = document.getElementById("checkout-form");
  const payBtn    = document.getElementById("pay-now");
  const toast     = document.querySelector(".checkout-toast");
  const toastText = document.getElementById("checkout-toast-text");
  const toastBtn  = document.querySelector(".checkout-toast-btn");

  let currentUser = null;

  // Guarda la inscripción en Supabase
  const saveRegistration = async () => {
    if (!window.supabaseClient) return;
    const { error } = await window.supabaseClient.from("registros").insert({
      user_id:      currentUser?.id    || null,
      user_name:    currentUser?.name  || "Anónimo",
      user_email:   currentUser?.email || "",
      evento:       eventName,
      fecha_evento: eventDate,
      ubicacion:    eventLocation,
      total:        TOTAL,
      estado:       "completado",
    });
    if (error) console.error("No se pudo guardar la inscripción:", error.message);
  };

  if (form && payBtn) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (payBtn.classList.contains("is-loading")) return;
      payBtn.classList.add("is-loading");

      setTimeout(() => {
        saveRegistration().finally(() => {
          payBtn.classList.remove("is-loading");
          if (toastText && currentUser?.name) {
            toastText.textContent = `Inscripción registrada para ${currentUser.name}. Te contactaremos con los siguientes pasos.`;
          }
          if (toast) {
            toast.classList.add("is-visible");
            toast.setAttribute("aria-hidden", "false");
          }
        });
      }, 1200);
    });
  }

  if (toastBtn) {
    toastBtn.addEventListener("click", () => {
      window.location.href = "eventos/index.html";
    });
  }

  // --- Verificar sesión al cargar ---
  const initAuth = async () => {
    // 1. Sesión de Supabase (lee desde localStorage internamente, muy rápido)
    if (window.supabaseClient) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session?.user) {
        currentUser = {
          id:    session.user.id,
          email: session.user.email,
          name:  session.user.user_metadata?.full_name ||
                 session.user.user_metadata?.name      ||
                 session.user.email.split("@")[0],
        };
        hideOverlay();
        return;
      }
    }

    // 2. Fallback: sesión guardada en localStorage (login local)
    const localName  = localStorage.getItem("user_name");
    const localEmail = localStorage.getItem("user_email");
    if (localName) {
      currentUser = { id: null, email: localEmail || "", name: localName };
      hideOverlay();
      return;
    }

    // 3. Sin sesión → mostrar overlay de login
    showOverlay();
  };

  initAuth();
})();
