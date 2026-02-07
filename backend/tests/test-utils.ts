import { v4 as uuidv4 } from 'uuid';

import { prismaTest } from './database';
import app from '../src/app';

const request = require("supertest");

export const generateRandomUser = () => {
    const id = uuidv4().substring(0, 8);
    return {
        username: `user_${id}`,
        email: `user_${id}@example.com`,
        password: 'Password123'
    };
};

export const createTestUser = async (isAdmin = false) => {
    const userData = generateRandomUser();

    // Create user via signup
    const signupRes = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData);

    if (signupRes.status !== 201) {
        throw new Error(`Failed to create test user: ${JSON.stringify(signupRes.body)}`);
    }

    let token = signupRes.body.data.accessToken;
    const userId = signupRes.body.data.user.id;

    // If admin requested, update role in DB directly
    if (isAdmin) {
        await prismaTest.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' }
        });

        // Re-login to get updated token with admin role
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        token = loginRes.body.data.accessToken;
    }

    return {
        user: { ...userData, id: userId },
        token
    };
};
