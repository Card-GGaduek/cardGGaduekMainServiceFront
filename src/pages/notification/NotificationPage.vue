<template>
  <div class="notification-page">
    <!-- 상단 헤더 -->
    <div class="fixed-header">
      <SubHeader title="알림" />
    </div>

    <!-- 알림 카드 리스트 -->
    <div class="notification-list">
      <div
          class="notification-card"
          v-for="item in notifications"
          :key="item.id"
      >
        <p class="message">{{ item.title }}</p>
        <p class="description">{{ item.message }}</p>
        <a v-if="item.linkUrl" :href="item.linkUrl" target="_blank">
          <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              alt="알림 이미지"
              class="notification-image"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SubHeader from '@/layout/SubHeader.vue'
import { getNotifications } from '@/api/notificationApi'

const notifications = ref([])
const memberId = 1 // 테스트용

const fetchNotifications = async () => {
  try {
    const res = await getNotifications(memberId)
    notifications.value = res.data.data
  } catch (error) {
    console.error('알림 불러오기 실패:', error)
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notification-page {
  background-color: white;
  min-height: 100vh;
  padding-top: 0;
  padding-bottom: 80px;
}

/* 헤더 고정 */
.fixed-header {
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #f4f6fb;
}

/* 알림 카드 리스트 */
.notification-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 개별 카드 */
.notification-card {
  background: white;
  border-radius: 16px;
  padding: 0.7rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

/* 은행명 */
.bank-name {
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 0.25rem;
}

/* 제목 */
.message {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* 본문 메시지 */
.description {
  font-size: 14px;
  color: #444;
  margin-bottom: 0.75rem;
}

/* 이미지 */
.notification-image {
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s ease;
}
.notification-image:hover {
  filter: brightness(1.05);
}
</style>
