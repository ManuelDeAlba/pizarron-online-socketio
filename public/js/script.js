const socket = io();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const btnBorrar = document.getElementById("btnBorrar");
const app = document.querySelector('.app');
const btnFullScreen= document.getElementById("btnFullScreen");

let coordenadas = {};
let mouse = {
    click: false,
    x: undefined,
    y: undefined
};

function dibujar(){
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.miterLimit = 0;

    let keys = Object.keys(coordenadas);

    keys.forEach(key => {
        let coords = coordenadas[key];

        coords.forEach(linea => {
            linea.forEach((punto, indice) => {
                // Si existe un punto más adelante, entonces dibuja una linea hacia él
                if(linea[indice + 1]){
                    ctx.beginPath();
                    ctx.moveTo(canvas.width * linea[indice][0], canvas.height * linea[indice][1]);
                    ctx.lineTo(canvas.width * linea[indice + 1][0], canvas.height * linea[indice + 1][1]);
                    ctx.stroke();
                }
            })
        })
    })
}

function loop(){
    canvas.width = canvas.width;

    dibujar();

    requestAnimationFrame(loop);
}

canvas.addEventListener('mousedown', e => {
    mouse.click = true;

    socket.emit("crearEspacio", {id: socket.id})
})

canvas.addEventListener('mousemove', e => {
    mouse.x = e.clientX - canvas.getBoundingClientRect().left;
    mouse.y = e.clientY - canvas.getBoundingClientRect().top;

    if(mouse.click){
        // Enviar coordenadas
        socket.emit("enviarCoordenada", {id: socket.id, coordenada: [mouse.x / canvas.width, mouse.y / canvas.height]});
    }
})

canvas.addEventListener('mouseup', e => {
    mouse.click = false;
})

//! Eventos touch
canvas.addEventListener('touchstart', e => {
    mouse.click = true;

    socket.emit("crearEspacio", {id: socket.id})
})

canvas.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    mouse.y = e.touches[0].clientY - canvas.getBoundingClientRect().top;

    if(mouse.click){
        // Enviar coordenadas
        socket.emit("enviarCoordenada", {id: socket.id, coordenada: [mouse.x / canvas.width, mouse.y / canvas.height]});
    }
})

canvas.addEventListener('touchend', e => {
    mouse.click = false;
})

btnBorrar.addEventListener('click', () => {
    socket.emit("borrarCanvas", {});
})

btnFullScreen.addEventListener('click', () => {
    if(!document.fullscreenElement){
        app.requestFullscreen();
        btnFullScreen.textContent = "Salir de pantalla completa";
    } else {
        document.exitFullscreen();
        btnFullScreen.textContent = "Entrar a pantalla completa";
    }
})

window.addEventListener('load', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - btnBorrar.offsetHeight - 1;
    
    socket.emit("obtenerCoordenadas", {});

    loop();
})

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - btnBorrar.offsetHeight - 1;
})

// Escuchar eventos del servidor
socket.on("obtenerCoordenadas", coord => coordenadas = coord);