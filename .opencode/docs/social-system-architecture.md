# FitPulse Social & Friend System Architecture

> Comprehensive architecture document for the friend system, social features, challenges, and real-time activity feeds.

---

## 1. Friend System Architecture

### 1.1 Friend Request Flow

```
User A sends request → User B receives notification → User B accepts/rejects → Friendship created
```

**States of a friend relationship:**
- `pending` — Request sent, awaiting response
- `accepted` — Mutual friends
- `blocked` — One user blocked the other
- `declined` — Request was rejected (optional: auto-delete after 30 days)

### 1.2 Core Principles

1. **Bidirectional friendship**: When A befriends B, both see each other in their friends list. No duplicate rows.
2. **Request deduplication**: Only one pending request between any two users at a time.
3. **Self-request prevention**: Users cannot friend themselves (CHECK constraint).
4. **Block precedence**: A block prevents any future friend requests between those users.

---

## 2. PostgreSQL Schema (Enhanced)

### 2.1 Users & Profiles (Existing — Minor Enhancements)

```sql
-- Users (existing, with added search fields)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  avatar_url TEXT,
  auth_provider VARCHAR(20) DEFAULT 'email',
  -- NEW: Search & discovery fields
  username VARCHAR(30) UNIQUE,          -- @handle for search
  phone VARCHAR(20),                     -- Optional phone lookup
  phone_verified BOOLEAN DEFAULT FALSE,
  is_searchable BOOLEAN DEFAULT TRUE,    -- Privacy: can be found by others
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles (existing, with privacy additions)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  goals TEXT[] DEFAULT '{}',
  fitness_level VARCHAR(20) DEFAULT 'beginner',
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  date_of_birth DATE,
  -- NEW: Privacy & visibility
  profile_visibility VARCHAR(20) DEFAULT 'friends',  -- 'public', 'friends', 'private'
  activity_sharing BOOLEAN DEFAULT TRUE,              -- Share workouts in feed
  show_online_status BOOLEAN DEFAULT TRUE,
  show_streak BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Friendships Table (Enhanced)

```sql
-- Friend Requests & Friendships (bidirectional)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
  -- Metadata
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  -- Constraints
  CHECK (requester_id != addressee_id),  -- No self-friendship
  UNIQUE(requester_id, addressee_id)
);

-- Indexes for fast lookups
CREATE INDEX idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id, status);
CREATE INDEX idx_friendships_status ON friendships(status);

-- View: Get all friends for a user (bidirectional)
CREATE OR REPLACE VIEW user_friends AS
SELECT
  f.id AS friendship_id,
  f.status,
  f.responded_at,
  CASE
    WHEN f.requester_id = user_a.id THEN user_b.id
    ELSE user_a.id
  END AS friend_id,
  CASE
    WHEN f.requester_id = user_a.id THEN user_b.name
    ELSE user_a.name
  END AS friend_name,
  CASE
    WHEN f.requester_id = user_a.id THEN user_b.avatar_url
    ELSE user_a.avatar_url
  END AS friend_avatar
FROM friendships f
JOIN users user_a ON f.requester_id = user_a.id
JOIN users user_b ON f.addressee_id = user_b.id
WHERE f.status = 'accepted'
  AND (f.requester_id = user_a.id OR f.addressee_id = user_a.id);
```

### 2.3 Friend Requests (Separate Table for History)

```sql
-- Friend request history (for notification tracking)
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID REFERENCES friendships(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  message TEXT,                          -- Optional: "Hey, let's be workout buddies!"
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  sent_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  -- Indexes
  UNIQUE(friendship_id)
);

CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id, status);
```

### 2.4 User Blocks

```sql
-- User blocks (prevents friend requests + hides from search)
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (blocker_id != blocked_id),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);
```

### 2.5 Activity Feed

```sql
-- Activity feed entries
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  -- Activity data
  activity_type VARCHAR(30) NOT NULL
    CHECK (activity_type IN (
      'workout_completed', 'achievement_unlocked', 'level_up',
      'streak_milestone', 'challenge_joined', 'challenge_completed',
      'personal_record', 'meal_logged', 'friend_added'
    )),
  -- Polymorphic reference
  reference_type VARCHAR(30),   -- 'workout', 'achievement', 'challenge', etc.
  reference_id UUID,            -- ID of the referenced entity
  -- Content
  title VARCHAR(200) NOT NULL,  -- "Completed Push Day 💪"
  description TEXT,             -- "45 min • 320 cal • 12 exercises"
  metadata JSONB,               -- Flexible data: { duration, calories, exercises }
  -- Visibility
  visibility VARCHAR(20) DEFAULT 'friends'
    CHECK (visibility IN ('public', 'friends', 'private')),
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_type ON activity_feed(activity_type, created_at DESC);
CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);
```

### 2.6 Comments

```sql
-- Comments on activity feed posts
CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE  -- Soft delete
);

CREATE INDEX idx_feed_comments_activity ON feed_comments(activity_id, created_at);
```

### 2.7 Reactions

```sql
-- Reactions on activity feed posts (emoji-based)
CREATE TABLE feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,  -- '💪', '🔥', '👏', '❤️', '🏆'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(activity_id, user_id, emoji)  -- One reaction type per user per post
);

CREATE INDEX idx_feed_reactions_activity ON feed_reactions(activity_id);
CREATE INDEX idx_feed_reactions_user ON feed_reactions(user_id);
```

### 2.8 Challenges

```sql
-- Challenges (system-created or user-created)
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),  -- NULL = system challenge
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('steps', 'workouts', 'distance', 'streak', 'calories', 'custom')),
  target INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_participants INTEGER,         -- NULL = unlimited
  is_premium BOOLEAN DEFAULT FALSE, -- Premium-only challenge
  cover_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (end_date > start_date)
);

CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_challenges_type ON challenges(type);
```

### 2.9 Challenge Participants

```sql
-- Challenge participation & progress tracking
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id, progress DESC);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
```

### 2.10 Leaderboard Cache

```sql
-- Materialized leaderboard for fast queries
CREATE MATERIALIZED VIEW leaderboard_weekly AS
SELECT
  cp.user_id,
  u.name,
  u.avatar_url,
  cp.challenge_id,
  cp.progress,
  RANK() OVER (PARTITION BY cp.challenge_id ORDER BY cp.progress DESC) AS rank
FROM challenge_participants cp
JOIN users u ON cp.user_id = u.id
JOIN challenges c ON cp.challenge_id = c.id
WHERE c.start_date >= DATE_TRUNC('week', CURRENT_DATE)
  AND c.end_date <= DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days';

-- Refresh weekly (run via cron/pg_cron)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly;
```

### 2.11 Notifications

```sql
-- Notifications table (existing, enhanced)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL
    CHECK (type IN (
      'friend_request', 'friend_accepted', 'friend_declined',
      'workout_reaction', 'workout_comment', 'challenge_invite',
      'challenge_progress', 'challenge_completed', 'achievement',
      'streak_milestone', 'system'
    )),
  title VARCHAR(200),
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,                    -- { senderId, entityId, entityType }
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

### 2.12 User Search

```sql
-- Full-text search support for user discovery
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_name_gin ON users USING gin(to_tsvector('english', name));

-- Search function
CREATE OR REPLACE FUNCTION search_users(
  query TEXT,
  requesting_user_id UUID,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  username VARCHAR,
  avatar_url TEXT,
  level INTEGER,
  bio TEXT,
  is_friend BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.username,
    u.avatar_url,
    p.level,
    p.bio,
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.status = 'accepted'
        AND (
          (f.requester_id = requesting_user_id AND f.addressee_id = u.id)
          OR
          (f.requester_id = u.id AND f.addressee_id = requesting_user_id)
        )
    ) AS is_friend
  FROM users u
  JOIN user_profiles p ON u.id = p.user_id
  WHERE
    u.id != requesting_user_id
    AND u.is_searchable = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks b
      WHERE (b.blocker_id = requesting_user_id AND b.blocked_id = u.id)
         OR (b.blocker_id = u.id AND b.blocked_id = requesting_user_id)
    )
    AND (
      u.username ILIKE '%' || query || '%'
      OR u.name ILIKE '%' || query || '%'
      OR u.email ILIKE '%' || query || '%'
    )
  ORDER BY
    CASE WHEN u.username ILIKE query || '%' THEN 0 ELSE 1 END,  -- Username prefix first
    p.level DESC  -- Higher level first
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. API Endpoints (REST)

### 3.1 Friend System

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/friends` | List all friends | ✅ |
| `GET` | `/api/friends/requests` | List pending requests (sent + received) | ✅ |
| `POST` | `/api/friends/request` | Send friend request | ✅ |
| `POST` | `/api/friends/accept/:requestId` | Accept friend request | ✅ |
| `POST` | `/api/friends/decline/:requestId` | Decline friend request | ✅ |
| `DELETE` | `/api/friends/:friendId` | Remove friend | ✅ |
| `GET` | `/api/friends/mutual/:userId` | Get mutual friends | ✅ |
| `GET` | `/api/friends/suggestions` | Friend suggestions | ✅ |

### 3.2 User Search

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users/search?q=...` | Search users by name/username | ✅ |
| `GET` | `/api/users/:userId` | Get public user profile | ✅ |
| `POST` | `/api/users/block/:userId` | Block a user | ✅ |
| `DELETE` | `/api/users/block/:userId` | Unblock a user | ✅ |

### 3.3 Activity Feed

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/feed` | Get activity feed (paginated) | ✅ |
| `GET` | `/api/feed/user/:userId` | Get user's activity feed | ✅ |
| `POST` | `/api/feed` | Create activity post | ✅ |
| `POST` | `/api/feed/:activityId/react` | Add reaction | ✅ |
| `DELETE` | `/api/feed/:activityId/react/:emoji` | Remove reaction | ✅ |
| `GET` | `/api/feed/:activityId/comments` | Get comments | ✅ |
| `POST` | `/api/feed/:activityId/comments` | Add comment | ✅ |
| `DELETE` | `/api/feed/:activityId` | Delete post (owner only) | ✅ |

### 3.4 Challenges

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/challenges` | List active challenges | ✅ |
| `GET` | `/api/challenges/:id` | Get challenge details | ✅ |
| `POST` | `/api/challenges/:id/join` | Join challenge | ✅ |
| `DELETE` | `/api/challenges/:id/leave` | Leave challenge | ✅ |
| `GET` | `/api/challenges/:id/leaderboard` | Get leaderboard | ✅ |
| `POST` | `/api/challenges` | Create custom challenge | ✅ (Premium) |
| `POST` | `/api/challenges/:id/invite` | Invite friend to challenge | ✅ |

### 3.5 Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | Get notifications (paginated) | ✅ |
| `PATCH` | `/api/notifications/:id/read` | Mark as read | ✅ |
| `POST` | `/api/notifications/read-all` | Mark all as read | ✅ |
| `GET` | `/api/notifications/count` | Get unread count | ✅ |

---

## 4. Real-Time Updates (Socket.IO)

### 4.1 Architecture Decision: Socket.IO vs Polling

| Factor | Socket.IO | HTTP Polling | Recommendation |
|--------|-----------|--------------|----------------|
| Latency | ~50ms | 5000ms+ | **Socket.IO** for feed |
| Battery | Higher (open connection) | Lower | Hybrid approach |
| Complexity | Higher | Lower | Socket.IO for MVP+ |
| Scalability | Horizontal (Redis adapter) | Simple load balancer | Socket.IO |
| Offline support | Reconnection built-in | Manual | **Socket.IO** |

**Recommendation**: Use **Socket.IO** for real-time features with **HTTP polling fallback** for non-critical updates.

### 4.2 Socket.IO Events

```typescript
// === Server → Client Events ===

// Feed events
'feed:new_post'           // New activity from a friend
'feed:new_reaction'       // Someone reacted to your post
'feed:new_comment'        // Someone commented on your post
'feed:post_deleted'       // A post was removed

// Friend events
'friend:request_received' // New friend request
'friend:request_accepted' // Your request was accepted
'friend:request_declined' // Your request was declined
'friend:removed'          // Someone removed you

// Challenge events
'challenge:invite'        // Invited to a challenge
'challenge:progress'      // Friend's progress update
'challenge:completed'     // Challenge ended, results ready

// Notification events
'notification:new'        // Any new notification
'notification:count'      // Updated unread count

// === Client → Server Events ===

'feed:subscribe'          // Subscribe to feed updates
'feed:unsubscribe'        // Unsubscribe
'friend:typing'           // Optional: typing indicator for messages
'challenge:subscribe'     // Subscribe to challenge updates
```

### 4.3 Socket.IO Implementation Pattern

```typescript
// Server-side (Node.js + Socket.IO)
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Redis adapter for horizontal scaling
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const user = await verifyJWT(token);
  if (!user) return next(new Error('Authentication error'));
  socket.data.userId = user.id;
  next();
});

// Connection handler
io.on('connection', (socket) => {
  const userId = socket.data.userId;

  // Join personal room
  socket.join(`user:${userId}`);

  // Subscribe to friend feeds
  socket.on('feed:subscribe', async () => {
    const friends = await getFriendIds(userId);
    friends.forEach(friendId => {
      socket.join(`feed:${friendId}`);
    });
  });

  // Handle reactions
  socket.on('feed:react', async (data) => {
    const reaction = await addReaction(data.activityId, userId, data.emoji);
    io.to(`feed:${userId}`).emit('feed:new_reaction', reaction);
  });

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
});

// Helper: Emit to user's friends
async function emitToFriends(userId: string, event: string, data: any) {
  const friends = await getFriendIds(userId);
  friends.forEach(friendId => {
    io.to(`user:${friendId}`).emit(event, data);
  });
}
```

### 4.4 Client-Side (React Native + Socket.IO)

```typescript
// hooks/useSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const user = useAppStore(s => s.user);

  useEffect(() => {
    if (!user.id) return;

    const socket = io(SOCKET_URL, {
      auth: { token: getAuthToken() },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      socket.emit('feed:subscribe');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user.id]);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { socket: socketRef.current, on, emit };
}
```

---

## 5. React Native Component Architecture

### 5.1 Component Structure

```
src/
├── features/
│   └── social/
│       ├── components/
│       │   ├── ActivityFeed.tsx          # Main feed list
│       │   ├── ActivityCard.tsx          # Individual activity post
│       │   ├── ReactionBar.tsx           # Emoji reaction picker
│       │   ├── CommentSection.tsx        # Comments list + input
│       │   ├── FriendList.tsx            # Friends tab content
│       │   ├── FriendCard.tsx            # Individual friend item
│       │   ├── FriendRequestCard.tsx     # Pending request item
│       │   ├── UserSearchModal.tsx       # Search users overlay
│       │   ├── LeaderboardView.tsx       # Leaderboard tab
│       │   ├── LeaderboardEntry.tsx      # Single leaderboard row
│       │   ├── ChallengeCard.tsx         # Challenge preview
│       │   ├── ChallengeDetail.tsx       # Challenge detail view
│       │   └── ChallengeLeaderboard.tsx  # Challenge rankings
│       ├── hooks/
│       │   ├── useFeed.ts               # Feed data + pagination
│       │   ├── useFriends.ts            # Friends list + requests
│       │   ├── useChallenges.ts         # Challenges data
│       │   ├── useUserSearch.ts         # Search debounce + results
│       │   └── useRealtime.ts           # Socket.IO connection
│       ├── store/
│       │   └── socialStore.ts           # Zustand store for social
│       ├── api/
│       │   └── socialApi.ts             # API client functions
│       ├── types/
│       │   └── social.ts                # Social-specific types
│       └── utils/
│           ├── feedTransform.ts         # Transform API → UI format
│           └── timeAgo.ts               # "2h ago", "Yesterday"
```

### 5.2 Zustand Store for Social

```typescript
// src/features/social/store/socialStore.ts
import { create } from 'zustand';

interface SocialState {
  // Feed
  feed: ActivityPost[];
  feedCursor: string | null;
  feedLoading: boolean;

  // Friends
  friends: Friend[];
  friendRequests: FriendRequest[];
  friendsLoading: boolean;

  // Challenges
  activeChallenges: Challenge[];
  challengesLoading: boolean;

  // Notifications
  unreadCount: number;

  // Actions
  loadFeed: (refresh?: boolean) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  createPost: (content: string) => Promise<void>;
  reactToPost: (postId: string, emoji: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;

  loadFriends: () => Promise<void>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;

  loadChallenges: () => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;

  // Real-time handlers
  handleNewPost: (post: ActivityPost) => void;
  handleNewReaction: (postId: string, reaction: Reaction) => void;
  handleNewComment: (postId: string, comment: Comment) => void;
  handleFriendRequest: (request: FriendRequest) => void;
  handleFriendAccepted: (friend: Friend) => void;
}
```

### 5.3 Activity Feed Component

```typescript
// Key component pattern
import React, { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useFeed } from '../hooks/useFeed';
import ActivityCard from './ActivityCard';

export default function ActivityFeed() {
  const {
    feed,
    loading,
    refreshing,
    hasMore,
    refresh,
    loadMore,
    reactToPost,
    addComment,
  } = useFeed();

  const renderItem = useCallback(({ item }) => (
    <ActivityCard
      post={item}
      onReact={(emoji) => reactToPost(item.id, emoji)}
      onComment={(text) => addComment(item.id, text)}
    />
  ), [reactToPost, addComment]);

  return (
    <FlatList
      data={feed}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      onEndReached={hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
    />
  );
}
```

---

## 6. Privacy & Safety

### 6.1 Profile Visibility Settings

| Setting | Options | Effect |
|---------|---------|--------|
| `profile_visibility` | `public` / `friends` / `private` | Who can see full profile |
| `activity_sharing` | `true` / `false` | Auto-share workouts to feed |
| `show_online_status` | `true` / `false` | Show online dot to friends |
| `show_streak` | `true` / `false` | Display streak on profile |
| `is_searchable` | `true` / `false` | Appear in user search |

### 6.2 Block & Report

```sql
-- Block functionality
-- When user A blocks user B:
-- 1. Remove existing friendship (if any)
-- 2. Add to user_blocks
-- 3. Hide B's posts from A's feed
-- 4. Hide A's posts from B's feed
-- 5. Prevent future friend requests

-- Report functionality
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id),
  reported_id UUID REFERENCES users(id),
  reason VARCHAR(50) NOT NULL
    CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'fake_profile', 'other')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_user_reports_status ON user_reports(status, created_at);
```

### 6.3 Data Retention

- **Friend requests**: Auto-expire after 30 days
- **Declined requests**: Delete after 7 days
- **Activity feed**: Keep for 1 year (archive older)
- **Blocked users**: Keep indefinitely (user can unblock)
- **Reports**: Keep for 2 years (compliance)

---

## 7. Friend Request Flow (Detailed)

### 7.1 Send Friend Request

```
1. User A searches for User B
2. User A taps "Add Friend"
3. Client → POST /api/friends/request { receiverId: B }
4. Server:
   a. Check if already friends → 409
   b. Check if blocked → 403
   c. Check if request already exists → 409
   d. Create friendship (status: 'pending')
   e. Create friend_request record
   f. Create notification for User B
   g. Emit socket event: friend:request_received
5. Client: Button changes to "Request Sent"
```

### 7.2 Accept Friend Request

```
1. User B sees notification
2. User B taps "Accept"
3. Client → POST /api/friends/accept/:requestId
4. Server:
   a. Update friendship status → 'accepted'
   b. Update friend_request status → 'accepted'
   c. Create notification for User A
   d. Create activity_feed entry: "A and B are now friends"
   e. Emit socket events: friend:request_accepted
   f. Update both users' friendsCount
5. Client: Both users see each other in friends list
```

### 7.3 Denormalized Counters (Performance)

```sql
-- Add to users table for O(1) lookups
ALTER TABLE users ADD COLUMN friends_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN pending_requests_count INTEGER DEFAULT 0;

-- Trigger to auto-update friends_count
CREATE OR REPLACE FUNCTION update_friends_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE users SET friends_count = friends_count + 1 WHERE id = NEW.requester_id;
    UPDATE users SET friends_count = friends_count + 1 WHERE id = NEW.addressee_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE users SET friends_count = friends_count - 1 WHERE id = NEW.requester_id;
    UPDATE users SET friends_count = friends_count - 1 WHERE id = NEW.addressee_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_friends_count
  AFTER UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION update_friends_count();
```

---

## 8. Scalability Considerations

### 8.1 Database Optimization

- **Pagination**: Use cursor-based pagination (not OFFSET) for feed
- **Read replicas**: Route feed queries to replicas
- **Connection pooling**: Use PgBouncer (max 100 connections)
- **Materialized views**: Refresh leaderboard every 5 minutes

### 8.2 Caching Strategy

| Data | Cache Layer | TTL | Invalidation |
|------|-------------|-----|--------------|
| Friend list | Redis | 5 min | On friendship change |
| Unread count | Redis | Real-time | On new notification |
| Feed (first page) | Redis | 30 sec | On new post |
| Leaderboard | Materialized view | 5 min | Cron refresh |
| User search results | No cache | - | Always fresh |

### 8.3 Rate Limiting

```typescript
// Rate limits for social endpoints
const RATE_LIMITS = {
  'POST /api/friends/request': { window: '1h', max: 20 },
  'POST /api/feed': { window: '1h', max: 10 },
  'POST /api/feed/:id/react': { window: '1h', max: 100 },
  'POST /api/feed/:id/comments': { window: '1h', max: 50 },
  'GET /api/users/search': { window: '1m', max: 30 },
};
```

---

## 9. Migration Plan (From Current MVP)

### Current State (FitPulse MVP)
- Social screen with empty friends list
- Basic post creation (local state only)
- Simple leaderboard (user only)
- No real-time updates
- No friend search/requests

### Phase 1: Local State Enhancement
1. Add friend management to Zustand store
2. Implement friend request UI (accept/decline)
3. Add user search modal
4. Enhance leaderboard with mock friends

### Phase 2: Backend Integration
1. Create social API service
2. Implement PostgreSQL schema
3. Add Socket.IO server
4. Connect React Native to real API

### Phase 3: Advanced Features
1. Challenge system
2. Activity feed with comments/reactions
3. Push notifications (FCM)
4. Premium features (custom challenges)

---

## 10. File Manifest for Implementation

| Action | File Path | Description |
|--------|-----------|-------------|
| CREATE | `src/features/social/types/social.ts` | Social type definitions |
| CREATE | `src/features/social/api/socialApi.ts` | API client functions |
| CREATE | `src/features/social/store/socialStore.ts` | Zustand social store |
| CREATE | `src/features/social/hooks/useFeed.ts` | Feed pagination hook |
| CREATE | `src/features/social/hooks/useFriends.ts` | Friends management hook |
| CREATE | `src/features/social/hooks/useChallenges.ts` | Challenges hook |
| CREATE | `src/features/social/hooks/useUserSearch.ts` | User search hook |
| CREATE | `src/features/social/hooks/useRealtime.ts` | Socket.IO hook |
| CREATE | `src/features/social/components/ActivityFeed.tsx` | Feed list component |
| CREATE | `src/features/social/components/ActivityCard.tsx` | Activity post card |
| CREATE | `src/features/social/components/ReactionBar.tsx` | Emoji reactions |
| CREATE | `src/features/social/components/CommentSection.tsx` | Comments |
| CREATE | `src/features/social/components/FriendList.tsx` | Friends tab |
| CREATE | `src/features/social/components/FriendCard.tsx` | Friend item |
| CREATE | `src/features/social/components/FriendRequestCard.tsx` | Request item |
| CREATE | `src/features/social/components/UserSearchModal.tsx` | Search overlay |
| CREATE | `src/features/social/components/LeaderboardView.tsx` | Leaderboard tab |
| CREATE | `src/features/social/components/ChallengeCard.tsx` | Challenge card |
| CREATE | `src/features/social/components/ChallengeDetail.tsx` | Challenge detail |
| MODIFY | `app/(tabs)/social.tsx` | Refactor to use new components |
| MODIFY | `src/types/index.ts` | Add social types |
| CREATE | `.opencode/docs/social-system-architecture.md` | This document |

---

## 11. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Real-time | Socket.IO | Auto-reconnection, rooms, React Native support |
| Database | PostgreSQL | Already chosen, JSONB for flexible metadata |
| State | Zustand | Already in use, lightweight |
| Pagination | Cursor-based | Better performance than OFFSET for feeds |
| Friend model | Bidirectional with single row | Simpler than dual rows |
| Search | ILIKE + GIN index | Good enough for MVP, upgrade to FTS later |
| Caching | Redis | For friend lists, unread counts, feed |
| Leaderboard | Materialized view | Refreshed every 5 min, fast reads |
| Block | Separate table | Clean separation, fast lookups |
| Notifications | Database + FCM | DB for in-app, FCM for push |

---

**Confidence Level**: HIGH
**Sources**:
- Existing FitPulse schema: `docs/database-schema.md`
- Existing API plan: `docs/backend-api-plan.md`
- Socket.IO docs: https://socket.io/docs/v4/
- PostgreSQL docs: https://www.postgresql.org/docs/current/
- Project types: `src/types/index.ts`
- Current social screen: `app/(tabs)/social.tsx`
