import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import Server from "./class/server";

// rutas
import productosPedidos from "./routes/productosPedidos";

// const server = new Server();
const server = Server.instance;

// body parser
server.app.use(bodyParser.urlencoded({ extended: true }));
server.app.use(bodyParser.json());

// file upload
server.app.use(fileUpload());

// cors
server.app.use(cors({ origin: true, credentials: true }));

// modelos requeridos
require("./models/usuario");

// modelos importados

// conexion local
mongoose.connect(
  "mongodb://127.0.0.1:27017/jjboxpty",
  { autoIndex: false },
  (err) => {
    if (err) throw err;
    console.log("Base de datos Online");
  }
);

// usar las rutas
server.app.use("/productosPedidos", productosPedidos);

// correr servidor
server.start(() => {
  console.log(`Servidor corriendo en el puerto: ${server.port}`);
});
