"use strict";

import Fastify from "fastify";
import {find_best_route} from "./utils/main.js";

const app = Fastify({
  logger: true,
})

app.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

app.post('/route', async (request, reply) => {
    const { source, destination , type_day , time } = request.body;
    const res = await find_best_route(source , destination , type_day , time);
    return { message: res };
});


export default async (req, res) => {
    await app.ready();
    app.server.emit('request', req, res);
}







