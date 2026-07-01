import React, { useState } from "react";
import {
  Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from "react-native";
import {
  Activity, Bandage, Bone, ChevronLeft, Flame,
  HeartCrack, HeartPulse, Search, Wind
} from "lucide-react-native";

import firstAidData from "../../data/firstAid.json";

// Map icon name strings from the JSON data to lucide-react-native components
const ICONS = {
  HeartPulse,
  Wind,
  Flame,
  Bandage,
  Activity,
  HeartCrack,
  Bone,
};

export default function FirstAid() {
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredTopics = firstAidData.filter((topic) =>
    topic.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const openTopic = (topic) => {
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const SelectedIcon = selectedTopic ? ICONS[selectedTopic.icon] : null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>First Aid </Text>
          <Text style={styles.headerSubtitle}>Quick guides for emergency situations</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Search color="#6B7280" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search first aid topics..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Topic grid */}
        {filteredTopics.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No first aid topics match your search.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredTopics.map((topic) => {
              const TopicIcon = ICONS[topic.icon];
              return (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => openTopic(topic)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: topic.bgColor }]}>
                    {TopicIcon && <TopicIcon color={topic.iconColor} size={28} />}
                  </View>
                  <Text style={styles.cardTitle}>{topic.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Detail modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        {selectedTopic && (
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <ChevronLeft color="#0A0F2C" size={24} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconCircle, { backgroundColor: selectedTopic.bgColor }]}>
                  {SelectedIcon && <SelectedIcon color={selectedTopic.iconColor} size={40} />}
                </View>
                <Text style={styles.modalTitle}>{selectedTopic.title}</Text>
              </View>

              <Text style={styles.modalSummary}>{selectedTopic.summary}</Text>

              <View style={styles.stepsContainer}>
                {selectedTopic.steps.map((step, index) => (
                  <View key={index} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: "#E8F0FF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0A0F2C",
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0A0F2C",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "rgba(0,102,255,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
    elevation: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0A0F2C",
    textAlign: "center",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "rgba(0,102,255,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
    elevation: 4,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A0F2C",
  },
  modalSummary: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0A0F2C",
    lineHeight: 20,
    marginBottom: 24,
  },
  stepsContainer: {
    gap: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    color: "#0A0F2C",
    lineHeight: 20,
  },
});
