// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { Response, Request, response } from "express";
import { CallbackError } from "mongoose";
const mongoose = require("mongoose");
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import * as google from "googleapis";
import path, { dirname } from "path";

const moment = require("moment-timezone");
moment.locale("es");
import { customAlphabet } from "nanoid";
import Server from "./server";

// modelo
import Usuario from "../models/usuario";
import ProductosPedidos from "../models/productosPedido";

// interface
import { UsuarioInterface } from "../interface/usuario";
import { ProductosPedidosInterface } from "../interface/productosPedidos";

import { environment } from "../environment/environment";

import mjml2html from "mjml";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class ProductoPedidoClass {
  idRef: any;
  constructor() {
    this.idRef = customAlphabet("0123456789", 6);
  }

  nuevoProductoPedido(req: Request, resp: Response): void {
    const idReferencia = this.idRef();
    const nombre = req.body.nombre;
    const precio = Number(req.body.precio);
    const descripcion = req.body.descripcion;
    const fechaRegistro = moment.tz("America/Bogota").format("YYYY-MM-DD");
    const cliente = new mongoose.Types.ObjectId(req.body.cliente);
    const tipo = req.body.tipo;
    const delivery = Number(req.body.delivery);

    const nuevoProducto = new ProductosPedidos({
      idReferencia,
      nombre,
      precio,
      descripcion,
      fechaRegistro,
      cliente,
      tipo,
      delivery,
    });

    nuevoProducto.save(
      (err: CallbackError, productoPedidoDB: ProductosPedidosInterface) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al crear producto pedido",
            resp,
            err
          );
        } else {
          const server = Server.instance;
          server.io.emit("cargar-pedidos", {});
          server.io.emit("obtener-ventas", {});
          this.respuestaJson(
            true,
            "Producto pedido creado",
            resp,
            null,
            productoPedidoDB,
            undefined
          );
        }
      }
    );
  }

  //   editar/inhabilitar
  editarProductoPedido(req: Request, resp: Response): void {
    const idPPedido = new mongoose.Types.ObjectId(req.body.idPPedido);

    ProductosPedidos.findById(
      idPPedido,
      (err: CallbackError, productoPedidoDB: ProductosPedidosInterface) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al editar Producto Pedido",
            resp,
            err
          );
        } else {
          const query = {
            nombre: req.body.nombre,
            precio: Number(req.body.precio),
            descripcion: req.body.descripcion,
            cliente: new mongoose.Types.ObjectId(req.body.cliente),
            tipo: req.body.tipo,
            delivery: Number(req.body.delivery),
            estado: req.body.estado,
          };

          if (!query.nombre) {
            query.nombre = productoPedidoDB.nombre;
          }

          if (!query.precio) {
            query.precio = productoPedidoDB.precio;
          }

          if (!query.descripcion) {
            query.descripcion = productoPedidoDB.descripcion;
          }

          if (!query.cliente) {
            query.cliente = productoPedidoDB.cliente;
          }

          if (!query.tipo) {
            query.tipo = productoPedidoDB.tipo;
          }

          if (!query.delivery) {
            query.delivery = productoPedidoDB.delivery;
          }

          if (
            query.estado === "null" ||
            query.estado === undefined ||
            query.estado === null
          ) {
            query.estado = productoPedidoDB.estado;
          }

          ProductosPedidos.findByIdAndUpdate(
            idPPedido,
            query,
            { new: true },
            (err: any, productoPedidoDB: any) => {
              if (err) {
                return this.respuestaJson(
                  false,
                  "Error al editar producto pedido",
                  resp,
                  err
                );
              } else {
                return this.respuestaJson(
                  true,
                  "Producto pedido actualizaado",
                  resp,
                  null,
                  productoPedidoDB
                );
              }
            }
          );
        }
      }
    );
  }

  verProductoPedido(req: Request, resp: Response): void {
    const idPPedido = new mongoose.Types.ObjectId(req.get("idPPedido"));

    ProductosPedidos.findById(idPPedido)
      .populate("cliente")
      .exec((err: any, productoPedidoDB: any) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al buscar producto pedido",
            resp,
            err
          );
        } else {
          return this.respuestaJson(
            true,
            "Producto pedido encontrado",
            resp,
            null,
            productoPedidoDB
          );
        }
      });
  }

  verProductosPedidos(req: Request, resp: Response): void {
    const idSocket: string = req.get("idSocket")!;
    ProductosPedidos.find({})
      .limit(10)
      .populate("cliente")
      .exec((err: any, productosPedidosDB: any) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al buscar productos pedidos",
            resp,
            err
          );
        } else {
          const server = Server.instance;
          server.io.to(idSocket).emit("obtener-pedidos", {
            ok: true,
            mensaje: "Productos pedidos encontrados",
            datas: productosPedidosDB,
          });

          return this.respuestaJson(
            true,
            "Productos pedidos encontrados",
            resp,
            null,
            undefined,
            productosPedidosDB
          );
        }
      });
  }

  async obtenerProductosPedidosAdmin(
    req: Request,
    resp: Response
  ): Promise<any> {
    const productosPedidosDB = await ProductosPedidos.aggregate([
      {
        $lookup: {
          from: "usuarios",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
        },
      },
      {
        $limit: 10,
      },
    ]);

    if (!productosPedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al buscar productos pedidos",
        err: "Error al buscar productos pedidos",
      });
    } else {
      return resp.json({
        ok: true,
        mensaje: "Productos pedidos encontrados",
        datas: productosPedidosDB,
      });
    }
  }

  async obtenerProductosPedidosCliente(
    req: Request,
    resp: Response
  ): Promise<any> {
    const idCliente = new mongoose.Types.ObjectId(req.get("idCliente"));
    const productosPedidosDB = await ProductosPedidos.aggregate([
      {
        $lookup: {
          from: "usuarios",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
        },
      },
      {
        $match: {
          "cliente._id": idCliente,
        },
      },
      {
        $limit: 10,
      },
    ]);

    if (!productosPedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al buscar productos pedidos",
        err: "Error al buscar productos pedidos",
      });
    } else {
      return resp.json({
        ok: true,
        mensaje: "Productos pedidos encontrados",
        datas: productosPedidosDB,
      });
    }

    return;
    ProductosPedidos.find({})
      .populate("cliente")
      .exec((err: any, productosPedidosDB: any) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al buscar productos pedidos",
            resp,
            err
          );
        } else {
          const server = Server.instance;
          server.io.emit("obtener-pedidos", {
            ok: true,
            mensaje: "Productos pedidos encontrados",
            datas: productosPedidosDB,
          });

          return this.respuestaJson(
            true,
            "Productos pedidos encontrados",
            resp,
            null,
            undefined,
            productosPedidosDB
          );
        }
      });
  }

  async paginacionPedidos(req: Request, resp: Response): Promise<any> {
    const desde = Number(req.get("desde"));
    const hasta = Number(req.get("hasta"));
    const idSocket = req.get("idSocket") || "";
    const idUsuario = req.get("idUsuario") || "";
    const role = req.get("role") || "cliente";
    const match: any = {};

    if (role === "cliente") {
      Object.assign(match, {
        $match: { "cliente._id": new mongoose.Types.ObjectId(idUsuario) },
      });
    }

    if (role === "admin") {
      Object.assign(match, { $match: {} });
    }

    const productosPedidosDB = await ProductosPedidos.aggregate([
      {
        $lookup: {
          from: "usuarios",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
        },
      },
      match,
      {
        $skip: desde,
      },
      {
        $limit: hasta,
      },
    ]);

    if (!productosPedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al buscar productos pedidos",
        err: "Error al buscar productos pedidos",
      });
    } else {
      const server = Server.instance;
      server.io.to(idSocket).emit("obtener-pedidos-paginacion", {
        ok: true,
        mensaje: "Productos pedidos encontrados",
        datas: productosPedidosDB,
      });
      return resp.json({
        ok: true,
        mensaje: "Productos pedidos encontrados",
        datas: productosPedidosDB,
      });
    }

    // ProductosPedidos.find({})
    //   .skip(desde)
    //   .limit(hasta)
    //   .populate("cliente")
    //   .exec((err: any, productosPedidosDB: any) => {
    //     if (err) {
    //       return this.respuestaJson(
    //         false,
    //         "Error al buscar productos pedidos",
    //         resp,
    //         err
    //       );
    //     } else {
    //       if (idSocket) {
    //         const server = Server.instance;
    //         server.io.to(idSocket).emit("obtener-pedidos-paginacion", {
    //           ok: true,
    //           mensaje: "Productos pedidos encontrados",
    //           datas: productosPedidosDB,
    //         });
    //       }
    //       return this.respuestaJson(
    //         true,
    //         "Productos pedidos encontrados",
    //         resp,
    //         null,
    //         undefined,
    //         productosPedidosDB
    //       );
    //     }
    //   });
  }

  productosPedidosPorUser(req: Request, resp: Response): void {
    const cliente = new mongoose.Types.ObjectId(req.get("cliente"));

    // console.log(cliente)

    ProductosPedidos.find({ cliente })
      .populate("cliente")
      .exec(
        (
          err: CallbackError,
          productosPedidosDB: Array<ProductosPedidosInterface>
        ) => {
          if (err) {
            return this.respuestaJson(
              false,
              "Error al buscar Productos Pedidos",
              resp,
              err,
              undefined,
              productosPedidosDB
            );
          } else {
            const server = Server.instance;
            server.io.emit("historial-compras", {
              ok: true,
              mensaje: "P. Pedidos encontrados",
              datas: productosPedidosDB,
            });
            return this.respuestaJson(
              true,
              "P. Pedidos encontrados",
              resp,
              null,
              undefined,
              productosPedidosDB
            );
          }
        }
      );
  }

  busquedaCriterioAdmin(req: Request, resp: Response): void {
    const idSocket: string = req.get("idSocket")!;
    const criterio = new RegExp(req.get("criterio") || "", "i");

    ProductosPedidos.find({
      idReferencia: criterio,
    })
      .populate("cliente")
      .exec((err: any, productosPedidosDB: any) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al buscar Productos Pedidos",
            resp,
            err,
            undefined,
            productosPedidosDB
          );
        } else {
          const server = Server.instance;
          server.io.to(idSocket).emit("obtener-pedidos-criterio", {
            ok: true,
            mensaje: "Productos pedidos encontrados",
            datas: productosPedidosDB,
          });
          return this.respuestaJson(
            true,
            "P. Pedidos encontrados",
            resp,
            null,
            undefined,
            productosPedidosDB
          );
        }
      });
  }

  busquedaCriterioCliente(req: Request, resp: Response): void {
    const idSocket: string = req.get("idSocket")!;
    const criterio = new RegExp(req.get("criterio") || "", "i");
    const cliente = new mongoose.Types.ObjectId(req.get("cliente"));

    ProductosPedidos.find({ $and: [{ idReferencia: criterio }, { cliente }] })
      .populate("cliente")
      .exec((err: any, productosPedidosDB: any) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al buscar Productos Pedidos",
            resp,
            err,
            undefined,
            productosPedidosDB
          );
        } else {
          const server = Server.instance;
          server.io.to(idSocket).emit("obtener-pedidos-criterio", {
            ok: true,
            mensaje: "Productos pedidos encontrados",
            datas: productosPedidosDB,
          });
          return this.respuestaJson(
            true,
            "P. Pedidos encontrados",
            resp,
            null,
            undefined,
            productosPedidosDB
          );
        }
      });
  }

  eliminarPPedido(req: Request, resp: Response): void {
    const id = new mongoose.Types.ObjectId(req.get("idPPedido"));
    ProductosPedidos.findByIdAndDelete(id, (err: any, pPedidoDB: any) => {
      if (err) {
        return this.respuestaJson(
          false,
          "Error al eliminar el producto pedido",
          resp,
          err
        );
      } else {
        return this.respuestaJson(
          true,
          "Producto pedido eliminado",
          resp,
          null,
          pPedidoDB,
          undefined
        );
      }
    });
  }

  obtenerPedidosAnioActual(req: Request, resp: Response): void {
    const anioActual = moment().year();

    const fechaIniCast = `01-01-${anioActual}`;
    const fechaFinalCast = `31-12-${anioActual}`;

    const fecha = moment(`${fechaIniCast}`, "YYYY-MM-DD").format("YYYY-MM-DD");
    const fechaFinal = moment(`${fechaFinalCast}`, "YYYY-MM-DD").format(
      "YYYY-MM-DD"
    );

    ProductosPedidos.find(
      {
        $and: [
          { fechaRegistro: { $gte: fecha } },
          { fechaRegistro: { $lte: fechaFinal } },
          { tipo: "Entregado" },
        ],
      },
      (err: any, productosPedidosDB: any) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al buscar productos pedidos",
            resp,
            err
          );
        } else {
          return this.respuestaJson(
            true,
            "Productos pedidos encontrados",
            resp,
            null,
            undefined,
            productosPedidosDB
          );
        }
      }
    );
  }

  obtenerPedidosFecha(req: Request, resp: Response): void {
    const fechaDesde = moment
      .tz(req.get("fechaDesde"), "America/Bogota")
      .format("YYYY-MM-DD");
    const fechaHasta = moment
      .tz(req.get("fechaHasta"), "America/Bogota")
      .format("YYYY-MM-DD");

    ProductosPedidos.find({
      $and: [
        { fechaRegistro: { $gte: fechaDesde, $lte: fechaHasta } },
        { tipo: "Entregado" },
      ],
    })
      .populate("cliente")
      .exec((err: any, productosPedidosDB: any) => {
        if (err) {
          return this.respuestaJson(
            false,
            "Error al buscar Productos Pedidos",
            resp,
            err,
            undefined,
            productosPedidosDB
          );
        } else {
          return this.respuestaJson(
            true,
            "P. Pedidos encontrados",
            resp,
            null,
            undefined,
            productosPedidosDB
          );
        }
      });
  }

  // GESTION CORREOS

  correoConfirmacionFactura(req: Request, resp: Response): void {
    const dataFactura: DataFactura = {
      idFactura: req.body.idFactura,
      fecha: req.body.fecha,
      nombreCliente: req.body.nombreCliente,
      correoCliente: req.body.correoCliente,
      telCliente: req.body.telCliente,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      delivery: req.body.delivery,
      total: req.body.total,
    };

    const CLIENTID: string =
      "521016425534-hqfptiq60j1egd3n97194r14m6fu4au0.apps.googleusercontent.com";
    const CLIENTSECRET: string = "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";
    const REDIRECTURI: string = "https://developers.google.com/oauthplayground";
    const REFRESHTOKEN: string =
      "1//04MAGNKFnJ-_WCgYIARAAGAQSNwF-L9IriHfR0tn0vIGh9z42Dn5Rl-dt6tIzZ7o_tnATz2dWH_n0cq_2sGCM-DGF3luLxNPgH9c";

    const oAuth2Client = new google.Auth.OAuth2Client({
      clientId: CLIENTID,
      clientSecret: CLIENTSECRET,
      redirectUri: REDIRECTURI,
    });

    oAuth2Client.setCredentials({ refresh_token: REFRESHTOKEN });

    const sendMail = async () => {
      try {
        const accessToken: any = await oAuth2Client.getAccessToken();

        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          auth: {
            type: "OAuth2",
            user: "roserodevmail@gmail.com",
            clientId: CLIENTID,
            clientSecret: CLIENTSECRET,
            refreshToken: REFRESHTOKEN,
            accessToken: accessToken,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const mailOptions: SMTPTransport.Options = {
          from: "JJBOXPTY <jjbox507@gmail.com>",
          to: `${dataFactura.correoCliente}`,
          // to: `jomaromu2@gmail.com`,
          subject: "Confirmación factura",
          html: this.templateFactura(dataFactura),
        };

        return await transporter.sendMail(mailOptions);
      } catch (err) {
        return err;
      }
    };

    sendMail()
      .then((resp) => console.log(resp))
      .catch((err) => console.log(err));
  }

  async correoConfirmacionNuevoPedido(cliente: any): Promise<any> {
    const usuario = await Usuario.findById(cliente);

    const CLIENTID: string =
      "521016425534-hqfptiq60j1egd3n97194r14m6fu4au0.apps.googleusercontent.com";
    const CLIENTSECRET: string = "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";
    const REDIRECTURI: string = "https://developers.google.com/oauthplayground";
    const REFRESHTOKEN: string =
      "1//04MAGNKFnJ-_WCgYIARAAGAQSNwF-L9IriHfR0tn0vIGh9z42Dn5Rl-dt6tIzZ7o_tnATz2dWH_n0cq_2sGCM-DGF3luLxNPgH9c";

    const oAuth2Client = new google.Auth.OAuth2Client({
      clientId: CLIENTID,
      clientSecret: CLIENTSECRET,
      redirectUri: REDIRECTURI,
    });

    oAuth2Client.setCredentials({ refresh_token: REFRESHTOKEN });

    const sendMail = async () => {
      try {
        const accessToken: any = await oAuth2Client.getAccessToken();

        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          auth: {
            type: "OAuth2",
            user: "roserodevmail@gmail.com",
            clientId: CLIENTID,
            clientSecret: CLIENTSECRET,
            refreshToken: REFRESHTOKEN,
            accessToken: accessToken,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const mailOptions: SMTPTransport.Options = {
          from: "JJBOXPTY <jjbox507@gmail.com>",
          to: `${usuario!.correo}`,
          // to: `jomaromu2@gmail.com`,
          subject: "Nuevo paquete ha llegado",
          html: this.templateNuevoPedido(),
        };

        return await transporter.sendMail(mailOptions);
      } catch (err) {
        return err;
      }
    };

    sendMail()
      .then((resp) => console.log(resp))
      .catch((err) => console.log(err));
  }

  templateFactura(dataFactura: DataFactura): string {
    // console.log(dataFactura)
    const htmlOutput = mjml2html(
      `
      <mjml>

  <mj-body background-color="#c4f3fc">
    <mj-section padding-top="50px" background-color="white">
      <mj-column>        
        <mj-text align="left">
          <h1>
            FACTURA #${dataFactura.idFactura}
          </h1>
          <h2>
            Fecha ${dataFactura.fecha}
          </h2>
          <h3>
           JJBOXTPY
          </h3>
          <h3>
           Pueblo Nuevo calle 16, detrás de antigua Estrella Azul. (En la entrada de la calle).
          </h3>
          <h3>
           Cel.: 6425-2114
          </h3>
        </mj-text>
      </mj-column>
      
      <mj-column>
      <mj-image width="80px" src="http://190.218.43.46:4002/productosPedidos/envioLogo" alt="Logo" padding="50px" />
      </mj-column>
    </mj-section>
    
    <mj-section background-color="white">
      <mj-column>
        <mj-text>
          <h2>
            Cliente: 
          </h2>
        </mj-text>
      </mj-column>
      <mj-column>
        <mj-text>
          <h3>
            ${dataFactura.nombreCliente}
          </h3>
          <h3>
            ${dataFactura.correoCliente} 
          </h3>
          <h3>
            +507-${dataFactura.telCliente} 
          </h3>
        </mj-text>
      </mj-column>
    </mj-section>
    
    <mj-section background-color="white">
      <mj-column>
        <mj-table>
          <tr style="border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;">
            <th style="padding: 0 15px 0 0;">Descripción</th>
            <th style="padding: 0 15px;">Precio</th>
            <th style="padding: 0 0 0 15px;">Delivery</th>
            <th style="padding: 0 0 0 15px;">Total</th>
          </tr>
          <tr>
            <td style="padding: 0 15px 0 0;">${dataFactura.descripcion}</td>
            <td style="padding: 0 15px;">${dataFactura.precio}</td>
            <td style="padding: 0 0 0 15px;">${dataFactura.delivery}</td>
            <td style="padding: 0 0 0 15px;">${dataFactura.total}</td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <mj-section background-color="white">
      <mj-column>
        <mj-text align="center">
          <h4>
            Gracias por elegir a JJBOXPTY para realizar sus compras por internet,
            recuerde seguirnos en nuesras plataformas sociales.
          </h4>
        </mj-text>
      </mj-column>
    </mj-section>
    
    <mj-section background-color="white">
      <mj-column>
        <mj-social font-size="15px" icon-size="30px" mode="horizontal">
          <mj-social-element name="facebook" href="https://www.facebook.com/jjboxpty/">
            Facebook
          </mj-social-element>
          <mj-social-element name="instagram" href="https://www.instagram.com/jjbox_pty/">
            Instagram
          </mj-social-element>
          <mj-social-element  name="twitter" href="https://twitter.com/">
            Twitter
          </mj-social-element>
        </mj-social>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`
    );

    return htmlOutput.html;
  }

  templateNuevoPedido(): string {
    const htmlOutput = mjml2html(
      `
      <mjml>
  <mj-head>
    <mj-attributes>
      <mj-all padding="0px"></mj-all>
      <mj-text font-family="Ubuntu, Helvetica, Arial, sans-serif" padding="0 25px" font-size="13px"></mj-text>
      <mj-section background-color="#ffffff"></mj-section>
      <mj-class name="preheader" color="#000000" font-size="11px"></mj-class>
    </mj-attributes>
    <mj-style inline="inline">a { text-decoration: none!important; color: inherit!important; }</mj-style>
  </mj-head>
  <mj-body background-color="#bedae6">
    <mj-section>
      <mj-column width="100%">
      <mj-image src="http://190.218.43.46:4002/productosPedidos/envioBanner" alt="Banner" padding="0px"></mj-image>
      </mj-column>
    </mj-section>
    <mj-section padding-bottom="20px" padding-top="10px">
      <mj-column>
        <mj-text align="center" padding="10px 25px" font-size="20px" color="#512d0b"><strong>Estimado cliente</strong></mj-text>
        
        <mj-text align="center" color="#489BDA" font-size="25px" font-family="Arial, sans-serif" font-weight="bold" line-height="35px" padding-top="20px">Un paquete suyo ha llegado.<br />
          <span style="font-size:18px">Puede ver su historial de compras haciendo clíc en el siguiente botón</span>
        </mj-text>
        
        
        <mj-button background-color="#8bb420" color="#FFFFFF" href="http://190.218.43.46" font-family="Arial, sans-serif" padding="20px 0 0 0" font-weight="bold" font-size="16px">Ir a mi cuenta</mj-button>
        
      </mj-column>
    </mj-section>
    
    
     <mj-section padding="20px" background-color="white">
      <mj-column>
        <mj-text align="center">
          <h4>
            Gracias por elegir a JJBOXPTY para realizar sus compras por internet,
            recuerde seguirnos en nuesras plataformas sociales.
          </h4>
        </mj-text>
      </mj-column>
    </mj-section>
    
    <mj-section padding="20px" background-color="white">
      <mj-column>
        <mj-social font-size="15px" icon-size="30px" mode="horizontal">
          <mj-social-element name="facebook" href="https://www.facebook.com/jjboxpty/">
            Facebook
          </mj-social-element>
          <mj-social-element name="instagram" href="https://www.instagram.com/jjbox_pty/">
            Instagram
          </mj-social-element>
          <mj-social-element  name="twitter" href="https://twitter.com/">
            Twitter
          </mj-social-element>
        </mj-social>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`
    );

    return htmlOutput.html;
  }

  envioLogo(req: Request, resp: Response): void {
    return resp.sendFile(path.resolve(__dirname, "../../assets/logo.png"));
  }

  envioBanner(req: Request, resp: Response): void {
    return resp.sendFile(
      path.resolve(__dirname, "../../assets/img-contacto.png")
    );
  }

  respuestaJson(
    ok: boolean,
    mensaje: string,
    resp: Response,
    err?: CallbackError,
    productoPedidoDB?: ProductosPedidosInterface,
    productosPedidosDB?: Array<ProductosPedidosInterface>
  ): any {
    switch (ok) {
      case false:
        return resp.json({
          ok,
          mensaje,
          err,
        });
        break;
      case true:
        return resp.json({
          ok,
          mensaje,
          data: productoPedidoDB,
          datas: productosPedidosDB,
        });
        break;
    }
  }
}

interface DataFactura {
  idFactura: string;
  fecha: string;
  nombreCliente: string;
  correoCliente: string;
  telCliente: string;
  descripcion: string;
  precio: number;
  delivery: number;
  total: number;
}
