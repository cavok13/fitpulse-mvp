# FitPulse Backend API Plan

## Architecture
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (primary), Redis (cache/sessions)
- **Auth**: JWT + OAuth 2.0 (Google, Apple, Email)
- **Real-time**: WebSocket (Socket.io)
- **AI Services**: Python (FastAPI) microservice for workout generation & form analysis
- **Storage**: AWS S3 for media (avatars, exercise videos, food images)
- **Notifications**: Firebase Cloud Messaging

---

## API Endpoints

### Auth Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register with email/password |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/oauth/google` | Google OAuth login |
| POST | `/auth/oauth/apple` | Apple OAuth login |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Get current user |

### User Profile Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get profile |
| PATCH | `/users/me` | Update profile |
| PATCH | `/users/me/goals` | Update fitness goals |
| PATCH | `/users/me/preferences` | Update preferences |
| GET | `/users/me/stats` | Get user statistics |

### Workout Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workouts/plans` | List workout plans |
| POST | `/workouts/plans/generate` | AI-generate a plan |
| GET | `/workouts/library` | Exercise library (paginated) |
| GET | `/workouts/library/:id` | Exercise details |
| POST | `/workouts/sessions` | Start a workout session |
| PATCH | `/workouts/sessions/:id` | Update session |
| POST | `/workouts/sessions/:id/complete` | Complete session |
| GET | `/workouts/history` | Workout history |

### AI Coach Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/workout-generate` | Generate personalized plan |
| POST | `/ai/form/start` | Start form analysis session |
| POST | `/ai/form/frame` | Send video frame for analysis |
| POST | `/ai/form/complete` | End form analysis session |
| GET | `/ai/form/history` | Form analysis history |

### Social Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/social/feed` | Activity feed |
| POST | `/social/posts` | Create post |
| POST | `/social/posts/:id/react` | React to post |
| POST | `/social/friends/request` | Send friend request |
| POST | `/social/friends/accept` | Accept friend request |
| GET | `/social/friends` | List friends |
| GET | `/social/challenges` | List challenges |
| POST | `/social/challenges/:id/join` | Join challenge |

### Nutrition Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nutrition/daily` | Today's nutrition data |
| POST | `/nutrition/meals` | Log a meal |
| GET | `/nutrition/meals/history` | Meal history |
| POST | `/nutrition/barcode/lookup` | Barcode scan lookup |
| POST | `/nutrition/photo/analyze` | AI food recognition |
| GET | `/nutrition/targets` | Daily nutrition targets |

### Progress & Analytics Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress/overview` | Dashboard overview |
| GET | `/progress/streak` | Streak data |
| GET | `/progress/records` | Personal records |
| GET | `/progress/charts` | Chart data |

---

## Authentication
All endpoints except `/auth/*` require JWT Bearer token in `Authorization` header.

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

## WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `feed:new_post` | Server → Client | New activity in feed |
| `feed:new_reaction` | Server → Client | Reaction on your post |
| `challenge:progress` | Server → Client | Challenge progress update |
| `notification:new` | Server → Client | New notification |

## Rate Limiting
- Auth endpoints: 10 requests/minute per IP
- API endpoints: 100 requests/minute per user
- AI endpoints: 20 requests/minute per user
