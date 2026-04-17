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


describe('GET /contacts', () => {
    describe('正常系', () => {
        it('200 と配列データが返る', async () => {
            const res = await request(BASE_URL).get('/contacts');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('異常系', () => {
        it('存在しないIDへのアクセスで404が返る', async () => {
            const res = await request(BASE_URL).get('/contacts/99999');
            expect(res.status).toBe(404);
        });
    });
});


