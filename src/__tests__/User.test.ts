/* eslint-disable no-undef */
import request from 'supertest';
import server from '../app';

describe('Users', () => {
  request(server).post('/users')
    .send({
      email: 'user@example.com',
      name: 'User Example',
    });
});
