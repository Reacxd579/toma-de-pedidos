// Configuración de tu proyecto de Firebase (la que copiaste de la consola)
const firebaseConfig = {
  apiKey: "AIzaSyBE1mT2bsXy-0ym38F9wB5QGwCAr59M38o",
  authDomain: "toma-de-pedidos-a3a48.firebaseapp.com",
  projectId: "toma-de-pedidos-a3a48",
  storageBucket: "toma-de-pedidos-a3a48.firebasestorage.app",
  messagingSenderId: "502285796881",
  appId: "1:502285796881:web:d41129c4b5f25e0e8013b0"
};

// Inicializamos Firebase con esa configuración
firebase.initializeApp(firebaseConfig);

// "db" es nuestra conexión a la base de datos Firestore.
// La usamos en script.js y resumen.js para leer y guardar los pedidos.
const db = firebase.firestore();
