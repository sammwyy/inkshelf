import { prisma } from '@/database';
import { NotFoundError, ForbiddenError } from '@/utils/errors';
import type { CreateCommentDto, UpdateCommentDto } from './comments.schema';

export class CommentsService {
    async createComment(profileId: string, chapterId: string, data: CreateCommentDto) {
        // Verify chapter exists
        const chapter = await prisma.chapter.findFirst({
            where: { id: chapterId, deletedAt: null },
        });

        if (!chapter) {
            throw new NotFoundError('Chapter not found');
        }

        // If replying to a comment, verify it exists
        if (data.parentId) {
            const parentComment = await prisma.comment.findFirst({
                where: { id: data.parentId, chapterId, deletedAt: null },
            });

            if (!parentComment) {
                throw new NotFoundError('Parent comment not found');
            }
        }

        const comment = await prisma.comment.create({
            data: {
                profileId,
                chapterId,
                content: data.content,
                parentId: data.parentId,
            },
            include: {
                profile: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        return comment;
    }

    async getChapterComments(chapterId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        // Get top-level comments only
        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where: {
                    chapterId,
                    parentId: null,
                    deletedAt: null,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    profile: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    replies: {
                        where: { deletedAt: null },
                        orderBy: { createdAt: 'asc' },
                        include: {
                            profile: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                        },
                    },
                },
            }),
            prisma.comment.count({
                where: {
                    chapterId,
                    parentId: null,
                    deletedAt: null,
                },
            }),
        ]);

        return {
            data: comments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateComment(commentId: string, profileId: string, data: UpdateCommentDto) {
        const comment = await prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });

        if (!comment) {
            throw new NotFoundError('Comment not found');
        }

        if (comment.profileId !== profileId) {
            throw new ForbiddenError('You can only edit your own comments');
        }

        return prisma.comment.update({
            where: { id: commentId },
            data: {
                content: data.content,
                isEdited: true,
            },
        });
    }

    async deleteComment(commentId: string, profileId: string, isAdmin = false) {
        const comment = await prisma.comment.findFirst({
            where: { id: commentId, deletedAt: null },
        });

        if (!comment) {
            throw new NotFoundError('Comment not found');
        }

        if (!isAdmin && comment.profileId !== profileId) {
            throw new ForbiddenError('You can only delete your own comments');
        }

        // Soft delete
        return prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
        });
    }
}


