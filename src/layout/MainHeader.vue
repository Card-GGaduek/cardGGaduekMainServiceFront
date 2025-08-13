<template>
  <header class="d-flex justify-content-between align-items-center py-2 px-4">
    <!-- 왼쪽: 로고 이미지 (텍스트 포함된 이미지) -->
    <div>
      <img src="@/assets/logo/logo.jpg" alt="카드까득 로고" class="logo-img" />
    </div>

    <!-- 오른쪽: 알림 아이콘 (메인 페이지일 때만 표시) -->
    <div v-if="showNotification" class="position-relative">
      <img
        src="@/assets/icons/notification-bell.png"
        alt="알림"
        class="notification-icon"
        @click="goToNotification"
      />
      <span class="notification-badge">N</span>
    </div>

    <div v-if="userName" class="d-flex align-items-center">
      <span class="fw-bold me-2">{{ userName }}님</span>
      <i class="bi bi-person-circle fs-2"></i>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps({
  showNotification: {
    type: Boolean,
    default: false,
  },
  userName: {
    type: String,     // 데이터 타입은 문자열(String)
    required: true    // 이 prop은 필수 값임
    // default: '고객' // required: false일 경우 기본값을 설정할 수 있습니다.
  },
});

const goToNotification = () => {
  router.push('/notification');
};
</script>

<style scoped>
.logo-img {
  height: 32px;
}

.notification-icon {
  height: 30px;
  width: auto;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background-color: #ff007f;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 50%;
  font-weight: bold;
}
</style>
