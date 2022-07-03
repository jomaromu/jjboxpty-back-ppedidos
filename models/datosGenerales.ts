import mongoose from "mongoose";

// interface
import { DatosGenerales } from "../interface/datosGenerales";

// Crear esquema
const Schema = mongoose.Schema;

const datosgenerales = new Schema({
  correo: { type: String },
  telefono: { type: String },
  libraAerea: { type: Number },
  libraMaritima: { type: Number },
  horario: { type: String },
  ubicacion: { type: String },
  direccionMaritima: {
    prefijo: { type: String },
    sufijo: { type: String },
    direccion: { type: String },
    telefono: { type: String },
    ciudad: { type: String },
    estado: { type: String },
    codigoPostal: { type: String },
  },
  direccionAerea: {
    prefijo: { type: String },
    sufijo: { type: String },
    direccion: { type: String },
    telefono: { type: String },
    ciudad: { type: String },
    estado: { type: String },
    codigoPostal: { type: String },
  },
});

export = mongoose.model<DatosGenerales>("datosgenerales", datosgenerales);
