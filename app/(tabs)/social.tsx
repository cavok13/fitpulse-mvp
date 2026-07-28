import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import { useFriendStore } from '../../src/store/useFriendStore';
import { useSubscriptionStore } from '../../src/store/useSubscriptionStore';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const addXP = useAppStore((s) => s.addXP);

  const {
    friends, friendRequests, activityFeed, searchResults,
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
    searchUsers, toggleReaction, simulateFriendActivity,
  } = useFriendStore();

  const { tier } = useSubscriptionStore();
  const canChallenge = tier !== 'free' || friends.length < 1;

  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'leaderboard' | 'search'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    liked: boolean;
  }>>([]);

  // Simulate friend activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (friends.length > 0) {
        simulateFriendActivity();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [friends.length]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleAddFriend = (userId: string, userName: string) => {
    sendFriendRequest(userId, userName);
    Alert.alert('Request Sent!', `Friend request sent to ${userName}`);
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      liked: false,
    };
    setPosts([post, ...posts]);
    setNewPost('');
    addXP(10);

    useFriendStore.getState().addActivityItem({
      userId: user.id,
      userName: user.name,
      type: 'workout',
      content: newPost,
    });
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const leaderboard = [
    { rank: 1, name: user.name, workouts: user.stats.totalWorkouts, xp: user.xp, isUser: true },
    ...friends
      .sort((a: any, b: any) => b.workoutsThisWeek - a.workoutsThisWeek)
      .map((f: any, i: number) => ({
        rank: i + 2,
        name: f.name,
        workouts: f.workoutsThisWeek,
        xp: f.level * 500,
        isUser: false,
      })),
  ];

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>{friends.length} friends • {activityFeed.length} updates</Text>
        </View>
        {tier !== 'free' && (
          <TouchableOpacity style={styles.upgradeBtn}>
            <Ionicons name="diamond" size={16} color={Colors.xpGold} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['feed', 'friends', 'leaderboard', 'search'] as const).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'search' ? 'Find' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {tab === 'friends' && friendRequests.filter((r: any) => r.status === 'pending').length > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifText}>{friendRequests.filter((r: any) => r.status === 'pending').length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>

          {searchResults.length > 0 ? (
            searchResults.map((result: any) => (
              <Card key={result.id} style={styles.searchResult}>
                <View style={styles.friendRow}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>{result.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendName}>{result.name}</Text>
                    <Text style={styles.friendSub}>Level {result.level}</Text>
                  </View>
                  <Button title="Add" variant="primary" size="sm" onPress={() => handleAddFriend(result.id, result.name)} />
                </View>
              </Card>
            ))
          ) : searchQuery.length >= 2 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No users found for "{searchQuery}"</Text>
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Find Friends</Text>
              <Text style={styles.emptyText}>Search for friends by name to connect and compete!</Text>
            </Card>
          )}
        </>
      )}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <>
          <Card style={styles.postInput}>
            <View style={styles.postRow}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Share your workout..."
                placeholderTextColor={Colors.textMuted}
                value={newPost}
                onChangeText={setNewPost}
                multiline
              />
            </View>
            <View style={styles.postActions}>
              <Button title="Post" variant="primary" size="sm" onPress={handlePost} disabled={!newPost.trim()} />
            </View>
          </Card>

          {activityFeed.length === 0 && posts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptyText}>Add friends and start working out to see activity here!</Text>
            </Card>
          ) : (
            <>
              {activityFeed.slice(0, 10).map((item: any) => (
                <Card key={item.id} style={styles.feedCard}>
                  <View style={styles.feedHeader}>
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.feedAuthor}>{item.userName}</Text>
                      <Text style={styles.feedTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={[styles.feedTypeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                      <Ionicons name={getTypeIcon(item.type) as any} size={14} color={getTypeColor(item.type)} />
                    </View>
                  </View>
                  <Text style={styles.feedContent}>{item.content}</Text>
                  {item.metadata && (
                    <View style={styles.feedMeta}>
                      {item.metadata.duration && <Text style={styles.feedMetaText}>{item.metadata.duration}min</Text>}
                      {item.metadata.calories && <Text style={styles.feedMetaText}>{item.metadata.calories}cal</Text>}
                      {item.metadata.streakDays && <Text style={styles.feedMetaText}>{item.metadata.streakDays}🔥</Text>}
                    </View>
                  )}
                  <View style={styles.feedFooter}>
                    <TouchableOpacity style={styles.feedAction} onPress={() => toggleReaction(item.id, '💪')}>
                      <Text style={styles.feedActionText}>💪 {item.reactions.find((r: any) => r.emoji === '💪')?.count || ''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.feedAction} onPress={() => toggleReaction(item.id, '🔥')}>
                      <Text style={styles.feedActionText}>🔥 {item.reactions.find((r: any) => r.emoji === '🔥')?.count || ''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.feedAction} onPress={() => toggleReaction(item.id, '👏')}>
                      <Text style={styles.feedActionText}>👏 {item.reactions.find((r: any) => r.emoji === '👏')?.count || ''}</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}

              {posts.map((post) => (
                <Card key={post.id} style={styles.feedCard}>
                  <View style={styles.feedHeader}>
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarText}>{post.userName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.feedAuthor}>{post.userName} (You)</Text>
                      <Text style={styles.feedTime}>Just now</Text>
                    </View>
                  </View>
                  <Text style={styles.feedContent}>{post.content}</Text>
                  <View style={styles.feedFooter}>
                    <TouchableOpacity style={styles.feedAction} onPress={() => toggleLike(post.id)}>
                      <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={18} color={post.liked ? Colors.error : Colors.textMuted} />
                      <Text style={styles.feedActionText}>{post.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <>
          {friendRequests.filter((r: any) => r.status === 'pending').length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Friend Requests</Text>
              {friendRequests.filter((r: any) => r.status === 'pending').map((request: any) => (
                <Card key={request.id} style={styles.requestCard}>
                  <View style={styles.friendRow}>
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>{request.fromUserName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.friendName}>{request.fromUserName}</Text>
                      <Text style={styles.friendSub}>Wants to be your friend</Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptFriendRequest(request.id)}>
                        <Ionicons name="checkmark" size={20} color={Colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => rejectFriendRequest(request.id)}>
                        <Ionicons name="close" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

          <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
          {friends.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No friends yet</Text>
              <Text style={styles.emptyText}>Use the Find tab to search for friends!</Text>
            </Card>
          ) : (
            friends.map((friend: any) => (
              <Card key={friend.id} style={styles.friendCard}>
                <View style={styles.friendRow}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>{friend.name.charAt(0)}</Text>
                    {friend.isOnline && <View style={styles.onlineDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendSub}>Level {friend.level} • {friend.workoutsThisWeek} workouts this week • {friend.streak}🔥</Text>
                  </View>
                  {canChallenge && (
                    <Button title="Challenge" variant="ghost" size="sm" onPress={() => Alert.alert('Challenge', `Challenge sent to ${friend.name}!`)} />
                  )}
                </View>
              </Card>
            ))
          )}
        </>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <>
          <Card style={styles.leaderboardCard}>
            <Text style={styles.leaderboardTitle}>Your Ranking</Text>
            <View style={styles.rankRow}>
              <Text style={styles.rankBadge}>#{leaderboard.find((l: any) => l.isUser)?.rank || '-'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName}>{user.name}</Text>
                <Text style={styles.rankSub}>{user.stats.totalWorkouts} workouts • {user.xp} XP</Text>
              </View>
              <Ionicons name="trophy" size={24} color={Colors.xpGold} />
            </View>
          </Card>

          <Card style={styles.leaderboardCard}>
            <Text style={styles.leaderboardTitle}>Weekly Leaderboard</Text>
            {leaderboard.map((entry: any) => (
              <View key={entry.rank} style={[styles.lbRow, entry.isUser && styles.lbRowUser]}>
                <Text style={styles.lbRank}>{entry.rank}</Text>
                <View style={styles.lbAvatar}>
                  <Text style={styles.lbAvatarText}>{entry.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lbName}>{entry.name} {entry.isUser && '(You)'}</Text>
                  <Text style={styles.lbSub}>{entry.workouts} workouts</Text>
                </View>
                <Text style={styles.lbXP}>{entry.xp} XP</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function getTypeColor(type: string) {
  switch (type) {
    case 'workout': return Colors.primary;
    case 'achievement': return Colors.xpGold;
    case 'streak': return Colors.accent;
    case 'milestone': return Colors.success;
    default: return Colors.textMuted;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'workout': return 'fitness';
    case 'achievement': return 'trophy';
    case 'streak': return 'flame';
    case 'milestone': return 'star';
    default: return 'ellipse';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title: { ...Typography.displaySmall, color: Colors.text },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  upgradeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.xpGold + '20', alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: 3, marginBottom: Spacing.lg },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm, position: 'relative' },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { ...Typography.label, color: Colors.textMuted },
  tabTextActive: { color: Colors.textInverse },
  notifBadge: { position: 'absolute', top: 2, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  notifText: { ...Typography.labelSmall, color: '#fff', fontSize: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text, paddingVertical: Spacing.md },
  postInput: { marginBottom: Spacing.lg },
  postRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Typography.labelLarge, color: Colors.primary },
  input: { flex: 1, ...Typography.body, color: Colors.text, minHeight: 40 },
  postActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.sm },
  feedCard: { marginBottom: Spacing.md },
  feedHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  feedAuthor: { ...Typography.labelLarge, color: Colors.text },
  feedTime: { ...Typography.labelSmall, color: Colors.textMuted },
  feedTypeBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  feedContent: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.sm, lineHeight: 22 },
  feedMeta: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  feedMetaText: { ...Typography.labelSmall, color: Colors.primary },
  feedFooter: { flexDirection: 'row', gap: Spacing.lg },
  feedAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  feedActionText: { ...Typography.labelSmall, color: Colors.textMuted },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.sm },
  requestCard: { marginBottom: Spacing.sm },
  requestActions: { flexDirection: 'row', gap: Spacing.sm },
  acceptBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.success + '20', alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.error + '20', alignItems: 'center', justifyContent: 'center' },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyTitle: { ...Typography.h3, color: Colors.text, marginTop: Spacing.md },
  emptyText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  friendCard: { marginBottom: Spacing.sm },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  friendAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '30', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  friendAvatarText: { ...Typography.h3, color: Colors.primary },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.background },
  friendName: { ...Typography.labelLarge, color: Colors.text },
  friendSub: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  searchResult: { marginBottom: Spacing.sm },
  leaderboardCard: { marginBottom: Spacing.md },
  leaderboardTitle: { ...Typography.labelLarge, color: Colors.textMuted, marginBottom: Spacing.md },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rankBadge: { ...Typography.h2, color: Colors.xpGold },
  rankName: { ...Typography.labelLarge, color: Colors.text },
  rankSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm },
  lbRowUser: { backgroundColor: Colors.primary + '10', marginHorizontal: -Spacing.md, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.sm },
  lbRank: { ...Typography.labelLarge, color: Colors.textMuted, width: 24 },
  lbAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  lbAvatarText: { ...Typography.label, color: Colors.primary },
  lbName: { ...Typography.label, color: Colors.text },
  lbSub: { ...Typography.labelSmall, color: Colors.textMuted },
  lbXP: { ...Typography.label, color: Colors.xpGold },
});
