// ===== Paso 1: datos =====

// Catálogo de productos disponibles.
// Cada producto ahora tiene varios NIVELES de precio (ej. Regular, Mayoreo, Especial)
// en vez de un solo precio fijo, porque el mismo producto puede venderse
// distinto según el cliente o la cantidad.
const catalogo = [
  {
    nombre: "Dona",
    sabores: [
      "Choco Piña",
      "Choco Manjar",
      "Manjar",
      "Cajeta",
      "Fresa",
      "Manzana",
      "Choco Fresa",
      "Mora",
    ],
    precios: [
      { etiqueta: "", valor: 5.5 },
      { etiqueta: "", valor: 5 },
      { etiqueta: "", valor: 6 },
    ],
  },
  {
    nombre: "Dona Anillo",
    sabores: [
      "Glase",
      "Chocolate",
      "Arcoiris",
      "ChocoArcoiris",
      "Azúcar",
      "Fresa",
      "Rayada de Chocolate",
      "Rayada de Vainilla",
      "Selva Negra",
      "Moka",
      "Vainilla con Coco",
      "Chocolate con Coco",
      "Chicle",
      "Temporada",
    ],
    precios: [{ etiqueta: "", valor: 5.5 }],
  },
  {
    nombre: "Mini Dona",
    sabores: ["Choco Manjar", "Manjar", "Cajeta", "Fresa", "Manzana"],
    precios: [{ etiqueta: "", valor: 3.5 }],
  },
  {
    nombre: "Strudel",
    sabores: ["Manjar", "Fresa", "Piña", "Manzana"],
    precios: [
      { etiqueta: "", valor: 5.5 },
      { etiqueta: "", valor: 5 },
      { etiqueta: "", valor: 6 },
    ],
  },
  {
    nombre: "Pie de queso",
    sabores: [],
    precios: [
      { etiqueta: "", valor: 5.5 },
      { etiqueta: "", valor: 7 },
    ],
  },
  {
    nombre: "Cubilete",
    sabores: [],
    precios: [
      { etiqueta: "", valor: 5.5 },
      { etiqueta: "", valor: 6 },
    ],
  },
  {
    nombre: "Encanelado",
    sabores: [],
    precios: [
      { etiqueta: "", valor: 5.5 },
      { etiqueta: "", valor: 6 },
    ],
  },
  {
    nombre: "Crossant",
    sabores: [],
    precios: [{ etiqueta: "", valor: 6.5 }],
  },
  {
    nombre: "Empanada de Pollo",
    sabores: [],
    precios: [{ etiqueta: "", valor: 6.5 }],
  },
  {
    nombre: "Volovan",
    sabores: [],
    precios: [{ etiqueta: "", valor: 6.5 }],
  },
  {
    nombre: "Pastel de Banano",
    sabores: [],
    precios: [{ etiqueta: "", valor: 90 }],
  },
];

// El pedido del cliente (empieza vacío, lo llenamos en el siguiente paso)
let pedido = [];

// Guarda el índice (posición) del item del pedido que se está editando
// en este momento. null significa que no hay ninguno en edición.
let editandoIndice = null;

// Nombre del cliente actual (lo declaramos aquí arriba para que
// esté disponible para cualquier función que lo necesite)
let nombreCliente = "";

// ===== Paso 2: pintar el catálogo en pantalla =====

const contenedorCatalogo = document.getElementById("contenedor-catalogo");
const listaCatalogo = document.getElementById("lista-catalogo");

function renderCatalogo() {
  // Limpiamos antes de volver a pintar (importante cuando agregamos productos nuevos)
  listaCatalogo.innerHTML = "";

  catalogo.forEach((producto) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";

    // Si el producto tiene sabores, armamos un <select> con las opciones.
    // Si no tiene (como el pie de queso), dejamos un div vacío que ocupa
    // el mismo espacio, así todas las columnas quedan alineadas.
    let selectHTML = `<span class="sin-sabor"></span>`;
    if (producto.sabores.length > 0) {
      const opciones = producto.sabores
        .map((sabor) => `<option value="${sabor}">${sabor}</option>`)
        .join("");
      selectHTML = `<select class="select-sabor">${opciones}</select>`;
    }

    // Select con los niveles de precio disponibles (Regular, Mayoreo, Especial...)
    const opcionesPrecio = producto.precios
      .map(
        (p) =>
          `<option value="${p.valor}" data-etiqueta="${p.etiqueta}">${p.etiqueta} (Q${p.valor})</option>`,
      )
      .join("");
    const selectPrecioHTML = `<select class="select-precio">${opcionesPrecio}</select>`;

    tarjeta.innerHTML = `
      <span class="nombre">${producto.nombre}</span>
      ${selectHTML}
      ${selectPrecioHTML}
      <input type="number" class="input-cantidad" value="1" min="1">
      <button>Agregar</button>
    `;

    // Guardamos el nombre del producto en el propio botón,
    // así en el próximo paso sabemos qué se está agregando.
    const boton = tarjeta.querySelector("button");
    boton.dataset.producto = producto.nombre;

    listaCatalogo.appendChild(tarjeta);
  });
}

renderCatalogo();

// ===== Paso 3: agregar productos al pedido =====

// Escuchamos los clics en TODO el contenedor del catálogo,
// en vez de poner un evento por cada botón (esto se llama "delegación de eventos").
contenedorCatalogo.addEventListener("click", (evento) => {
  // Si lo que se clickeó no es un botón, no hacemos nada
  if (evento.target.tagName !== "BUTTON") return;

  const boton = evento.target;
  const nombreProducto = boton.dataset.producto;

  // Buscamos si esta tarjeta tiene un <select> de sabor y un input de cantidad
  const tarjeta = boton.closest(".producto");
  const selectSabor = tarjeta.querySelector(".select-sabor");
  const sabor = selectSabor ? selectSabor.value : null; // null si no tiene sabores

  const inputCantidad = tarjeta.querySelector(".input-cantidad");
  // Number() convierte el texto del input en número.
  // Si escriben algo inválido o lo dejan vacío, usamos 1 por defecto.
  let cantidad = Number(inputCantidad.value);
  if (!cantidad || cantidad < 1) cantidad = 1;

  // Leemos el nivel de precio que el usuario eligió (Regular, Mayoreo, Especial...)
  const selectPrecio = tarjeta.querySelector(".select-precio");
  const precio = Number(selectPrecio.value);
  const opcionSeleccionada = selectPrecio.options[selectPrecio.selectedIndex];
  const etiquetaPrecio = opcionSeleccionada.dataset.etiqueta;

  agregarAlPedido(nombreProducto, sabor, cantidad, precio, etiquetaPrecio);

  // Reseteamos el input a 1 después de agregar
  inputCantidad.value = 1;
});

function agregarAlPedido(nombre, sabor, cantidad, precio, etiquetaPrecio) {
  // Buscamos si YA existe en el pedido un item con el mismo nombre, sabor Y nivel de precio.
  // Si el mismo producto se pidió con dos precios distintos, los tratamos como líneas separadas.
  const existente = pedido.find(
    (item) =>
      item.nombre === nombre && item.sabor === sabor && item.precio === precio,
  );

  if (existente) {
    // Ya está en el pedido: sumamos la cantidad indicada
    existente.cantidad += cantidad;
  } else {
    // No está: lo agregamos como nuevo item, guardando precio y su etiqueta
    pedido.push({ nombre, sabor, cantidad, precio, etiquetaPrecio });
  }

  renderPedido();
}

// ===== Mostrar el pedido en pantalla =====

const contenedorPedido = document.getElementById("contenedor-pedido");

function renderPedido() {
  // Encabezado con el nombre del cliente (si escribió algo)
  const encabezadoCliente =
    nombreCliente.trim() !== ""
      ? `<p class="nombre-cliente">Cliente: <strong>${nombreCliente}</strong></p>`
      : "";

  // Si el pedido está vacío, mostramos el mensaje inicial (pero igual el nombre si ya lo puso)
  if (pedido.length === 0) {
    contenedorPedido.innerHTML =
      encabezadoCliente + `<p class="vacio">Todavía no has agregado nada.</p>`;
    return;
  }

  // Convertimos cada item del pedido en una línea con su subtotal (precio x cantidad).
  // Usamos el índice de cada item para saber cuál se está editando.
  const filas = pedido
    .map((item, indice) => {
      const etiquetaProducto = item.sabor
        ? `${item.nombre} de ${item.sabor}`
        : item.nombre;
      const infoPrecio = item.etiquetaPrecio
        ? `${item.etiquetaPrecio} Q${item.precio}/u`
        : `Q${item.precio}/u`;
      const subtotal = item.precio * item.cantidad;

      // Si esta línea es la que se está editando, mostramos un input + botón "Guardar"
      if (indice === editandoIndice) {
        return `<div class="linea-pedido editando">
                  <span>${etiquetaProducto} <span class="precio-unitario">[${infoPrecio}]</span></span>
                  <input type="number" class="input-editar-cantidad" value="${item.cantidad}" min="1">
                  <button class="btn-guardar-linea" data-indice="${indice}">💾 Guardar</button>
                </div>`;
      }

      // Si no, mostramos la línea normal con el botón "Editar"
      return `<div class="linea-pedido">
                <span>${item.cantidad}x ${etiquetaProducto} <span class="precio-unitario">[${infoPrecio}]</span></span>
                <span class="subtotal-linea">Q${subtotal.toFixed(2)}</span>
                <button class="btn-editar-linea" data-indice="${indice}">✏️ Editar</button>
              </div>`;
    })
    .join("");

  // Totales: sumamos todas las cantidades y todos los subtotales
  const totalUnidades = pedido.reduce((suma, item) => suma + item.cantidad, 0);
  const totalDinero = pedido.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0,
  );

  const resumen = `
    <div class="resumen">
      <div class="linea-resumen"><span>Total de unidades</span><span>${totalUnidades}</span></div>
      <div class="linea-resumen total"><span>Total a pagar</span><span>Q${totalDinero.toFixed(2)}</span></div>
    </div>
  `;

  contenedorPedido.innerHTML = encabezadoCliente + filas + resumen;
}

// ===== Editar la cantidad de un item ya agregado al pedido =====

contenedorPedido.addEventListener("click", (evento) => {
  const botonEditar = evento.target.closest(".btn-editar-linea");
  const botonGuardar = evento.target.closest(".btn-guardar-linea");

  if (botonEditar) {
    // Guardamos qué línea se va a editar y volvemos a pintar;
    // renderPedido() va a mostrar el input en esa línea.
    editandoIndice = Number(botonEditar.dataset.indice);
    renderPedido();
    return;
  }

  if (botonGuardar) {
    const indice = Number(botonGuardar.dataset.indice);

    // Buscamos el input de cantidad que está en la misma línea que el botón
    const linea = botonGuardar.closest(".linea-pedido");
    const inputNuevaCantidad = linea.querySelector(".input-editar-cantidad");

    let nuevaCantidad = Number(inputNuevaCantidad.value);
    if (!nuevaCantidad || nuevaCantidad < 1) {
      alert("La cantidad debe ser un número mayor a 0.");
      return;
    }

    // Actualizamos la cantidad del item correspondiente en el array del pedido
    pedido[indice].cantidad = nuevaCantidad;

    // Salimos del modo edición y volvemos a pintar con los datos actualizados
    editandoIndice = null;
    renderPedido();
  }
});

// ===== Paso 5: confirmar el pedido =====

// Aquí guardamos todos los pedidos ya confirmados.
// Si ya había pedidos guardados de una sesión anterior, los recuperamos.
const historialGuardado = localStorage.getItem("historialPedidos");
let historial = historialGuardado ? JSON.parse(historialGuardado) : [];

const contenedorHistorial = document.getElementById("contenedor-historial");
const btnAgregarPedido = document.getElementById("btn-agregar-pedido");

btnAgregarPedido.addEventListener("click", () => {
  if (pedido.length === 0) {
    alert("El pedido está vacío, agrega algún producto primero.");
    return;
  }

  // Armamos el objeto del pedido confirmado: cliente + copia de los items + totales
  const totalUnidades = pedido.reduce((suma, item) => suma + item.cantidad, 0);
  const totalDinero = pedido.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0,
  );

  historial.push({
    cliente: nombreCliente.trim() === "" ? "Sin nombre" : nombreCliente,
    items: pedido, // guardamos los items tal cual estaban
    totalUnidades,
    totalDinero,
  });

  // Reiniciamos el pedido actual y el nombre para el siguiente cliente
  pedido = [];
  nombreCliente = "";
  editandoIndice = null;
  inputCliente.value = "";

  renderPedido();
  renderHistorial();

  // Guardamos el historial en localStorage para que la página de resumen
  // (que se abre en otra pestaña) pueda leerlo.
  localStorage.setItem("historialPedidos", JSON.stringify(historial));
});

function renderHistorial() {
  if (historial.length === 0) {
    contenedorHistorial.innerHTML = `<p class="vacio">Todavía no hay pedidos confirmados.</p>`;
    return;
  }

  const tarjetasPedidos = historial
    .map((pedidoConfirmado, indice) => {
      const filasItems = pedidoConfirmado.items
        .map((item) => {
          const etiqueta = item.sabor
            ? `${item.nombre} de ${item.sabor}`
            : item.nombre;
          const subtotal = item.precio * item.cantidad;
          return `<div class="linea-pedido">
                    <span>${item.cantidad}x ${etiqueta} <span class="precio-unitario">[${item.etiquetaPrecio} Q${item.precio}/u]</span></span>
                    <span>Q${subtotal.toFixed(2)}</span>
                  </div>`;
        })
        .join("");

      return `
        <div class="tarjeta-historial">
          <p class="nombre-cliente">Pedido #${indice + 1} — <strong>${pedidoConfirmado.cliente}</strong></p>
          ${filasItems}
          <div class="resumen">
            <div class="linea-resumen"><span>Total de unidades</span><span>${pedidoConfirmado.totalUnidades}</span></div>
            <div class="linea-resumen total"><span>Total pagado</span><span>Q${pedidoConfirmado.totalDinero.toFixed(2)}</span></div>
          </div>
        </div>
      `;
    })
    .join("");

  contenedorHistorial.innerHTML = tarjetasPedidos;
}

// ===== Paso 6: borrar todos los pedidos confirmados =====

const btnBorrarHistorial = document.getElementById("btn-borrar-historial");

btnBorrarHistorial.addEventListener("click", () => {
  if (historial.length === 0) {
    alert("No hay pedidos que borrar.");
    return;
  }

  // confirm() muestra un cuadro de sí/no; si el usuario cancela, no hacemos nada
  const confirmado = confirm(
    "¿Seguro que quieres borrar TODOS los pedidos realizados? Esta acción no se puede deshacer.",
  );
  if (!confirmado) return;

  historial = [];
  localStorage.setItem("historialPedidos", JSON.stringify(historial));
  renderHistorial();
});

// ===== Paso 4a: nombre del cliente =====

const inputCliente = document.getElementById("input-cliente");
inputCliente.addEventListener("input", () => {
  nombreCliente = inputCliente.value;
  renderPedido();
});

// ===== Pintar el historial recuperado (si había pedidos de antes) al cargar la página =====
renderHistorial();
