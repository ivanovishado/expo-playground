import type { ExampleApp } from "@/lib/types";

const counter: ExampleApp = {
  id: "counter",
  name: "Counter App",
  description:
    "A simple counter using useState, TouchableOpacity, and StyleSheet",
  code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter</Text>
      <Text style={styles.count}>{count}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.decrement]}
          onPress={() => setCount(count - 1)}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.increment]}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.reset}
        onPress={() => setCount(0)}
      >
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  count: {
    fontSize: 72,
    fontWeight: '800',
    color: '#1a73e8',
    marginBottom: 32,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decrement: {
    backgroundColor: '#ef4444',
  },
  increment: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  reset: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
});
`,
};

export default counter;
