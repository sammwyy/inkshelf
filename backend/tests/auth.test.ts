import { describe, expect, it, beforeAll, afterAll } from 'bun:test';

import app from '../src/app';
import { teardown } from './database';

const request = require("supertest");

import { generateRandomUser } from './test-utils';

describe('Auth - Change Password', () => {
    let token: string;
    const userData = generateRandomUser();
    const newPassword = 'NewPassword123';

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/v1/auth/signup')
            .send({
                username: userData.username,
                email: userData.email,
                password: userData.password
            });

        expect(res.status).toBe(201);
        token = res.body.data.accessToken;
    });

    afterAll(async () => {
        await teardown();
    });

    it('should change password successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/password/change')
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: userData.password,
                newPassword: newPassword
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should fail login with old password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        expect(res.status).toBe(401);
    });

    it('should login with new password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: userData.email,
                password: newPassword
            });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
    });
});
