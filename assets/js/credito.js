function calcular() {
  var montoASolicitar = parseFloat(
    document.getElementById("montoASolicitar").value
  );
  var tasaAnual = parseFloat(document.getElementById("tasaAnual").value);
  var plazoAnios = parseInt(document.getElementById("plazoAnios").value);
  var salarioNetoMensual = parseFloat(
    document.getElementById("salarioNetoMensual").value
  );
  var valorVivienda = parseFloat(
    document.getElementById("valorVivienda").value
  );
  var fechaNacimiento = document.getElementById("FechaNacimiento").value;

  // Validaciones
  if (isNaN(salarioNetoMensual) || salarioNetoMensual <= 0) {
    alert("Debes poner el salario neto mensual");
    return false;
  }

  if (isNaN(montoASolicitar) || montoASolicitar <= 0) {
    alert("Debes poner el monto a solicitar");
    return false;
  }

  var porcentajeFinanciar = calcularPorcentajeFinanciamiento(
    montoASolicitar,
    valorVivienda
  );

  if (porcentajeFinanciar > 80) {
    alert(
      "El porcentaje a financiar no puede superar el 80%. El monto solicitado equivale al " +
        porcentajeFinanciar +
        "%"
    );
    return false;
  }

  // Guardar en localStorage
  localStorage.setItem(
    "datosPrestamo",
    JSON.stringify({
      email: document.getElementById("email").value,
      nombre: document.getElementById("nombre").value,
      fechaNacimiento: fechaNacimiento,
      salarioNetoMensual,
      tasaAnual,
      plazoAnios,
      valorVivienda,
      montoASolicitar,
    })
  );

  // Cálculos
  var pm = calcularPagoMensual(montoASolicitar, tasaAnual, plazoAnios);
  var salarioMinimo = calcularSalarioMinimo(pm);

  mostrarReporteCredito({
    correo: document.getElementById("email").value,
    nombre: document.getElementById("nombre").value,
    fechaNacimiento: fechaNacimiento,
    salario: salarioNetoMensual,
    valorVivienda: valorVivienda,
    montoSolicitar: montoASolicitar,
    plazo: plazoAnios,
    tasaInteres: tasaAnual,
    pm: pm,
    salarioMinimo: salarioMinimo,
    porcentajeFinanciar: porcentajeFinanciar.toFixed(2),
    indicado: verificarSalario(salarioMinimo, salarioNetoMensual),
    esEdadValida: verificarEdad(fechaNacimiento),
  });

  generarProyeccionPagos(plazoAnios * 12, pm, montoASolicitar, tasaAnual / 12);

  return true;
}

function mostrarReporteCredito({
  correo,
  nombre,
  fechaNacimiento,
  salario,
  valorVivienda,
  montoSolicitar,
  plazo,
  tasaInteres,
  pm,
  salarioMinimo,
  porcentajeFinanciar,
  indicado,
  esEdadValida,
}) {
  // Insertar datos
  document.getElementById(
    "tdCorreo"
  ).innerHTML = `<a href="mailto:${correo}">${correo}</a>`;
  document.getElementById("tdNombre").textContent = nombre;
  document.getElementById("tdFecha").textContent = fechaNacimiento;
  document.getElementById("tdSalario").textContent = formatear(salario);
  document.getElementById("tdValorVivienda").textContent =
    formatear(valorVivienda);
  document.getElementById("tdMontoSolicitar").textContent =
    formatear(montoSolicitar);
  document.getElementById("tdPlazo").textContent = plazo;
  document.getElementById("tdTasa").textContent =
    tasaInteres.toFixed(2).replace(".", ",") + "%";
  document.getElementById("tdCuota").innerHTML = `<strong>${formatear(
    pm
  )}</strong>`;
  document.getElementById("tdSalarioMinimo").textContent =
    formatear(salarioMinimo);
  document.getElementById("tdPorcentaje").textContent =
    porcentajeFinanciar + "%";

  document.getElementById("tdIndicado").style.color = indicado
    ? "green"
    : "red";
  document.getElementById("tdIndicado").textContent = indicado
    ? "Monto de salario suficiente para el crédito"
    : "Monto de salario insuficiente";

  document.getElementById("tdEdad").style.color = esEdadValida
    ? "green"
    : "red";

  document.getElementById("tdEdad").textContent = esEdadValida
    ? "Cliente con edad suficiente para crédito"
    : "Cliente no califica para crédito por edad";
}

function formatear(num) {
  return (
    num.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "$"
  );
}

function calcularPagoMensual(montoASolicitar, tasaAnual, plazoAnios) {
  var tm = tasaAnual / 12;
  var p = plazoAnios * 12;

  var numerador = montoASolicitar * (tm / 100) * Math.pow(1 + tm / 100, p);
  var denominador = Math.pow(1 + tm / 100, p) - 1;

  var pm = numerador / denominador;

  return pm;
}

function calcularSalarioMinimo(pm) {
  return pm * 0.4;
}

function verificarSalario(salarioMinimo, salarioNetoMensual) {
  if (salarioMinimo <= salarioNetoMensual) {
    return true;
  } else {
    return false;
  }
}

function verificarEdad(fechaNacimiento) {
  var fechaActual = new Date();
  var nacimiento = new Date(fechaNacimiento);

  var edad = fechaActual.getFullYear() - nacimiento.getFullYear();

  var mes = fechaActual.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && fechaActual.getDate() < nacimiento.getDate())) {
    edad--;
  }

  if (edad > 22 && edad < 55) {
    return true;
  } else {
    return false;
  }
}

function calcularPorcentajeFinanciamiento(montoASolicitar, valorVivienda) {
  return (montoASolicitar / valorVivienda) * 100;
}

function generarProyeccionPagos(cantMeses, pm, montoASolicitar, tasaMensual) {
  var interes = 0;

  var tbody = document.getElementById("proyeccion");

  tbody.innerHTML = "";

  let saldo = montoASolicitar;

  for (let i = 1; i <= cantMeses; i++) {
    interes = saldo * (tasaMensual / 100);

    let amortizacion = pm - interes;

    saldo = saldo - amortizacion;

    if (saldo <= 0) saldo = 0;

    var fila = document.createElement("tr");
    fila.innerHTML = `
        <td>${i}</td>
        <td>${formatear(pm)}</td>
        <td>${formatear(interes)}</td>
        <td>${formatear(amortizacion)}</td>
        <td>${formatear(saldo)}</td>
    `;
    tbody.appendChild(fila);
  }
}

/*Botones de ocultar y mostrar el contenido*/
function mostrarContenido() {
  var elementos = document.querySelectorAll("#Tabla, #resultados, #btnOcultar");

  elementos.forEach(function (elemento) {
    elemento.classList.remove("d-none"); // Mostrar los elementos
  });
}

function OcultarContenido() {
  var elementos = document.querySelectorAll("#Tabla, #resultados,#btnOcultar");

  elementos.forEach(function (elemento) {
    elemento.classList.add("d-none"); // Mostrar los elementos
  });
}

/*Termina botones de ocultar y mostrar*/



/*Esta funcion es para Cargar automaticamente los datos guardados*/
document.addEventListener("DOMContentLoaded", () => {
  const datosGuardados = JSON.parse(localStorage.getItem("datosPrestamo"));
  if (datosGuardados) {
    document.getElementById("email").value = datosGuardados.email || "";
    document.getElementById("nombre").value = datosGuardados.nombre || "";
    document.getElementById("FechaNacimiento").value =
      datosGuardados.fechaNacimiento || "";
    document.getElementById("salarioNetoMensual").value =
      datosGuardados.salarioNetoMensual || "";
    document.getElementById("tasaAnual").value = datosGuardados.tasaAnual || "";
    document.getElementById("plazoAnios").value =
      datosGuardados.plazoAnios || "";
    document.getElementById("valorVivienda").value =
      datosGuardados.valorVivienda || "";
    document.getElementById("montoASolicitar").value =
      datosGuardados.montoASolicitar || "";

      
    document.getElementById("plazoValor").textContent =
      datosGuardados.plazoAnios || "5";
  }
});
