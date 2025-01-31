"use strict";

import * as dotenv from "dotenv";
dotenv.config();


import Fastify from "fastify";


const app = Fastify({
  logger: true,
})

app.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

app.post('/route', async (request, reply) => {
    const { source, destination , type_day } = request.body;
    const res = await find_best_route(source , destination , type_day);
    return { message: res };
});


export default async (req, res) => {
    await app.ready();
    app.server.emit('request', req, res);
}

import Fastify from 'fastify'






