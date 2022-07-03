export interface DatosGenerales {
  correo: String;
  telefono: String;
  libraAerea: Number;
  libraMaritima: Number;
  horario: String;
  ubicacion: String;

  direccionMaritima: {
    prefijo: String;
    sufijo: String;
    direccion: String;
    telefono: String;
    ciudad: String;
    estado: String;
    codigoPostal: String;
  };
  direccionAerea: {
    prefijo: String;
    sufijo: String;
    direccion: String;
    telefono: String;
    ciudad: String;
    estado: String;
    codigoPostal: String;
  };
}
