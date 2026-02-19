import { describe, expect, it, beforeEach } from 'bun:test';

import app from '../src/app';
import { createTestUser } from './test-utils';

const request = require("supertest");

describe('Series & Chapters Module', () => {
    let adminToken: string;
    let userToken: string;
    let seriesSlug: string;

    beforeEach(async () => {
        const admin = await createTestUser(true);
        adminToken = admin.token;
        const user = await createTestUser(false);
        userToken = user.token;
    });

    // --- Series Tests ---
    it('should create a new series (admin)', async () => {
        const uniqueSlug = `test-series-${Date.now()}`;
        const res = await request(app)
            .post('/api/v1/series')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Test Series',
                description: 'A test description',
                author: 'Test Author',
                status: 'ONGOING',
                tags: ['Action', 'Fantasy'],
                slug: uniqueSlug
            });

        expect(res.status).toBe(201);
        expect(res.body.data.slug).toContain('test-series');
        seriesSlug = uniqueSlug; // Store for next tests if needed, but integration tests usually run isolated. 
        // Or if we run sequentially in same describe block without DB clear, we can reuse.
    });

    it('should list series (public)', async () => {
        // Enable anonymous access
        await request(app)
            .patch('/api/v1/settings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ key: 'app_allow_anonymous_view', value: true });

        const res = await request(app).get('/api/v1/series');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // --- Chapters Tests ---
    it('should create a chapter for a series (admin)', async () => {
        // Create series first
        const uniqueSlug = `chapter-series-${Date.now()}`;
        const seriesRes = await request(app)
            .post('/api/v1/series')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Chapter Series',
                description: 'Desc',
                author: 'Author',
                status: 'ONGOING',
                slug: uniqueSlug
            });

        const seriesId = seriesRes.body.data.id;

        const res = await request(app)
            .post(`/api/v1/chapters/series/${seriesId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                seriesId: seriesId,
                number: 1,
                title: 'Chapter 1',
                content: [], // or pages/files if upload
                language: 'EN'
            });

        expect(res.status).toBe(201);
        expect(res.body.data.number).toBe(1);
    });

    it('should list chapters of a series', async () => {
        // Create series first
        const uniqueSlug = `list-chapter-series-${Date.now()}`;
        const seriesRes = await request(app)
            .post('/api/v1/series')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'List Chapter Series',
                description: 'Desc',
                author: 'Author',
                status: 'ONGOING',
                slug: uniqueSlug
            });

        const seriesId = seriesRes.body.data.id;

        // Create chapter
        await request(app)
            .post(`/api/v1/chapters/series/${seriesId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                seriesId: seriesId,
                number: 1,
                language: 'EN'
            });

        const res = await request(app)
            .get(`/api/v1/chapters/series/${seriesId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].number).toBe(1);
    });
});
