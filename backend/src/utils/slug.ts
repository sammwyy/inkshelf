import slugify from 'slugify';

export function generateSlug(text: string, addTimestamp = true): string {
    const baseSlug = slugify(text, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
    });

    if (addTimestamp) {
        const timestamp = Date.now().toString(36);
        return `${baseSlug}-${timestamp}`;
    }

    return baseSlug;
}

export function sanitizeSlug(slug: string): string {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}