import 'reflect-metadata';
import express from 'express';

import createConnection from './database';
import router from './routes';

createConnection();
const server = express();

server.use(express.json());
server.use(router);

export default server;
