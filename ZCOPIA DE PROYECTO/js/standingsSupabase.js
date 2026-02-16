(() => {
  const CATEGORY_TABLES = {
  elite: "Elite varonil",
  "femenil-elite": "Elite Femenil",
  junior: "junior varonil",
  infantil: "cadetes",
  "master-a": "master-a",
  "master-b": "master-b",
  "master-c": "master-c",

  };

  const DEFAULT_CATEGORY = "elite";

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return value;
  };

  const getTableBodies = () => {
    const tables = Array.from(document.querySelectorAll(".standings-table"));
    return tables.map((table) => {
      let tbody = table.tBodies[0];
      if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
      }
      return { table, tbody };
    });
  };

  const setLoadingState = (bodies) => {
    bodies.forEach(({ table, tbody }) => {
      const columns = table.tHead?.rows?.[0]?.cells?.length || 8;
      tbody.innerHTML = `<tr><td colspan="${columns}">Cargando...</td></tr>`;
    });
  };

  const renderRows = (bodies, rows) => {
    const html = rows
      .map((row, index) => {
        const rank = row.rank == null ? index + 1 : row.rank;
        return `
          <tr>
            <td>${formatValue(rank)}</td>
            <td>${formatValue(row.atleta)}</td>
            <td>${formatValue(row.anteriores)}</td>
            <td>${formatValue(row.carrera_1)}</td>
            <td>${formatValue(row.carrera_2)}</td>
            <td>${formatValue(row.carrera_3)}</td>
            <td>${formatValue(row.cambio)}</td>
            <td class="is-right points">${formatValue(row.puntos)}</td>
          </tr> 
        `;
      })
      .join("");

    bodies.forEach(({ tbody }) => {
      tbody.innerHTML = html || "<tr><td colspan=\"8\">Sin datos.</td></tr>";
    });
  };

  const showError = (bodies) => {
    bodies.forEach(({ tbody, table }) => {
      const columns = table.tHead?.rows?.[0]?.cells?.length || 8;
      tbody.innerHTML = `<tr><td colspan="${columns}">No se pudo cargar rankings.</td></tr>`;
    });
  };

  const loadStandings = async (tableName) => {
    const bodies = getTableBodies();
    if (!bodies.length) return;

    setLoadingState(bodies);

    if (!window.supabaseClient) {
      console.error("Supabase client no esta disponible.");
      showError(bodies);
      return;
    }

    console.log(`[standings] Cargando tabla: ${tableName}`);

    try {
      const { data, error } = await window.supabaseClient
        .from(tableName)
        .select("*")
        .order("puntos", { ascending: false });

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      renderRows(bodies, rows);
    } catch (err) {
      console.error("Error cargando rankings desde Supabase:", err);
      showError(bodies);
    }
  };

  const setActiveTab = (tab, tabs) => {
    tabs.forEach((btn) => {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
  };

  const initTabs = () => {
    const tabs = Array.from(document.querySelectorAll(".standings-tabs .tab"));
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const category = tab.dataset.cat || DEFAULT_CATEGORY;
        const tableName = CATEGORY_TABLES[category] || CATEGORY_TABLES[DEFAULT_CATEGORY];
        setActiveTab(tab, tabs);
        loadStandings(tableName);
      });
    });

    const defaultTab = tabs.find((tab) => (tab.dataset.cat || "") === DEFAULT_CATEGORY) || tabs[0];
    const defaultCategory = defaultTab?.dataset.cat || DEFAULT_CATEGORY;
    const defaultTable = CATEGORY_TABLES[defaultCategory] || CATEGORY_TABLES[DEFAULT_CATEGORY];
    if (defaultTab) setActiveTab(defaultTab, tabs);
    loadStandings(defaultTable);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTabs);
  } else {
    initTabs();
  }
})();
