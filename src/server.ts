import 'reflect-metadata';
import './database';

import express from 'express';

const server = express();

server.get('/', (request, response) => response.json({ message: 'Hello World' }));

server.post('/', (request, response) => response.json({ message: 'Os dados foram salvos com sucesso!' }));

server.listen(3030, () => console.log('Server is running'));
