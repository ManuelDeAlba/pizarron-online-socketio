const express = require("express");
const socketIO = require("socket.io");
const { isObject } = require("util");
const app = express();

app.set("PORT", process.env.PORT || 3000);

app.use(express.static("public"));

const server = app.listen(app.get("PORT"), () => {
    console.log(`Servidor en el puerto ${app.get("PORT")}`);
})

let coordenadas = {};

const io = socketIO(server);

io.on("connection", socket => {
    console.log("Usuario conectado:", socket.id);
    
    // Si no existe su usuario, se agrega al objeto
    coordenadas[socket.id] ??= [];

    socket.on("obtenerCoordenadas", () => {
        io.emit("obtenerCoordenadas", coordenadas);
    })

    socket.on("crearEspacio", ({id}) => {
        coordenadas[id].push([]);
    })

    socket.on("enviarCoordenada", ({id, coordenada}) => {
        coordenadas[id][coordenadas[id].length - 1].push(coordenada);
        // Enviar las coordenadas actualizadas
        io.emit("obtenerCoordenadas", coordenadas);
    })

    socket.on("borrarCanvas", () => {
        let keys = Object.keys(coordenadas);
        
        // Limpiar todas las coordenadas
        keys.forEach(key => {
            coordenadas[key] = [];
        })

        // Enviar las coordenadas actualizadas
        io.emit("obtenerCoordenadas", coordenadas);
    })
})