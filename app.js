// ================== UTILIDADES ==================
function leerNumero(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? 0 : v;
}

// ================== FLUJOS ==================
const flujosContainer = document.getElementById("flujosContainer");
const btnGenerarFlujos = document.getElementById("btnGenerarFlujos");

btnGenerarFlujos.addEventListener("click", () => {
  const n = leerNumero("vida");
  flujosContainer.innerHTML = "";
  if (n <= 0) return;

  for (let t = 1; t <= n; t++) {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>
        Flujo año ${t}:
        <input type="number" step="0.01" id="flujo_${t}" />
      </label>
    `;
    flujosContainer.appendChild(div);
  }
});

function obtenerFlujos() {
  const n = leerNumero("vida");
  const flujos = [];
  for (let t = 1; t <= n; t++) {
    flujos.push(leerNumero(`flujo_${t}`));
  }
  return flujos;
}

document.getElementById("btnReiniciar").addEventListener("click", () => {
  location.reload();
});


// ================== CÁLCULOS ECONÓMICOS ==================
function calcularVPN(costoInicial, tasa, flujos) {
  const i = tasa / 100;
  let vpn = -costoInicial;
  for (let t = 1; t <= flujos.length; t++) {
    vpn += flujos[t - 1] / Math.pow(1 + i, t);
  }
  return vpn;
}

function calcularCAE(vpn, tasa, n) {
  const i = tasa / 100;
  if (i === 0) return vpn / n;
  const factor = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  return vpn * factor;
}

function calcularTIR(costoInicial, flujos) {
  // Búsqueda incremental simple
  let tir = -0.9; // -90%
  let paso = 0.001; // 0.1%
  let mejorTIR = tir;
  let mejorVPN = Infinity;

  for (let r = -0.9; r <= 1; r += paso) { // de -90% a 100%
    let vpn = -costoInicial;
    for (let t = 1; t <= flujos.length; t++) {
      vpn += flujos[t - 1] / Math.pow(1 + r, t);
    }
    if (Math.abs(vpn) < Math.abs(mejorVPN)) {
      mejorVPN = vpn;
      mejorTIR = r;
    }
  }

  return mejorTIR * 100; // en %
}

// ================== EVENTO CALCULAR ==================
const btnCalcular = document.getElementById("btnCalcular");

btnCalcular.addEventListener("click", () => {
  const costoInicial = leerNumero("costoInicial");
  const tasa = leerNumero("tasa");
  const n = leerNumero("vida");
  const flujos = obtenerFlujos();

  if (costoInicial === 0 || tasa === 0 || n === 0 || flujos.length === 0) {
    alert("Completa costo inicial, tasa, vida útil y flujos.");
    return;
  }

  const vpn = calcularVPN(costoInicial, tasa, flujos);
  const cae = calcularCAE(vpn, tasa, n);
  const tir = calcularTIR(costoInicial, flujos);

  document.getElementById("vpnResultado").textContent = vpn.toFixed(2);
  document.getElementById("caeResultado").textContent = cae.toFixed(2);
  document.getElementById("tirResultado").textContent = tir.toFixed(2) + " %";

  document.getElementById("vpnDecision").textContent =
    vpn > 0 ? "Proyecto aceptable (VPN > 0)" : "Proyecto no aceptable (VPN ≤ 0)";

  document.getElementById("caeDecision").textContent =
    cae > 0 ? "CAE positivo (beneficio anual equivalente)" : "CAE negativo";

  document.getElementById("tirDecision").textContent =
    tir > tasa
      ? "TIR mayor que la tasa de descuento: aceptable"
      : "TIR menor o igual a la tasa de descuento: no aceptable";
});

// ================== COMPARACIÓN DE ALTERNATIVAS ==================
const btnComparar = document.getElementById("btnComparar");
let graficoComparacion = null;

btnComparar.addEventListener("click", () => {
  const vpnA = leerNumero("vpnA");
  const vpnB = leerNumero("vpnB");
  const caeA = leerNumero("caeA");
  const caeB = leerNumero("caeB");
  const tirA = leerNumero("tirA");
  const tirB = leerNumero("tirB");

  let texto = "";

  texto += vpnA > vpnB ? "Según VPN, conviene la alternativa A.\n" :
           vpnB > vpnA ? "Según VPN, conviene la alternativa B.\n" :
                         "Según VPN, ambas alternativas son equivalentes.\n";

  texto += caeA > caeB ? "Según CAE, conviene la alternativa A.\n" :
           caeB > caeA ? "Según CAE, conviene la alternativa B.\n" :
                         "Según CAE, ambas alternativas son equivalentes.\n";

  texto += tirA > tirB ? "Según TIR, conviene la alternativa A.\n" :
           tirB > tirA ? "Según TIR, conviene la alternativa B.\n" :
                         "Según TIR, ambas alternativas son equivalentes.\n";

  document.getElementById("comparacionResultado").textContent = texto;

  // Gráfico de barras
  const ctx = document.getElementById("graficoComparacion").getContext("2d");
  if (graficoComparacion) graficoComparacion.destroy();

  graficoComparacion = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["VPN", "CAE", "TIR"],
      datasets: [
        {
          label: "Alternativa A",
          data: [vpnA, caeA, tirA],
          backgroundColor: "rgba(37, 99, 235, 0.6)"
        },
        {
          label: "Alternativa B",
          data: [vpnB, caeB, tirB],
          backgroundColor: "rgba(16, 185, 129, 0.6)"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
});

// ================== PREVISUALIZACIÓN DE NOMBRES DE EQUIPO ==================
const inputEquipo = document.getElementById("nombresEquipo");
const equipoPreview = document.getElementById("equipoPreview");

inputEquipo.addEventListener("input", () => {
  const texto = inputEquipo.value.trim();

  if (texto === "") {
    equipoPreview.innerHTML = "";
    return;
  }

  // Separar por comas
  const nombres = texto.split(",").map(n => n.trim()).filter(n => n !== "");

  // Construir HTML
  let html = `<strong>Equipo de trabajo:</strong><br>`;
  nombres.forEach(nombre => {
    html += `${nombre}<br>`;
  });

  equipoPreview.innerHTML = html;
});

// ================== EXPORTAR PDF ==================
document.getElementById("btnExportarPDF").addEventListener("click", () => {
  window.print();
});
