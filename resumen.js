// Leemos el historial guardado por la página principal
let historial = [];

// Orden personalizado para la tabla "Totales por producto y sabor".
// Cada entrada es "Producto||Sabor" (o "Producto||" si no tiene sabor).
// Si un producto+sabor no está en esta lista, se muestra al final, en orden alfabético.
const ordenPersonalizado = [
  // Dona Anillo
  "Dona Anillo||Glase",
  "Dona Anillo||Chocolate",
  "Dona Anillo||Arcoiris",
  "Dona Anillo||ChocoArcoiris",
  "Dona Anillo||Azúcar",
  "Dona Anillo||Fresa",
  "Dona Anillo||Rayada de Chocolate",
  "Dona Anillo||Rayada de Vainilla",
  "Dona Anillo||Selva Negra",
  "Dona Anillo||Moka",
  "Dona Anillo||Vainilla con Coco",
  "Dona Anillo||Chocolate con Coco",
  "Dona Anillo||Chicle",
  "Dona Anillo||Temporada",
  // Dona
  "Dona||Choco Manjar",
  "Dona||Cajeta",
  "Dona||Fresa",
  "Dona||Manzana",
  "Dona||Manjar",
  "Dona||Mora",
  "Dona||Choco Fresa",
  "Dona||Choco Piña",
  // Mini Dona
  "Mini Dona||Choco Manjar",
  "Mini Dona||Cajeta",
  "Mini Dona||Fresa",
  "Mini Dona||Manzana",
  "Mini Dona||Manjar",
  // Productos sin sabor
  "Empanada de Pollo||",
  "Volovan||",
  "Crossant||",
  "Cubilete||",
  "Encanelado||",
  // Strudel
  "Strudel||Manjar",
  "Strudel||Piña",
  "Strudel||Fresa",
  "Strudel||Manzana",
  // Sin sabor
  "Pie de queso||",
  "Pastel de Banano||",
];

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

  // Reordenamos esta tabla según la lista personalizada de arriba.
  // Los productos que sí están en la lista van en ese orden;
  // cualquier producto nuevo que no esté contemplado cae al final, alfabéticamente.
  filasSimples.sort((a, b) => {
    const claveA = `${a.nombre}||${a.sabor ?? ""}`;
    const claveB = `${b.nombre}||${b.sabor ?? ""}`;
    const posA = ordenPersonalizado.indexOf(claveA);
    const posB = ordenPersonalizado.indexOf(claveB);

    if (posA !== -1 && posB !== -1) return posA - posB; // ambos en la lista: por posición
    if (posA !== -1) return -1; // solo A está en la lista: A va primero
    if (posB !== -1) return 1; // solo B está en la lista: B va primero
    return claveA.localeCompare(claveB); // ninguno está en la lista: alfabético
  });

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