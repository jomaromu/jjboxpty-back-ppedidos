export interface UsuarioInterface {
    _id: string;
    idReferencia: string;
    nombre: string;
    correo: string;
    password: string;
    avatar: string;
    telefono: number;
    direccion: {
      provincia: string;
      distrito: string;
      corregimiento: string;
      direccion: string;
    };
    fechaRegistro: string;
    role: roles;
    contSesion: number;
    estado: boolean;
  }
  
  type roles = "admin" | "cliente";
  