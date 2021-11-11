////////Modal carrito/////

const contenedorModal = document.getElementsByClassName('modal-contenedor')[0]
const botonAbrir = document.getElementById('boton-carrito')
const botonCerrar = document.getElementById('carritoCerrar')
const modalCarrito = document.getElementsByClassName('modal-carrito')[0]

botonAbrir.addEventListener('click', ()=>{
    contenedorModal.classList.toggle('modal-active')
})
botonCerrar.addEventListener('click', ()=>{
    contenedorModal.classList.toggle('modal-active')
})
contenedorModal.addEventListener('click', ()=>{
    botonCerrar.click()
})
modalCarrito.addEventListener('click', (event)=>{
    event.stopPropagation()
})

/////////////Texto bienvenida/////////////////

const contenedor = document.getElementById('textoservicios')

contenedor.innerHTML = `
                        <h5>¡Bienvenido/a! Te ofrecemos nuestros productos y servicios para tu mascota:</h5>
                    `



/////////////////SE CREA CONSTRUCTOR//////////////////

class ServiciosMascota{
    constructor(id ,name,price,size, images, cantidad){
        this.id = id;
        this.nombre = name;
        this.precio = price;
        this.tamaño = size;
        this.imagenes = images;
        this.cantidad= cantidad || 1;
    }
    agregarCantidad(){
        this.cantidad++;
    }
}



/////////////////////////ARRAY DE PRODUCTOS////////////////////////////

const contenedorProductos = document.getElementById('contenedorProductos')
const contenedorCarrito = document.getElementById('carrito-contenedor')

const contadorCarrito = document.getElementById('contadorCarrito')
const precioTotal = document.getElementById('precioTotal')

const carrito = []


//////Se renderizan los productos en venta/////////

const mostrarProductos = (array) => {
    contenedorProductos.innerHTML = ''
    
    array.forEach( (producto) => {
        let div = document.createElement("div")
        div.style.width= "18rem";
        div.className= "card";
        div.innerHTML =`<div class="containercard">
                        <img src=${producto.imagenes} class="foto card-img-top" alt="producto">
                            <div class="card-body">
                                <h5 class="card-title textonombre">${producto.nombre}</h5>
                                <div class="card-text">
                                    <p>Precio: $${producto.precio}<br>
                                    Tamaño: ${producto.tamaño}</p>
                                </div>
                                <button onclick="agregarAlCarrito(${producto.id})" class="cuerpobtn btn btn-primary">Agregar <i class="fas fa-shopping-cart"></i></button>
                            </div>  
                        </div>`
        
        contenedorProductos.appendChild(div)
    } )
}

mostrarProductos(productos)

/////////////// Función donde se agregan productos al carrito y se aumenta el contador del carrito, se carga a local storage


const agregarAlCarrito = (itemId) => {

    const productoEnCarrito = carrito.find((prod) => prod.id === itemId)

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++
    } else {

        const producto = productos.find( (prod) => prod.id === itemId)
    
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        })
    }
    
    //se carga carrito a LS
    localStorage.setItem("carrito", JSON.stringify(carrito))

    actualizarCarrito()
}

//////Eliminar productos del carrito 

const eliminarProducto = (itemId) => {
    const producto = carrito.find((prod) => prod.id === itemId)
    
    producto.cantidad--

    if (producto.cantidad === 0) {
        const index = carrito.indexOf(producto)
        carrito.splice(index, 1)
    }
   
    localStorage.setItem('carrito', JSON.stringify(carrito))

    actualizarCarrito()
}

////Función para actualizar carrito cada vez que se agregan o borran items

const actualizarCarrito = () => {
    contenedorCarrito.innerHTML = ""

    carrito.forEach((producto) => {
        const div = document.createElement('div')
        div.classList.add('productoEnCarrito')

        div.innerHTML = `
                <p>${producto.nombre}</p>
                <p>Cantidad: ${producto.cantidad}</p>
                <p>Valor: $${producto.precio}</p>
                <button onclick="eliminarProducto(${producto.id})" class="botoneliminar">Eliminar<i class="bi bi-trash"></i></button>
             `

        contenedorCarrito.appendChild(div)
    })

    contadorCarrito.innerText = carrito.reduce((acc, prod) => acc += prod.cantidad, 0)
    precioTotal.innerText = carrito.reduce((acc, prod) => acc += prod.precio * prod.cantidad, 0)
}




///Recupero datos del carrito de local storage
function recuperarCarrito () {
    carritoLS = JSON.parse(localStorage.getItem('carrito'));

    if (localStorage.getItem('carrito') !== null) {
        for(let i = 0 ; i < carritoLS.length; i++){
            carrito.push(new ServiciosMascota(carritoLS[i].id, carritoLS[i].nombre, carritoLS[i].precio, carritoLS[i].tamaño, carritoLS[i].imagenes, carritoLS[i].cantidad))
        }
    }

    let total = 0; 
    let contador = document.getElementById("contadorCarrito")
    for(let i=0; i< carrito.length; i++){
        total += carrito[i].cantidad
    }
    contador.innerHTML= total

    carrito.forEach((producto) => {
        const div = document.createElement('div')
        div.classList.add('productoEnCarrito')

        div.innerHTML = `
                <p>${producto.nombre}</p>
                <p>Valor: $${producto.precio}</p>
                <p>Cantidad: ${producto.cantidad}</p>
                <button onclick="eliminarProducto(${producto.id})" class="botoneliminar">Eliminar<i class="bi bi-trash"></i></button>
             `

        contenedorCarrito.appendChild(div)
    })

    contadorCarrito.innerText = carrito.reduce((acc, prod) => acc += prod.cantidad, 0)
    precioTotal.innerText = carrito.reduce((acc, prod) => acc += prod.precio * prod.cantidad, 0)
    
}


recuperarCarrito()



/////Finalizar compra con API mercado pago

const finalizarCompra = async () => {
    const productosMP = carrito.map( (prod) => {
        return {
            title: prod.nombre,
            description: "",
            picture_url: "",
            category_id: prod.id,
            quantity: prod.cantidad,
            currency_id: "ARS",
            unit_price: prod.precio
        }
    })

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
                method: "POST",
                headers: {
                    Authorization: "Bearer TEST-3921595038303989-110818-47b499bf5cece659f6586fccd6f7953d-280877156"
                },
                body: JSON.stringify({
                    items: productosMP,
                    back_urls: {
                        success: window.location.href,
                        failure: window.location.href
                    }
                })
            })
    const data = await response.json()
    window.location.replace(data.init_point)

}
