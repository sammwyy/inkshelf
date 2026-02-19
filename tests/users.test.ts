import { describe, expect, it, beforeEach } from 'bun:test';

import app from '../src/app';
import { createTestUser, generateRandomUser } from './test-utils';

const request = require("supertest");

describe('Users Module', () => {
    let adminToken: string;
    let userToken: string;
    let userId: string;

    beforeEach(async () => {
        const admin = await createTestUser(true);
        adminToken = admin.token;

        const user = await createTestUser(false);
        userToken = user.token;
        userId = user.user.id;
    });

    it('should list users (admin)', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some((u: any) => u.id === userId)).toBe(true);
    });

    it('should get user details', async () => {
        const res = await request(app)
            .get(`/api/v1/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(userId);
    });

    it('should edit user (admin)', async () => {
        const newUsername = generateRandomUser().username;
        const res = await request(app)
            .patch(`/api/v1/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username: newUsername });

        expect(res.status).toBe(200);
        expect(res.body.data.profile.username).toBe(newUsername);
    });

    it('should fail to edit user (non-admin)', async () => {
        const newUsername = generateRandomUser().username;
        const res = await request(app)
            .patch(`/api/v1/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ username: newUsername });

        // Depending on implementation, users might be allowed to edit themselves via /users/:id 
        // OR restricted to /me. 
        // If /users/:id is admin-protected for writes:
        expect(res.status).toBe(403);
    });
});
