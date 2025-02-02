"use strict";

import Fastify from "fastify";
import {find_best_route} from "./main.js";

const app = Fastify({
  logger: true,
})
await app.register(cors, {
  origin: (origin, cb) => {
    const hostname = new URL(origin).hostname
    if(hostname === "*"){
      cb(null, true)
      return
    }
    cb(new Error("Not allowed"), false)
  }
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







