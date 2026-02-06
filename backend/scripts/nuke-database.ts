import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

async function main() {
    console.log('\n⚠️  WARNING: THIS WILL DELETE ALL DATA IN THE DATABASE ⚠️');
    console.log('This action cannot be undone and will wipe all tables (users, series, chapters, etc).');
    console.log('Only "_prisma_migrations" will be preserved.\n');

    const answer = await askQuestion('Type "Erase all data" to confirm: ');

    if (answer !== 'Erase all data') {
        console.log('\n❌ Confirmation failed. Aborting.');
        process.exit(0);
    }

    console.log('\n🗑️  Nuking database...');

    try {
        const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
            SELECT tablename FROM pg_tables WHERE schemaname='public'
        `;

        const tables = tablenames
            .map(({ tablename }) => tablename)
            .filter((name) => name !== '_prisma_migrations')
            .map((name) => `"public"."${name}"`)
            .join(', ');

        if (tables.length > 0) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
        }

        console.log('✅ Database nuked successfully.');
    } catch (error) {
        console.error('❌ Error nuking database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main();
