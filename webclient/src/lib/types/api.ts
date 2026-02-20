
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum SeriesStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  HIATUS = 'HIATUS',
  CANCELLED = 'CANCELLED'
}

export enum ChapterLanguage {
  EN = 'EN',
  ES = 'ES',
  JP = 'JP'
}

// Entities
// Entities

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  favorites?: Favorite[];
  ratings?: Rating[];
  comments?: Comment[];
  lists?: any[];
  readingProgress?: ReadingProgress[];
}

export interface UserPreferences {
  id: string;
  userId: string;
  isProfilePublic: boolean;
  showFavorites: boolean;
  showRatings: boolean;
  showComments: boolean;
  showLists: boolean;
  showProgress: boolean;
}

export interface Series {
  id: string;
  slug: string;
  title: string;
  alternativeTitles?: string[];
  description: string;
  author: string;
  artist?: string;
  status: SeriesStatus;
  coverImage?: string;
  tags: string[];
  year?: number;
  rating: number;
  ratingCount: number;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  seriesId: string;
  volumeId?: string;
  number: number;
  title?: string;
  language: ChapterLanguage;
  releaseGroup?: string;
  publishedAt: string;
  pageCount: number;
  pages: string[];
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  series?: Series;
}

export interface Comment {
  id: string;
  profileId: string;
  chapterId: string;
  parentId?: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  replies?: Comment[];
  profile?: UserProfile;
}

export interface Rating {
  id: string;
  profileId: string;
  seriesId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  profileId: string;
  chapterId: string;
  currentPage: number;
  totalPages: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  chapter?: Chapter;
}

export interface ReadingHistory {
  id: string;
  profileId: string;
  seriesId: string;
  chapterId: string;
  readAt: string;
  series?: Series;
  chapter?: Chapter;
}

export interface Favorite {
  id: string;
  profileId: string;
  seriesId: string;
  createdAt: string;
  series?: Series;
}

export interface SystemSetting {
  key: string;
  value: any;
  updatedAt: string;
}

// DTOs & Queries
export interface CreateSeriesDto {
  title: string;
  alternativeTitles?: string[];
  description: string;
  author: string;
  artist?: string;
  status?: SeriesStatus;
  tags?: string[];
  year?: number;
  coverImage?: string;
}

export interface SeriesQueryDto {
  page?: number;
  limit?: number;
  status?: SeriesStatus;
  tags?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'rating' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateChapterDto {
  seriesId: string;
  volumeId?: string;
  number: number;
  title?: string;
  language?: ChapterLanguage;
  releaseGroup?: string;
  publishedAt?: string;
  isPublished?: boolean;
  pages?: string[];
}

export interface ChapterQueryDto {
  page?: number;
  limit?: number;
  language?: ChapterLanguage;
  sortBy?: 'number' | 'publishedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateProgressDto {
  currentPage: number;
  totalPages?: number;
  isCompleted?: boolean;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

export interface CreateRatingDto {
  rating: number;
}

export interface UpdateSettingDto {
  key: 'app_signup_mode' | 'app_allow_anonymous_view' | 'app_title' | 'app_custom_css' | 'app_custom_js' | 'feature_comments_enabled' | 'feature_ratings_enabled' | 'feature_public_lists_enabled';
  value: any;
}

// Responses
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Response Wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ...

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
  bannedAt?: string;
  banReason?: string;
  profile?: UserProfile;
}

// ...

export interface AdminStats {
  counts: {
    users: number;
    series: number;
    volumes: number;
    chapters: number;
  };
  uptime: number; // seconds
  startTime: string; // ISO date
  version: string;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isBanned?: boolean;
  sortBy?: 'createdAt' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
  emailVerified?: boolean;
  isActive?: boolean;
}

export interface BanUserDto {
  reason: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: Role;
}
