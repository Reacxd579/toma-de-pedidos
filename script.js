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
      <label class="check-regalia">
        <input type="checkbox" class="check-regalia-input">
        🎁 Regalía
      </label>
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

  // Leemos el checkbox de "Regalía". Si está marcado, el producto se agrega
  // SIN costo (precio 0) sin importar qué nivel de precio esté seleccionado.
  const checkRegalia = tarjeta.querySelector(".check-regalia-input");

  let precio;
  let etiquetaPrecio;

  if (checkRegalia.checked) {
    precio = 0;
    etiquetaPrecio = "Regalía";
  } else {
    // Leemos el nivel de precio que el usuario eligió (Regular, Mayoreo, Especial...)
    const selectPrecio = tarjeta.querySelector(".select-precio");
    precio = Number(selectPrecio.value);
    const opcionSeleccionada = selectPrecio.options[selectPrecio.selectedIndex];
    etiquetaPrecio = opcionSeleccionada.dataset.etiqueta;
  }

  agregarAlPedido(nombreProducto, sabor, cantidad, precio, etiquetaPrecio);

  // Reseteamos el input a 1 y el checkbox después de agregar
  inputCantidad.value = 1;
  checkRegalia.checked = false;
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

// Función auxiliar: arma el texto de precio para mostrar en una línea.
// Si el item es una regalía, mostramos "Regalía" en vez de "Q0/u".
function formatearInfoPrecio(item) {
  if (item.etiquetaPrecio === "Regalía") {
    return "Regalía";
  }
  return item.etiquetaPrecio
    ? `${item.etiquetaPrecio} Q${item.precio}/u`
    : `Q${item.precio}/u`;
}

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
      const infoPrecio = formatearInfoPrecio(item);
      const subtotal = item.precio * item.cantidad;

      // Si esta línea es la que se está editando, mostramos un input + botón "Guardar"
      if (indice === editandoIndice) {
        return `<div class="linea-pedido editando">
                  <span>${etiquetaProducto} <span class="precio-unitario">[${infoPrecio}]</span></span>
                  <input type="number" class="input-editar-cantidad" value="${item.cantidad}" min="1">
                  <button class="btn-guardar-linea" data-indice="${indice}">💾 Guardar</button>
                </div>`;
      }

      // Si no, mostramos la línea normal con los botones "Editar" y "Quitar"
      return `<div class="linea-pedido">
                <span>${item.cantidad}x ${etiquetaProducto} <span class="precio-unitario">[${infoPrecio}]</span></span>
                <span class="subtotal-linea">Q${subtotal.toFixed(2)}</span>
                <button class="btn-editar-linea" data-indice="${indice}">✏️ Editar</button>
                <button class="btn-quitar-linea" data-indice="${indice}">🗑️ Quitar</button>
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
  const botonQuitar = evento.target.closest(".btn-quitar-linea");

  if (botonEditar) {
    // Guardamos qué línea se va a editar y volvemos a pintar;
    // renderPedido() va a mostrar el input en esa línea.
    editandoIndice = Number(botonEditar.dataset.indice);
    renderPedido();
    return;
  }

  if (botonQuitar) {
    const indice = Number(botonQuitar.dataset.indice);
    const item = pedido[indice];
    const etiquetaProducto = item.sabor
      ? `${item.nombre} de ${item.sabor}`
      : item.nombre;

    const confirmado = confirm(
      `¿Quitar "${item.cantidad}x ${etiquetaProducto}" del pedido?`,
    );
    if (!confirmado) return;

    // .splice(indice, 1) elimina 1 elemento a partir de esa posición del array
    pedido.splice(indice, 1);

    // Si justo estábamos editando esa línea (o una que ya no existe), salimos del modo edición
    editandoIndice = null;
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

// ===== Paso 5: confirmar el pedido (ahora guardado en Firestore) =====

// Aquí guardamos todos los pedidos ya confirmados. Ya no lo llenamos
// manualmente: lo mantiene actualizado el "listener" de Firestore de abajo.
let historial = [];

const contenedorHistorial = document.getElementById("contenedor-historial");
const btnAgregarPedido = document.getElementById("btn-agregar-pedido");

// onSnapshot "escucha" la colección "pedidos" en Firestore todo el tiempo.
// Cada vez que hay un cambio (desde ESTE dispositivo o desde CUALQUIER OTRO
// dispositivo conectado a la misma base de datos), esta función se vuelve
// a ejecutar automáticamente con los datos más recientes.
db.collection("pedidos")
  .orderBy("fecha", "asc")
  .onSnapshot(
    (snapshot) => {
      // Convertimos cada documento de Firestore en un objeto normal de JS,
      // guardando también su "id" (lo necesitamos para poder borrarlo después)
      historial = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      renderHistorial();
    },
    (error) => {
      console.error("Error al escuchar los pedidos:", error);
      alert(
        "No se pudo conectar con la base de datos. Revisa tu conexión a internet.",
      );
    },
  );

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

  // Deshabilitamos el botón mientras se guarda, para evitar doble clic
  btnAgregarPedido.disabled = true;
  btnAgregarPedido.textContent = "Guardando...";

  // .add() guarda un nuevo documento en la colección "pedidos" de Firestore.
  // Es una operación asíncrona (tarda un poquito porque viaja por internet),
  // por eso usamos .then() para saber cuándo terminó.
  db.collection("pedidos")
    .add({
      cliente: nombreCliente.trim() === "" ? "Sin nombre" : nombreCliente,
      items: pedido,
      totalUnidades,
      totalDinero,
      // serverTimestamp() usa la hora del servidor de Google, no la del
      // celular/computadora de quien lo registra (así no hay desorden si
      // alguien tiene la hora mal configurada en su dispositivo)
      fecha: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      // Reiniciamos el pedido actual y el nombre para el siguiente cliente.
      // No hace falta llamar renderHistorial() aquí: en cuanto Firestore
      // confirma el guardado, el onSnapshot de arriba se dispara solo.
      pedido = [];
      nombreCliente = "";
      editandoIndice = null;
      inputCliente.value = "";
      renderPedido();
    })
    .catch((error) => {
      console.error("Error al guardar el pedido:", error);
      alert(
        "No se pudo guardar el pedido. Revisa tu conexión a internet e intenta de nuevo.",
      );
    })
    .finally(() => {
      btnAgregarPedido.disabled = false;
      btnAgregarPedido.textContent = "✅ Agregar pedido";
    });
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
          const infoPrecio = formatearInfoPrecio(item);
          return `<div class="linea-pedido">
                    <span>${item.cantidad}x ${etiqueta} <span class="precio-unitario">[${infoPrecio}]</span></span>
                    <span>Q${subtotal.toFixed(2)}</span>
                  </div>`;
        })
        .join("");

      return `
        <div class="tarjeta-historial" data-indice="${indice}">
          <p class="nombre-cliente">Pedido #${indice + 1} — <strong>${pedidoConfirmado.cliente}</strong></p>
          ${filasItems}
          <div class="resumen">
            <div class="linea-resumen"><span>Total de unidades</span><span>${pedidoConfirmado.totalUnidades}</span></div>
            <div class="linea-resumen total"><span>Total pagado</span><span>Q${pedidoConfirmado.totalDinero.toFixed(2)}</span></div>
          </div>
          <button class="btn-descargar-imagen" data-indice="${indice}">📷 Descargar imagen</button>
        </div>
      `;
    })
    .join("");

  contenedorHistorial.innerHTML = tarjetasPedidos;
}

// ===== Descargar un pedido confirmado como imagen =====

contenedorHistorial.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".btn-descargar-imagen");
  if (!boton) return;

  const indice = Number(boton.dataset.indice);
  const tarjeta = boton.closest(".tarjeta-historial");
  const pedidoConfirmado = historial[indice];

  // html2canvas "toma una foto" del elemento HTML que le pasamos y nos
  // devuelve un <canvas> (un lienzo de dibujo) con esa imagen.
  // ignoreElements le dice que NO incluya el propio botón en la foto.
  html2canvas(tarjeta, {
    backgroundColor: "#ffffff",
    scale: 2, // el doble de resolución, para que se vea nítido al hacer zoom
    ignoreElements: (el) => el.classList.contains("btn-descargar-imagen"),
  }).then((canvas) => {
    // Convertimos el canvas en una URL de imagen PNG
    const urlImagen = canvas.toDataURL("image/png");

    // Armamos un nombre de archivo limpio a partir del nombre del cliente
    // (reemplazamos espacios y caracteres raros por guiones bajos)
    const nombreLimpio = pedidoConfirmado.cliente
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_");

    // Creamos un link invisible con el atributo "download" y le hacemos
    // clic por código — así el navegador descarga el archivo automáticamente.
    const link = document.createElement("a");
    link.download = `pedido-${indice + 1}-${nombreLimpio}.png`;
    link.href = urlImagen;
    link.click();
  });
});

// ===== Paso 6: borrar todos los pedidos confirmados (ahora en Firestore) =====

const btnBorrarHistorial = document.getElementById("btn-borrar-historial");

btnBorrarHistorial.addEventListener("click", () => {
  if (historial.length === 0) {
    alert("No hay pedidos que borrar.");
    return;
  }

  const confirmado = confirm(
    "¿Seguro que quieres borrar TODOS los pedidos realizados? Esta acción no se puede deshacer.",
  );
  if (!confirmado) return;

  btnBorrarHistorial.disabled = true;
  btnBorrarHistorial.textContent = "Borrando...";

  // Un "batch" agrupa varias operaciones de borrado en una sola,
  // más eficiente que borrar documento por documento uno a la vez.
  const lote = db.batch();
  historial.forEach((pedidoConfirmado) => {
    lote.delete(db.collection("pedidos").doc(pedidoConfirmado.id));
  });

  lote
    .commit()
    .then(() => {
      // No hace falta llamar renderHistorial() aquí: el onSnapshot
      // detecta el borrado y actualiza la pantalla automáticamente.
    })
    .catch((error) => {
      console.error("Error al borrar los pedidos:", error);
      alert(
        "No se pudieron borrar los pedidos. Revisa tu conexión a internet.",
      );
    })
    .finally(() => {
      btnBorrarHistorial.disabled = false;
      btnBorrarHistorial.textContent = "🗑️ Borrar pedidos";
    });
});

// ===== Paso 4a: nombre del cliente =====

const inputCliente = document.getElementById("input-cliente");
inputCliente.addEventListener("input", () => {
  nombreCliente = inputCliente.value;
  renderPedido();
});
