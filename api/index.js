"use strict";

import Fastify from "fastify";
import {findBestRoute} from "./utils/main.js";

const app = Fastify({
  logger: true,
})


app.post('/route', async (request) => {
    const { source, destination , type_day , time } = request.body;
    const res = await findBestRoute(source , destination , type_day , time);
    return { message: res };
});


export default async (req, res) => {
    await app.ready();
    app.server.emit('request', req, res);
}







