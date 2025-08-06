<template>
  <div class="notification-page">
    <!-- 상단 헤더 -->
    <div class="fixed-header">
      <SubHeader title="알림" />
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">알림을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ errorMessage }}</p>
      <button class="retry-btn" @click="fetchNotifications">다시 시도</button>
    </div>

    <!-- 알림 카드 리스트 -->
    <div v-else-if="notifications.length > 0" class="notification-list">
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

    <!-- 알림이 없는 경우 -->
    <div v-else class="no-notifications">
      <div class="no-notifications-icon">🔔</div>
      <p class="no-notifications-text">새로운 알림이 없습니다</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SubHeader from '@/layout/SubHeader.vue'
import { getMyNotifications } from '@/api/notificationApi'

const notifications = ref([])
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')

const fetchNotifications = async () => {
  loading.value = true
  error.value = false
  errorMessage.value = ''

  try {
    const res = await getMyNotifications()
    notifications.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('알림 불러오기 실패:', err)
    error.value = true

    // 더 구체적인 에러 처리
    if (err.response?.status === 404) {
      errorMessage.value = 'API 엔드포인트를 찾을 수 없습니다. 백엔드 설정을 확인해주세요.'
    } else if (err.response?.status === 401) {
      errorMessage.value = '로그인이 필요합니다.'
      // 로그인 페이지로 리다이렉트 로직 추가 가능
      // router.push('/login')
    } else if (err.response?.status >= 500) {
      errorMessage.value = '서버에 문제가 발생했습니다.'
    } else if (err.code === 'ECONNABORTED') {
      errorMessage.value = '서버 응답이 지연되고 있습니다.'
    } else if (err.message === '사용자 정보를 가져올 수 없습니다.') {
      errorMessage.value = '사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.'
    } else {
      errorMessage.value = '알림을 불러오는데 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notification-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 0;
  padding-bottom: 80px;
}

/* 헤더 고정 */
.fixed-header {
  position: sticky;
  top: 0;
  z-index: 999;
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffd559;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 에러 상태 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.error-text {
  color: #dc3545;
  font-size: 14px;
  margin: 0 0 16px 0;
  max-width: 300px;
  line-height: 1.4;
}

.retry-btn {
  background-color: #ffd559;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background-color: #f4c025;
  transform: translateY(-1px);
}

/* 알림 없음 상태 */
.no-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.no-notifications-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-notifications-text {
  color: #666;
  font-size: 16px;
  margin: 0;
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
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.notification-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* 제목 */
.message {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

/* 본문 메시지 */
.description {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

/* 이미지 */
.notification-image {
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.notification-image:hover {
  transform: scale(1.02);
  filter: brightness(1.05);
}
</style>