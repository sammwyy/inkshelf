import { prisma } from '@/database';

// eslint-disable-next-line
const packageJson = require('../../../package.json');

export class AdminService {
    async getDashboardStats() {
        const [
            usersCount,
            seriesCount,
            volumesCount,
            chaptersCount,
        ] = await Promise.all([
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.series.count({ where: { deletedAt: null } }),
            prisma.volume.count({ where: { deletedAt: null } }),
            prisma.chapter.count({ where: { deletedAt: null } }),
        ]);

        return {
            counts: {
                users: usersCount,
                series: seriesCount,
                volumes: volumesCount,
                chapters: chaptersCount,
            },
            uptime: process.uptime(), // seconds
            startTime: new Date(Date.now() - (process.uptime() * 1000)),
            version: packageJson.version,
        };
    }
}


