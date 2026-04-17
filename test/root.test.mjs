import { spawn } from 'node:child_process';
import request from 'supertest';

const BASE_URL = 'http://localhost:3333';
let serverProcess;

beforeAll((done) => {
    serverProcess = spawn('node', ['index.mjs'], {
        cwd: new URL('..', import.meta.url).pathname
    });
    serverProcess.stdout.on('data', (data) => {
        if (data.toString().includes('Server start.')) done();
    });
});

afterAll(() => {
    serverProcess.kill();
});


describe('GET /', () => {
    describe('正常系', () => {
        it('200 と "Hello Node.js" が返る', async () => {
            const res = await request(BASE_URL).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toBe('Hello Node.js');
        });
    });
});
