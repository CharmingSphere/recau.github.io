// Arreglo de productos y ventas almacenados
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let ventaActual = []; // Productos agregados a la venta en curso

// Función para agregar un producto
function agregarProducto() {
    const nombre = document.getElementById("nombre-producto").value;
    const precio = parseFloat(document.getElementById("precio-producto").value);
    const tipo = document.getElementById("tipo-producto").value;

    if (nombre && !isNaN(precio) && precio > 0) {
        const producto = {
            id: productos.length + 1,
            nombre,
            precio,
            tipo
        };
        productos.push(producto);
        localStorage.setItem("productos", JSON.stringify(productos));
        actualizarProductosSelect(); // Actualiza los selects de productos
        alert("Producto agregado correctamente.");
    } else {
        alert("Por favor ingresa un nombre y precio válidos.");
    }
}

// Función para actualizar el select de productos (con filtro)
function actualizarProductosSelect(filtro = "") {
    const productosSelect = document.getElementById("productos-venta");
    const productosEditarSelect = document.getElementById("productos-editar");
    
    productosSelect.innerHTML = '';
    productosEditarSelect.innerHTML = '<option value="">Selecciona un producto</option>';

    // Filtrar los productos según el filtro ingresado
    const productosFiltrados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    productosFiltrados.forEach(producto => {
        const optionVenta = document.createElement("option");
        optionVenta.value = producto.id;
        optionVenta.textContent = `${producto.nombre} - $${producto.precio} por ${producto.tipo}`;
        productosSelect.appendChild(optionVenta);

        const optionEditar = document.createElement("option");
        optionEditar.value = producto.id;
        optionEditar.textContent = `${producto.nombre} - $${producto.precio} por ${producto.tipo}`;
        productosEditarSelect.appendChild(optionEditar);
    });
}

// Función para agregar productos a la venta
function agregarAventa() {
    const productoId = parseInt(document.getElementById("productos-venta").value);
    const cantidad = parseFloat(document.getElementById("cantidad-venta").value);

    if (productoId && cantidad > 0) {
        const producto = productos.find(p => p.id === productoId);
        const totalProducto = cantidad * producto.precio;

        // Agregar el producto a la venta actual
        ventaActual.push({ ...producto, cantidad, totalProducto });

        // Mostrar los productos en la venta
        mostrarProductosVenta();

        // Actualizar el total
        actualizarTotal();
    } else {
        alert("Por favor selecciona un producto y cantidad válida.");
    }
}

// Función para mostrar los productos en la venta
function mostrarProductosVenta() {
    const lista = document.getElementById("productos-en-venta");
    lista.innerHTML = '';

    ventaActual.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.cantidad} ${item.tipo === 'kilo' ? 'kg' : 'pieza'} de ${item.nombre} - $${item.totalProducto.toFixed(2)}`;
        lista.appendChild(li);
    });
}

// Función para actualizar el total de la venta
function actualizarTotal() {
    const total = ventaActual.reduce((acc, item) => acc + item.totalProducto, 0);
    document.getElementById("total-venta").textContent = `$${total.toFixed(2)}`;
}

// Función para finalizar la venta
function finalizarVenta() {
    if (ventaActual.length > 0) {
        ventas.push(...ventaActual); // Añadir la venta al historial
        localStorage.setItem("ventas", JSON.stringify(ventas));
        alert("Venta realizada correctamente.");

        // Limpiar la venta actual
        ventaActual = [];
        mostrarProductosVenta();
        actualizarTotal();
        verVentas(); // Mostrar el historial actualizado
    } else {
        alert("No hay productos en la venta.");
    }
}

// Función para ver el reporte de ventas
function verVentas() {
    const reporteDiv = document.getElementById("reporte-ventas");
    reporteDiv.innerHTML = '';

    if (ventas.length === 0) {
        reporteDiv.innerHTML = "<p>No se han realizado ventas.</p>";
    } else {
        ventas.forEach(venta => {
            const ventaDiv = document.createElement("div");
            ventaDiv.innerHTML = `
                ${venta.cantidad} ${venta.tipo === 'kilo' ? 'kg' : 'pieza'} de ${venta.nombre} - $${venta.totalProducto.toFixed(2)}
            `;
            reporteDiv.appendChild(ventaDiv);
        });
    }
}

// Función para exportar el reporte de ventas a un archivo Excel
function exportarAExcel() {
    const ws = XLSX.utils.json_to_sheet(ventas.map(venta => ({
        Producto: venta.nombre,
        Cantidad: `${venta.cantidad} ${venta.tipo === 'kilo' ? 'kg' : 'pieza'}`,
        Total: `$${venta.totalProducto.toFixed(2)}`
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, "Reporte_Ventas.xlsx");
}

// Función para exportar el reporte de ventas a un archivo PDF
function exportarAPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text("Reporte de Ventas", 20, 10);

    let y = 20;
    ventas.forEach(venta => {
        doc.text(`${venta.cantidad} ${venta.tipo === 'kilo' ? 'kg' : 'pieza'} de ${venta.nombre} - $${venta.totalProducto.toFixed(2)}`, 20, y);
        y += 10;
    });

    doc.save("Reporte_Ventas.pdf");
}

// Función para borrar el historial de ventas con confirmación
function borrarHistorialVentas() {
    const confirmar = window.confirm("¿Estás seguro de que deseas borrar todo el historial de ventas? Esta acción no se puede deshacer.");

    if (confirmar) {
        // Borrar las ventas del localStorage y del arreglo de ventas
        ventas = [];
        localStorage.setItem("ventas", JSON.stringify(ventas));
        alert("Historial de ventas borrado correctamente.");
        verVentas(); // Actualizar el reporte después de borrar
    } else {
        alert("La acción ha sido cancelada.");
    }
}

// Función para cargar el producto seleccionado para editar
function cargarProductoEditar() {
    const productoId = parseInt(document.getElementById("productos-editar").value);
    const producto = productos.find(p => p.id === productoId);
    
    if (producto) {
        document.getElementById("nombre-editar").value = producto.nombre;
        document.getElementById("precio-editar").value = producto.precio;
    }
}

// Función para guardar los cambios realizados al producto
function guardarCambios() {
    const productoId = parseInt(document.getElementById("productos-editar").value);
    const nombre = document.getElementById("nombre-editar").value;
    const precio = parseFloat(document.getElementById("precio-editar").value);

    if (productoId && nombre && !isNaN(precio) && precio > 0) {
        const producto = productos.find(p => p.id === productoId);
        producto.nombre = nombre;
        producto.precio = precio;

        localStorage.setItem("productos", JSON.stringify(productos));
        actualizarProductosSelect(); // Actualizar selects
        alert("Producto modificado correctamente.");
    } else {
        alert("Por favor ingresa un nombre y precio válidos.");
    }
}

// Función para eliminar un producto
function eliminarProducto() {
    const productoId = parseInt(document.getElementById("productos-editar").value);

    if (productoId) {
        const index = productos.findIndex(p => p.id === productoId);
        if (index !== -1) {
            productos.splice(index, 1);
            localStorage.setItem("productos", JSON.stringify(productos));
            actualizarProductosSelect(); // Actualizar selects
            alert("Producto eliminado correctamente.");
        }
    } else {
        alert("Selecciona un producto para eliminar.");
    }
}

// Inicialización de los selects de productos al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    actualizarProductosSelect(); // Cargar todos los productos
    verVentas(); // Asegura que el historial de ventas esté visible desde el principio

    // Agregar eventos de escucha para el filtro
    document.getElementById("filtro-productos-editar").addEventListener("input", function() {
        const filtro = this.value;
        actualizarProductosSelect(filtro); // Actualiza los selects con el filtro
    });

    document.getElementById("filtro-productos-venta").addEventListener("input", function() {
        const filtro = this.value;
        actualizarProductosSelect(filtro); // Actualiza los selects con el filtro
    });
});

function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll("section");
    secciones.forEach(seccion => {
        seccion.style.display = "none";
    });

    // Mostrar la sección seleccionada
    const seccionSeleccionada = document.getElementById(seccionId);
    if (seccionSeleccionada) {
        seccionSeleccionada.style.display = "block";
    }
}

// Añadir eventos a los enlaces de la navbar
document.addEventListener("DOMContentLoaded", function() {
    const enlacesNavbar = document.querySelectorAll("nav a");

    // Mostrar la primera sección al cargar la página
    mostrarSeccion("seccion-venta");  // Cambia por la id de la sección que quieras que se vea por defecto

    enlacesNavbar.forEach(enlace => {
        enlace.addEventListener("click", function(event) {
            event.preventDefault();
            const seccionId = enlace.getAttribute("href").substring(1); // Obtener el ID de la sección (sin el #)
            mostrarSeccion(seccionId);
        });
    });
});

document.getElementById("hamburger-icon").addEventListener("click", function() {
    const menu = document.getElementById("menu");
    menu.classList.toggle("show"); // Agregar o quitar la clase 'show' que muestra el menú
});