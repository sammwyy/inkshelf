import { describe, expect, it, beforeEach } from 'bun:test';

import app from '../src/app';
import { createTestUser } from './test-utils';

const request = require("supertest");

describe('Settings Module', () => {
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
        const admin = await createTestUser(true);
        adminToken = admin.token;

        const user = await createTestUser(false);
        userToken = user.token;
    });

    it('should get public settings (public)', async () => {
        const res = await request(app).get('/api/v1/settings');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // Public settings usually include app_title etc.
        expect(res.body.data).toHaveProperty('app_title');
    });

    it('should not expose private settings in public endpoint', async () => {
        const res = await request(app).get('/api/v1/settings');
        expect(res.status).toBe(200);
        // Assuming we have a private setting or we just check general behavior
        // Since we didn't seed a private setting, we rely on structure.
        // Let's create a private setting first.

        await request(app)
            .patch('/api/v1/settings/private')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ key: 'secret_key', value: 'secret_value' });

        const publicRes = await request(app).get('/api/v1/settings');
        expect(publicRes.body.data).not.toHaveProperty('secret_key');
    });

    it('should get private settings (admin)', async () => {
        // Create a private setting
        await request(app)
            .patch('/api/v1/settings/private')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ key: 'admin_only_key', value: 'secret' });

        const res = await request(app)
            .get('/api/v1/settings/private')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('admin_only_key');
        expect(res.body.data.admin_only_key).toBe('secret');
    });

    it('should fail to get private settings (non-admin)', async () => {
        const res = await request(app)
            .get('/api/v1/settings/private')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    it('should update private settings (admin)', async () => {
        const res = await request(app)
            .patch('/api/v1/settings/private')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ key: 'new_private_key', value: '12345' });

        expect(res.status).toBe(200);

        const check = await request(app)
            .get('/api/v1/settings/private')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(check.body.data.new_private_key).toBe('12345');
    });
});
