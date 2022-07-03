import mongoose from "mongoose";

// Crear esquema
const Schema = mongoose.Schema;

const publicidad = new Schema({
  estado: { type: Boolean, default: false },
});

export default mongoose.model("publicidad", publicidad);
