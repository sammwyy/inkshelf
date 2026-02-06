# API Documentation

## Entities (Output Models)

### User
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| email | String | Unique email |
| role | Role | USER or ADMIN |
| isActive | Boolean | |
| emailVerified | Boolean | |
| emailVerificationSentAt | DateTime? | Last time a verification code was sent |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| profileId | String | Associated profile UUID |

### UserProfile
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| userId | String | Associated User ID |
| username | String | Unique username |
| bio | String? | |
| avatar | String? | URL |
| location | String? | |
| website | String? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| favorites | Favorite[] | Filtered by privacy (in profile view) |
| ratings | Rating[] | Filtered by privacy (in profile view) |
| comments | Comment[] | Filtered by privacy (in profile view) |
| lists | UserList[] | Filtered by privacy (in profile view) |
| readingProgress | ReadingProgress[] | Filtered by privacy (in profile view) |

### UserPreferences
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| userId | String | |
| isProfilePublic | Boolean | Overall profile visibility |
| showFavorites | Boolean | |
| showRatings | Boolean | |
| showComments | Boolean | |
| showLists | Boolean | |
| showProgress | Boolean | |

### Series
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| slug | String | Unique URL-friendly slug |
| title | String | |
| description | String | |
| author | String | |
| artist | String? | |
| status | SeriesStatus | ONGOING, COMPLETED, HIATUS, CANCELLED |
| coverImage | String? | URL |
| tags | String[] | |
| year | Int? | |
| rating | Float | Average rating |
| ratingCount | Int | Total number of ratings |
| viewCount | Int | Total views |
| isPublished | Boolean | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Chapter
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| seriesId | String | |
| volumeId | String? | |
| number | Float | Chapter number |
| title | String? | |
| language | ChapterLanguage | EN, ES, etc. |
| releaseGroup | String? | |
| publishedAt | DateTime | |
| pageCount | Int | |
| pages | String[] | Array of image URLs |
| viewCount | Int | |
| isPublished | Boolean | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Comment
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| profileId | String | Associated profile ID |
| chapterId | String | |
| parentId | String? | Parent comment ID for replies |
| content | String | |
| isEdited | Boolean | |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| deletedAt | DateTime? | |
| replies | Comment[] | Nested replies (in responses) |
| profile | UserProfile | Author info |

### Rating
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| profileId | String | |
| seriesId | String | |
| rating | Int | 1-5 or similar scale |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### ReadingProgress
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| profileId | String | |
| chapterId | String | |
| currentPage | Int | |
| totalPages | Int | |
| isCompleted | Boolean | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### ReadingHistory
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| profileId | String | |
| seriesId | String | |
| chapterId | String | |
| readAt | DateTime | |

### Favorite
| Field | Type | Description |
|---|---|---|
| id | String | UUID |
| profileId | String | |
| seriesId | String | |
| createdAt | DateTime | |

### SystemSetting
| Field | Type | Description |
|---|---|---|
| key | String | Unique setting key |
| value | Any | JSON value |
| updatedAt | DateTime | |

---

## DTOs (Input/Validation)

### Auth Modules
**SignupDto**
```typescript
{
  email: string; // valid email
  username: string; // 3-30 chars, alphanumeric, _ -
  password: string; // min 8 chars, 1 uppercase, 1 lowercase, 1 number
}
```

**LoginDto**
```typescript
{
  email: string;
  password: string;
}
```

**RefreshTokenDto**
```typescript
{
  refreshToken: string;
}
```

**VerifyEmailDto**
```typescript
{
  code: string; // 6 characters alphanumeric
}
```

### Profiles Module
**UpdateProfileDto**
```typescript
{
  username?: string; // 3-30 chars, alphanumeric, _ -
  bio?: string; // max 500 chars
  location?: string; // max 100 chars
  website?: string; // valid URL, max 255 chars
}
```

### Preferences Module
**UpdatePreferencesDto**
```typescript
{
  isProfilePublic?: boolean;
  showFavorites?: boolean;
  showRatings?: boolean;
  showComments?: boolean;
  showLists?: boolean;
  showProgress?: boolean;
}
```

### Series Module
**CreateSeriesDto**
```typescript
{
  title: string;
  alternativeTitles?: string[];
  description: string;
  author: string;
  artist?: string;
  status?: SeriesStatus; // default ONGOING
  tags?: string[];
  year?: number;
  coverImage?: string; // URL
}
```

**GetSeriesQueryDto** (Query Params)
```typescript
{
  page?: number; // default 1
  limit?: number; // default 20
  status?: SeriesStatus;
  tags?: string; // comma separated in URL
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'rating' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}
```

### Chapters Module
**CreateChapterDto**
```typescript
{
  seriesId: string; // UUID
  volumeId?: string; // UUID
  number: number;
  title?: string;
  language?: ChapterLanguage; // default EN
  releaseGroup?: string;
  publishedAt?: string; // ISO DateTime
  isPublished?: boolean; // default true
}
```

**GetChaptersQueryDto** (Query Params)
```typescript
{
  page?: number;
  limit?: number;
  language?: ChapterLanguage;
  sortBy?: 'number' | 'publishedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

### Progress Module
**UpdateProgressDto**
```typescript
{
  currentPage: number;
  totalPages: number;
  isCompleted?: boolean;
}
```

**GetProgressQueryDto** (Query Params)
```typescript
{
  page?: number;
  limit?: number;
}
```

### Comments Module
**CreateCommentDto**
```typescript
{
  content: string; // 1-2000 chars
  parentId?: string; // UUID
}
```

**UpdateCommentDto**
```typescript
{
  content: string; // 1-2000 chars
}
```

### Ratings Module
**CreateRatingDto**
```typescript
{
  rating: number; // 1-10 (integer)
}
```

### Settings Module
**UpdateSettingDto**
```typescript
{
  key: 'app_signup_mode' | 'app_allow_anonymous_view' | 'app_title' | 'app_custom_css' | 'app_custom_js';
  value: any; // Type depends on key (boolean, string, or enum)
}
```

---

## Endpoints

### Authentication
Base URL: `/api/v1/auth`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Login and receive access/refresh tokens |
| POST | `/refresh` | No | Refresh access token |
| POST | `/logout` | No | Logout (clear cookies/tokens) |
| GET | `/me` | Yes | Get current user's general information |
| POST | `/password-reset/request` | No | Request password reset email |
| POST | `/password-reset/confirm` | No | Reset password with token |
| POST | `/verify-email/request` | Yes | Request email verification code |
| POST | `/verify-email/confirm` | Yes | Verify email using code |

### Profiles
Base URL: `/api/v1/profiles`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/:identifier` | Optional | Get profile details. Identifier can be ID or `@username` |
| PATCH | `/me` | Yes | Update current user's profile |

### Preferences
Base URL: `/api/v1/me/preferences`

| GET | `/` | Yes | Get current user's preferences |
| PATCH | `/` | Yes | Update preferences |

### Settings (System)
Base URL: `/api/v1/settings`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | No | Get all public system settings |
| PATCH | `/` | Admin | Update a system setting |

### Series
Base URL: `/api/v1/series`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | No | List series with pagination & filtering |
| GET | `/:id` | No | Get series details by ID |
| GET | `/slug/:slug` | No | Get series details by slug |
| POST | `/` | Admin | Create a new series |
| PATCH | `/:id` | Admin | Update a series |
| DELETE | `/:id` | Admin | Soft delete a series |

### Chapters
Base URL: `/api/v1/chapters`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | No | List chapters |
| GET | `/:id` | No | Get chapter details and pages |
| GET | `/series/:seriesId` | No | List chapters for a specific series |
| POST | `/` | Admin | Create a new chapter |
| POST | `/series/:seriesId` | Admin | Create a chapter for a specific series |
| PATCH | `/:id` | Admin | Update chapter |
| DELETE | `/:id` | Admin | Delete chapter |
| POST | `/:id/pages` | Admin | Upload chapter pages (Multipart/form-data) |


### Favorites
Base URL: `/api/v1/favorites`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | Yes | Get user's favorite series |
| POST | `/` | Yes | Add series to favorites (Body: `{ seriesId: string }`) |
| DELETE | `/:seriesId` | Yes | Remove series from favorites |

### Reading Progress
Base URL: `/api/v1/progress`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | Yes | Get all reading progress |
| GET | `/continue-reading` | Yes | Get recently read chapters to continue |
| GET | `/history` | Yes | Get reading history |
| GET | `/:chapterId` | Yes | Get progress for specific chapter |
| PUT | `/:chapterId` | Yes | Update reading progress |
| DELETE | `/:chapterId` | Yes | Delete progress for a chapter |
| DELETE | `/` | Yes | Clear all reading progress |

### Ratings
Base URL: `/api/v1/series/:seriesId/ratings`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | Yes | Get current user's rating for this series |
| POST | `/` | Yes | Rate a series |
| DELETE | `/` | Yes | Remove rating |

### Comments
Base URL: `/api/v1/chapters/:chapterId/comments`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | No | Get comments for a chapter |
| POST | `/` | Yes | Post a comment |
| PATCH | `/:id` | Yes (Owner) | Update a comment (ID in path is commentId) |
| DELETE | `/:id` | Yes (Owner/Admin) | Delete a comment |
