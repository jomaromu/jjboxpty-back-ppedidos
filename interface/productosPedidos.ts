import { UsuarioInterface } from "./usuario";

export interface ProductosPedidosInterface {
  _id: any;
  idReferencia: string;
  nombre: string;
  cliente: UsuarioInterface;
  pesoLibras: number;
  pesoVolumetrico: number;
  precio: number;
  delivery: number;
  itmbs: boolean;
  descripcion: string;
  fechaRegistro: string;
  fechaEntrega: string;
  tipo: string;
  estado: boolean;
}
