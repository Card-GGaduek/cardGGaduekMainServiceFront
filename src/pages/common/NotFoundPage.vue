<template>
  <div class="notfound-page">
    <div class="container page-container p-0">
      <!-- 헤더 -->
      <header class="top-header d-flex align-items-center px-3 py-2">
        <button @click="goBack" class="btn border-0 p-0 text-dark" aria-label="뒤로가기">
          <i class="bi bi-arrow-left fs-4"></i>
        </button>
      </header>

      <!-- 본문 -->
      <main class="notfound-content px-4 pb-5">
        <!-- 일러스트 -->
        <div class="nf-illustration my-3" aria-hidden="true">
          <!-- 간단한 인라인 SVG (외부 의존성 없음) -->
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="12" y="24" width="136" height="72" rx="10" fill="white" stroke="#e9ecef" />
            <circle cx="36" cy="48" r="8" fill="#ffd559"/>
            <rect x="52" y="43" width="64" height="10" rx="5" fill="#f1f3f5"/>
            <rect x="24" y="66" width="112" height="12" rx="6" fill="#f8f9fa"/>
            <path d="M65 96 C80 84, 100 84, 115 96" stroke="#ffe8a1" stroke-width="6" stroke-linecap="round"/>
            <text x="80" y="80" text-anchor="middle" font-size="20" fill="#adb5bd">404</text>
          </svg>
        </div>

        <h1 class="nf-title">페이지를 찾을 수 없어요</h1>
        <p class="nf-desc">
          요청하신 페이지가 이동되었거나 삭제되었어요.<br />
          주소를 다시 확인하시거나 홈으로 이동해 주세요.
        </p>

        <p v-if="currentPath" class="nf-path" aria-label="요청 경로">
          요청 경로: <code>{{ currentPath }}</code>
        </p>

        <div class="nf-actions mt-3">
          <button class="btn btn-primary nf-btn" @click="goHome">
            <i class="bi bi-house-door me-1"></i> 메인으로 가기
          </button>
          <button class="btn btn-outline nf-btn" @click="reload">
            <i class="bi bi-arrow-repeat me-1"></i> 새로고침
          </button>
        </div>

        <ul class="nf-tips mt-4">
          <li>주소 철자를 다시 확인해 주세요.</li>
          <li>메인에서 원하는 메뉴를 선택해 주세요.</li>
        </ul>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const currentPath = computed(() => {
  try {
    return decodeURI(route.fullPath || '');
  } catch {
    return route.fullPath || '';
  }
});

const goHome = () => {
  router.replace('/');
};

const reload = () => {
  window.location.reload();
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace('/');
  }
};
</script>

<style scoped>
.notfound-page {
  background-color: #f8f9fa;
  min-height: 100%;
}

.page-container {
  max-width: 420px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-header {
  background-color: #f8f9fa;
  border: none;
}

.notfound-content {
  text-align: center;
}

.nf-title {
  font-size: 20px;
  font-weight: 800;
  margin-top: 4px;
  color: #212529;
}

.nf-desc {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0;
  line-height: 1.5;
}

.nf-path {
  margin-top: 10px;
  font-size: 12px;
  color: #868e96;
  word-break: break-all;
}

.nf-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.nf-btn {
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
}

.btn-primary.nf-btn {
  background-color: #ffcd39;
  border: none;
  color: #000;
  box-shadow: 0 3px 8px rgba(255, 213, 89, 0.35);
}

.btn-primary.nf-btn:hover {
  background-color: #ffcd39;
  transform: translateY(-1px);
}

.btn-outline.nf-btn {
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
}

.nf-illustration {
  display: flex;
  justify-content: center;
}

.nf-tips {
  list-style: disc;
  text-align: left;
  padding-left: 24px;
  color: #868e96;
  font-size: 13px;
}

code {
  background: #fff3bf;
  border-radius: 4px;
  padding: 2px 6px;
}
</style>
