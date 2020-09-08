//responsavel por iniciar todos os setups para todos os testes funcionais
import { SetupServer } from '@src/server';
import supertest from 'supertest';

let server: SetupServer;
beforeAll(async () => {
  server = new SetupServer();
  await server.init();
  global.testRequest = supertest(server.getApp());
});

afterAll(async() => await server.close());