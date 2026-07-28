import { create } from 'zustand';

export interface Friend {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  level: number;
  streak: number;
  workoutsThisWeek: number;
  lastWorkout?: string;
  isOnline: boolean;
  addedAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'workout' | 'achievement' | 'streak' | 'milestone' | 'challenge';
  content: string;
  metadata?: {
    workoutName?: string;
    duration?: number;
    calories?: number;
    achievementName?: string;
    streakDays?: number;
    xpEarned?: number;
  };
  reactions: { emoji: string; count: number; reacted: boolean }[];
  createdAt: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'steps' | 'workouts' | 'duration' | 'calories';
  target: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  participants: {
    userId: string;
    name: string;
    progress: number;
    completed: boolean;
  }[];
  isActive: boolean;
}

interface FriendState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  activityFeed: ActivityFeedItem[];
  challenges: Challenge[];
  searchResults: { id: string; name: string; avatar?: string; level: number }[];

  // Friend actions
  sendFriendRequest: (toUserId: string, toUserName: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  searchUsers: (query: string) => void;

  // Activity feed
  addActivityItem: (item: Omit<ActivityFeedItem, 'id' | 'createdAt' | 'reactions'>) => void;
  toggleReaction: (itemId: string, emoji: string) => void;

  // Challenges
  createChallenge: (challenge: Omit<Challenge, 'id' | 'isActive' | 'participants'>) => void;
  joinChallenge: (challengeId: string, userId: string, userName: string) => void;
  updateChallengeProgress: (challengeId: string, userId: string, progress: number) => void;

  // Simulation
  simulateFriendActivity: () => void;
}

// Simulated user database for demo
const simulatedUsers = [
  { id: 'sim-1', name: 'Sarah M.', level: 12, avatar: undefined },
  { id: 'sim-2', name: 'Mike R.', level: 8, avatar: undefined },
  { id: 'sim-3', name: 'Emma L.', level: 15, avatar: undefined },
  { id: 'sim-4', name: 'James K.', level: 6, avatar: undefined },
  { id: 'sim-5', name: 'Olivia P.', level: 20, avatar: undefined },
  { id: 'sim-6', name: 'David W.', level: 10, avatar: undefined },
  { id: 'sim-7', name: 'Sofia G.', level: 14, avatar: undefined },
  { id: 'sim-8', name: 'Alex T.', level: 7, avatar: undefined },
];

let counter = 0;

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  friendRequests: [],
  activityFeed: [],
  challenges: [],
  searchResults: [],

  sendFriendRequest: (toUserId, toUserName) => set((state) => {
    const existing = state.friendRequests.find(
      r => r.toUserId === toUserId && r.status === 'pending'
    );
    if (existing) return state;

    counter++;
    return {
      friendRequests: [
        ...state.friendRequests,
        {
          id: `fr-${Date.now()}-${counter}`,
          fromUserId: 'current-user',
          fromUserName: 'You',
          toUserId,
          toUserName,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }),

  acceptFriendRequest: (requestId) => set((state) => {
    const request = state.friendRequests.find(r => r.id === requestId);
    if (!request) return state;

    const simulatedUser = simulatedUsers.find(u => u.id === request.toUserId);

    return {
      friendRequests: state.friendRequests.map(r =>
        r.id === requestId ? { ...r, status: 'accepted' as const } : r
      ),
      friends: [
        ...state.friends,
        {
          id: `friend-${Date.now()}`,
          userId: request.toUserId,
          name: simulatedUser?.name || 'Friend',
          avatar: simulatedUser?.avatar,
          level: simulatedUser?.level || 1,
          streak: Math.floor(Math.random() * 14) + 1,
          workoutsThisWeek: Math.floor(Math.random() * 5),
          isOnline: Math.random() > 0.5,
          addedAt: new Date().toISOString(),
        },
      ],
    };
  }),

  rejectFriendRequest: (requestId) => set((state) => ({
    friendRequests: state.friendRequests.map(r =>
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    ),
  })),

  removeFriend: (friendId) => set((state) => ({
    friends: state.friends.filter(f => f.id !== friendId),
  })),

  searchUsers: (query) => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) {
      set({ searchResults: [] });
      return;
    }
    const results = simulatedUsers.filter(u =>
      u.name.toLowerCase().includes(q)
    );
    set({ searchResults: results });
  },

  addActivityItem: (item) => set((state) => ({
    activityFeed: [
      {
        ...item,
        id: `act-${Date.now()}-${counter++}`,
        createdAt: new Date().toISOString(),
        reactions: [],
      },
      ...state.activityFeed,
    ].slice(0, 50), // Keep last 50 items
  })),

  toggleReaction: (itemId, emoji) => set((state) => ({
    activityFeed: state.activityFeed.map(item => {
      if (item.id !== itemId) return item;
      const existing = item.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...item,
          reactions: item.reactions.map(r =>
            r.emoji === emoji
              ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
              : r
          ).filter(r => r.count > 0),
        };
      }
      return {
        ...item,
        reactions: [...item.reactions, { emoji, count: 1, reacted: true }],
      };
    }),
  })),

  createChallenge: (challenge) => set((state) => ({
    challenges: [
      {
        ...challenge,
        id: `ch-${Date.now()}-${counter++}`,
        isActive: true,
        participants: [],
      },
      ...state.challenges,
    ],
  })),

  joinChallenge: (challengeId, userId, userName) => set((state) => ({
    challenges: state.challenges.map(ch =>
      ch.id === challengeId
        ? {
            ...ch,
            participants: [
              ...ch.participants,
              { userId, name: userName, progress: 0, completed: false },
            ],
          }
        : ch
    ),
  })),

  updateChallengeProgress: (challengeId, userId, progress) => set((state) => ({
    challenges: state.challenges.map(ch =>
      ch.id === challengeId
        ? {
            ...ch,
            participants: ch.participants.map(p =>
              p.userId === userId
                ? { ...p, progress, completed: progress >= ch.target }
                : p
            ),
          }
        : ch
    ),
  })),

  simulateFriendActivity: () => {
    const state = get();
    if (state.friends.length === 0) return;

    const friend = state.friends[Math.floor(Math.random() * state.friends.length)];
    const activities = [
      { type: 'workout' as const, content: `Completed ${['Push Day', 'Leg Day', 'Pull Day', 'Full Body', 'HIIT Session'][Math.floor(Math.random() * 5)]}`, metadata: { duration: Math.floor(Math.random() * 45) + 15, calories: Math.floor(Math.random() * 400) + 100 } },
      { type: 'achievement' as const, content: `Unlocked "${['First PR', 'Week Warrior', 'Streak Master', 'Calorie Crusher'][Math.floor(Math.random() * 4)]}"`, metadata: { xpEarned: Math.floor(Math.random() * 200) + 50 } },
      { type: 'streak' as const, content: `On a ${Math.floor(Math.random() * 20) + 3}-day streak!`, metadata: { streakDays: Math.floor(Math.random() * 20) + 3 } },
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    get().addActivityItem({
      userId: friend.userId,
      userName: friend.name,
      userAvatar: friend.avatar,
      ...activity,
    });
  },
}));
