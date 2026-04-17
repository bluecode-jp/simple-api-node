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


describe('POST /contacts', () => {
    describe('正常系', () => {
        it('正常なデータで登録できる', async () => {
            const res = await request(BASE_URL)
                .post('/contacts')
                .send({ title: 'テスト', email: 'test@example.com', message: 'テストメッセージ' });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.title).toBe('テスト');
            expect(res.body.data.email).toBe('test@example.com');
        });
    });

    describe('異常系', () => {
        it('titleが空のとき400が返る', async () => {
            const res = await request(BASE_URL)
                .post('/contacts')
                .send({ title: '', email: 'test@example.com', message: 'テストメッセージ' });
            expect(res.status).toBe(400);
            expect(res.body.status).toBe('error');
        });

        it('titleが10文字超のとき400が返る', async () => {
            const res = await request(BASE_URL)
                .post('/contacts')
                .send({ title: '12345678901', email: 'test@example.com', message: 'テストメッセージ' });
            expect(res.status).toBe(400);
        });

        it('emailの形式が不正のとき400が返る', async () => {
            const res = await request(BASE_URL)
                .post('/contacts')
                .send({ title: 'テスト', email: 'invalid-email', message: 'テストメッセージ' });
            expect(res.status).toBe(400);
        });

        it('messageが空のとき400が返る', async () => {
            const res = await request(BASE_URL)
                .post('/contacts')
                .send({ title: 'テスト', email: 'test@example.com', message: '' });
            expect(res.status).toBe(400);
        });
    });
});
