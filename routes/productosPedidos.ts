import { Router, Request, Response } from "express";

// Instanciar el router
const productosPedidos = Router();

import { ProductoPedidoClass } from "../class/productoPedidoClass";

// ==================================================================== //
// Prueba de ruta Productos Pedidos
// ==================================================================== //
productosPedidos.get("/", (req: Request, resp: Response) => {
  resp.json({
    ok: true,
    mensaje: "Ruta de productosPedidos Ok",
  });
});

// ==================================================================== //
// Nuevo Productos Pedidos
// ==================================================================== //
productosPedidos.post(
  "/nuevoProductoPedido",
  (req: Request, resp: Response) => {
    const nuevoProductoPedido = new ProductoPedidoClass();
    nuevoProductoPedido.nuevoProductoPedido(req, resp);
  }
);

// ==================================================================== //
// Editar Productos Pedidos
// ==================================================================== //
productosPedidos.put(
  "/editarProductoPedido",
  (req: Request, resp: Response) => {
    const editarProductoPedido = new ProductoPedidoClass();
    editarProductoPedido.editarProductoPedido(req, resp);
  }
);

// ==================================================================== //
// Ver Producto Pedido
// ==================================================================== //
productosPedidos.get("/verProductoPedido", (req: Request, resp: Response) => {
  const verProductoPedido = new ProductoPedidoClass();
  verProductoPedido.verProductoPedido(req, resp);
});

// ==================================================================== //
// Ver Productos Pedidos
// ==================================================================== //
productosPedidos.get("/verProductosPedidos", (req: Request, resp: Response) => {
  const verProductosPedidos = new ProductoPedidoClass();
  verProductosPedidos.verProductosPedidos(req, resp);
});

// ==================================================================== //
// Ver Productos Pedidos
// ==================================================================== //
productosPedidos.get(
  "/productosPedidosPorUser",
  (req: Request, resp: Response) => {
    const productosPedidosPorUser = new ProductoPedidoClass();
    productosPedidosPorUser.productosPedidosPorUser(req, resp);
  }
);

// ==================================================================== //
// Paginacion Productos Pedidos
// ==================================================================== //
productosPedidos.get("/paginacionPedidos", (req: Request, resp: Response) => {
  const paginacionPedidos = new ProductoPedidoClass();
  paginacionPedidos.paginacionPedidos(req, resp);
});

// ==================================================================== //
// Obtener Productos Pedidos admin
// ==================================================================== //
productosPedidos.get(
  "/obtenerProductosPedidosAdmin",
  (req: Request, resp: Response) => {
    const obtenerProductosPedidosAdmin = new ProductoPedidoClass();
    obtenerProductosPedidosAdmin.obtenerProductosPedidosAdmin(req, resp);
  }
);

// ==================================================================== //
// Obtener Productos Pedidos cliente
// ==================================================================== //
productosPedidos.get(
  "/obtenerProductosPedidosCliente",
  (req: Request, resp: Response) => {
    const obtenerProductosPedidosCliente = new ProductoPedidoClass();
    obtenerProductosPedidosCliente.obtenerProductosPedidosCliente(req, resp);
  }
);

// ==================================================================== //
// Eliminar Pedido
// ==================================================================== //
productosPedidos.delete("/eliminarPPedido", (req: Request, resp: Response) => {
  const eliminarPPedido = new ProductoPedidoClass();
  eliminarPPedido.eliminarPPedido(req, resp);
});

// ==================================================================== //
// Envio de factura
// ==================================================================== //
productosPedidos.post(
  "/correoConfirmacionFactura",
  (req: Request, resp: Response) => {
    const correoConfirmacionFactura = new ProductoPedidoClass();
    correoConfirmacionFactura.correoConfirmacionFactura(req, resp);
  }
);

// ==================================================================== //
// Busqueda por criterio
// ==================================================================== //
productosPedidos.get(
  "/busquedaCriterioAdmin",
  (req: Request, resp: Response) => {
    const busquedaCriterioAdmin = new ProductoPedidoClass();
    busquedaCriterioAdmin.busquedaCriterioAdmin(req, resp);
  }
);

// ==================================================================== //
// Busqueda por criterio
// ==================================================================== //
productosPedidos.get(
  "/busquedaCriterioCliente",
  (req: Request, resp: Response) => {
    const busquedaCriterioCliente = new ProductoPedidoClass();
    busquedaCriterioCliente.busquedaCriterioCliente(req, resp);
  }
);

// ==================================================================== //
// Envio de data
// ==================================================================== //
productosPedidos.get(
  "/envioLogo",
  (req: Request, resp: Response) => {
    const envioLogo = new ProductoPedidoClass();
    envioLogo.envioLogo(req, resp);
  }
);

// ==================================================================== //
// Envio de data
// ==================================================================== //
productosPedidos.get(
  "/envioBanner",
  (req: Request, resp: Response) => {
    const envioBanner = new ProductoPedidoClass();
    envioBanner.envioBanner(req, resp);
  }
);

export default productosPedidos;
