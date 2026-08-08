// Leemos el historial guardado por la página principal
let historial = [];

function cargarHistorial() {
  const datosGuardados = localStorage.getItem("historialPedidos");
  historial = datosGuardados ? JSON.parse(datosGuardados) : [];
}

const contenedorResumen = document.getElementById("contenedor-resumen");
const contenedorResumenSimple = document.getElementById(
  "contenedor-resumen-simple",
);

// Función genérica de agrupación: recibe los items y una función que arma
// la "clave" por la que se va a agrupar. Así reutilizamos la misma lógica
// tanto para agrupar solo por producto+sabor, como por producto+sabor+precio.
function agruparItems(items, obtenerClave) {
  const agrupado = {};

  items.forEach((item) => {
    const clave = obtenerClave(item);

    if (!agrupado[clave]) {
      agrupado[clave] = {
        nombre: item.nombre,
        sabor: item.sabor,
        precio: item.precio,
        etiquetaPrecio: item.etiquetaPrecio,
        cantidad: 0,
        dinero: 0,
      };
    }

    agrupado[clave].cantidad += item.cantidad;
    agrupado[clave].dinero += item.precio * item.cantidad;
  });

  return Object.values(agrupado).sort(
    (a, b) =>
      a.nombre.localeCompare(b.nombre) ||
      (a.sabor ?? "").localeCompare(b.sabor ?? ""),
  );
}

function generarResumen() {
  if (historial.length === 0) {
    contenedorResumen.innerHTML = `<p class="vacio">Todavía no hay pedidos confirmados.</p>`;
    contenedorResumenSimple.innerHTML = `<p class="vacio">Todavía no hay pedidos confirmados.</p>`;
    return;
  }

  // Juntamos TODOS los items de TODOS los pedidos en un solo array grande.
  const todosLosItems = historial.flatMap(
    (pedidoConfirmado) => pedidoConfirmado.items,
  );
  const totalClientes = historial.length;

  // ===== Tabla 1: totales simples por producto + sabor (sin importar el precio) =====
  const filasSimples = agruparItems(
    todosLosItems,
    (item) => `${item.nombre}||${item.sabor ?? ""}`,
  );

  const filasSimplesHTML = filasSimples
    .map(
      (fila) => `
      <tr>
        <td>${fila.nombre}</td>
        <td>${fila.sabor ?? "—"}</td>
        <td class="num">${fila.cantidad}</td>
      </tr>
    `,
    )
    .join("");

  const totalUnidadesSimple = filasSimples.reduce(
    (suma, f) => suma + f.cantidad,
    0,
  );

  contenedorResumenSimple.innerHTML = `
    <table class="tabla-resumen">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Sabor</th>
          <th class="num">Cantidad total</th>
        </tr>
      </thead>
      <tbody>
        ${filasSimplesHTML}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">Total (${totalClientes} pedido${totalClientes === 1 ? "" : "s"})</td>
          <td class="num">${totalUnidadesSimple}</td>
        </tr>
      </tfoot>
    </table>
  `;

  // ===== Tabla 2: detalle por producto + sabor + nivel de precio =====
  const filasDetalladas = agruparItems(
    todosLosItems,
    (item) => `${item.nombre}||${item.sabor ?? ""}||${item.precio}`,
  );

  const filasDetalladasHTML = filasDetalladas
    .map(
      (fila) => `
      <tr>
        <td>${fila.nombre}</td>
        <td>${fila.sabor ?? "—"}</td>
        <td>${fila.etiquetaPrecio ?? "—"}</td>
        <td class="num">${fila.cantidad}</td>
        <td class="num">Q${fila.precio.toFixed(2)}</td>
        <td class="num">Q${fila.dinero.toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  const totalUnidadesGeneral = filasDetalladas.reduce(
    (suma, f) => suma + f.cantidad,
    0,
  );
  const totalDineroGeneral = filasDetalladas.reduce(
    (suma, f) => suma + f.dinero,
    0,
  );

  contenedorResumen.innerHTML = `
    <table class="tabla-resumen">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Sabor</th>
          <th>Precio</th>
          <th class="num">Cantidad total</th>
          <th class="num">Precio unitario</th>
          <th class="num">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${filasDetalladasHTML}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">Total (${totalClientes} pedido${totalClientes === 1 ? "" : "s"})</td>
          <td class="num">${totalUnidadesGeneral}</td>
          <td></td>
          <td class="num">Q${totalDineroGeneral.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

// Cargamos los datos guardados y pintamos las tablas por primera vez
cargarHistorial();
generarResumen();

// ===== Actualización automática =====
// El evento "storage" se dispara en ESTA pestaña cuando OTRA pestaña
// (la de la app principal) modifica el localStorage. Así, si tienes
// esta página de resumen abierta y agregas un pedido nuevo en la otra
// pestaña, esta tabla se actualiza sola sin que tengas que recargar.
window.addEventListener("storage", (evento) => {
  if (evento.key === "historialPedidos") {
    cargarHistorial();
    generarResumen();
  }
});

// ===== Actualización manual =====
// Por si acaso el evento automático no se dispara (por ejemplo, si
// abriste esta pestaña antes de que existiera algún pedido).
const btnActualizar = document.getElementById("btn-actualizar");
btnActualizar.addEventListener("click", () => {
  cargarHistorial();
  generarResumen();
});
