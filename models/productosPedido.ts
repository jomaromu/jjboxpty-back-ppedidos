import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const roles = {
  values: ["admin", "cliente"],
  message: "{VALUE}, no es un role permitido",
};

const tipoPedido = {
  values: ["Pendiente", "Entregado"],
  message: "{VALUE}, no es un tipo permitido",
};

// interface
import { ProductosPedidosInterface } from "../interface/productosPedidos";

// Crear esquema
const Schema = mongoose.Schema;

const productosPedidos = new Schema({
  idReferencia: { type: String, required: true },
  nombre: { type: String, required: true },
  cliente: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
  pesoLibras: { type: Number, default: 0 },
  pesoVolumetrico: { type: Number, default: 0 },
  precio: { type: Number, default: 0 },
  delivery: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  itmbs: { type: Boolean, default: false },
  descripcion: { type: String },
  fechaRegistro: { type: String },
  fechaEntrega: { type: String },
  tipo: { type: String, default: "Pendiente", enum: tipoPedido },
  estado: { type: Boolean, default: true },
});

// validacion para único elemento
productosPedidos.plugin(uniqueValidator, { message: "El {PATH}, ya existe!!" });

export = mongoose.model<ProductosPedidosInterface>(
  "productosPedidos",
  productosPedidos
);
