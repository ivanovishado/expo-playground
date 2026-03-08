import type { ExampleApp } from "@/lib/types";

const profileCard: ExampleApp = {
  id: "profile-card",
  name: "Profile Card",
  description:
    "A profile card layout using Image, View, Text, and flexbox styling",
  code: `import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: 'https://github.com/ivanovishado.png' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Ivan Galaviz</Text>
        <Text style={styles.role}>Software Engineer</Text>
        <Text style={styles.bio}>
          Building with coding agents.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>142</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>2.8k</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>891</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  role: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 16,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#f3f4f6',
  },
});
`,
};

export default profileCard;
