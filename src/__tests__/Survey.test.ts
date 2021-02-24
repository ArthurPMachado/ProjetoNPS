/* eslint-disable no-undef */
import request from 'supertest';
import server from '../app';

import createConnection from '../database';

describe('Surveys', () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  it('Should be able to create a new survey', async () => {
    const response = await request(server).post('/surveys').send({
      title: 'Title Example',
      description: 'Description Example',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('Should be able to get all surveys', async () => {
    await request(server).post('/surveys').send({
      title: 'Title Example2',
      description: 'Description Example2',
    });

    const response = await request(server).get('/surveys');

    expect(response.body.length).toBe(2);
  });
});
