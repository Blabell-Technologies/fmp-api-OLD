"use strict";

// Node modules
const e = require("express");
const is_ip = require("is-ip");
const ipl = require("geoip-lite");

// Modulos internms
const pets = require("../../database/pets.model");
const { print } = require("../../lib/logger.class.lib");

/** @param {e.Request} req @param {e.Response} res */
module.exports = async (req, res) => {
  //#region Preprocesado de Querys
    //#region Preprocesado de Querys Obligatorios
      // Comprueba la existencia del query "origin"
      if (req.query.origin == undefined)
        return res.status(400).json({
          kind: "validation-error",
          field: "?origin",
          description: "Origin query is required",
        });

      // Se separa y trimea las coordenadas o IP
      let active_origin =
        req.query.origin.split(",").map((elem) => {
          return elem.trim();
        }) || null;

      // En caso de ser una ip ...
      if (is_ip(active_origin[0])) {
        // Se realiza un lookup de la misma
        const ip_lookup = ipl.lookup(active_origin[0]);
        // En caso de que el lookup obtenga un resultado, se recupera la lat, lon
        if (ip_lookup != null) active_origin = ip_lookup.ll;
        // En caso contrario, se guarda un valor nulo
        else active_origin = null;
      }

      // Se comprueban que los valores de las coordenadas sean correctos
      if (
        active_origin == null ||
        !/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/g.test(active_origin[0]) ||
        !/^-?([1]?[1-7][1-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{1}\d{1,6}/g.test(
          active_origin[1]
        )
      )
        return res.status(400).json({
          kind: "validation-error",
          field: "?origin",
          description: "Missing valid format for origin query (IP, [Lat,Lon])",
        });

      // Se reorganiza el array en lon, lat
      active_origin = [Number(active_origin[1]), Number(active_origin[0])];
    //#endregion
    //#region Preprocesado de Querys Opcionales
      const active_limit = req.query.limit || 10;
      const active_page = req.query.page || 1;
      const active_radius = (req.query.radius || 15) / 6371;
      const active_filter_found =
        req.query["filter-found"] == "true" ? true : false;
    //#endregion
  //#endregion

  // Preparaicón del query de consulta
  const paginate_query = {
    disappearance_place: {
      $geoWithin: { $centerSphere: [active_origin, active_radius] },
    },
    deleted: false,
    found: active_filter_found,
  };

  // Se intenta realizar la busqueda con la consulta preparada
  try {
    // Obtención de resultados de la base de datos en base al query y opciones
    var results = await pets.paginate(paginate_query, {
      limit: active_limit,
      page: active_page,
      // Filtrado de datos que se obtienen
      projection: {
        disappearance_place: { coordinates: 1, address: 1 },
        disappearance_date: 1,
        pet_name: 1,
        pet_animal: 1,
        pet_race: 1,
        owner_name: 1,
        owner_email: 1,
        details: 1,
        pictures: 1,
        reward: 1,
      },
    });
  } catch (err) {
    if (err.toString().includes("buffering timed out"))
      return res.status(500).json({
        kind: "database-error",
        type: "timed-out",
        description: "Connection has been rejected due timeout",
      });

    res.status(500).json({
      kind: "api-error",
      description: "Uncaught server exception",
    });
    return print.error(err);
  }

  // Por cada elemento dentro de los documentos encontrados...
  results.docs.map((doc) => {
    // Se invientren las coordenadas en (lat, lon)
    doc.disappearance_place.coordinates = [
      doc.disappearance_place.coordinates[1],
      doc.disappearance_place.coordinates[0],
    ];
    // Se procesan sus imagenes añadiendo la URL
    doc.pictures = doc.pictures.map((picture) => {
      return process.env.IMAGE_URL + picture;
    });
  });

  // Preparación del objeto de la pagina
  const page_info = {
    page_results: results.docs.length,
    total_results: results.totalDocs,
    total_pages: results.totalPages,
    next_page: results.nextPage || false,
  };

  // Despacha la información ya procesada
  res.json({ eps: "insider", results: results.docs, page_info });
};
