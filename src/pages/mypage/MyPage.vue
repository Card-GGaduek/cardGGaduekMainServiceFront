<script setup>
import { ref } from 'vue';

const user = ref({
  name: '홍길동',
  coupons: 5,
});

const appSettings = ref({
  appLock: false,
  faceId: true,
});
</script>

<template>
  <div class="page-container">
    <header class="d-flex justify-content-between align-items-center p-3">
      <h5 class="fw-bold m-0"><i class="bi bi-cart3 me-1"></i>카드까득</h5>
      <div class="d-flex align-items-center">
        <span class="fw-bold me-2">{{ user.name }}님</span>
        <i class="bi bi-person-circle fs-2"></i>
      </div>
    </header>

    <main class="scrollable-content">
      <div class="d-flex text-center mb-4">
        <div class="card info-box flex-fill ms-2">
          <div class="card-body">
            <h4 class="fw-bold mb-0">{{ user.coupons }}</h4>
            <span class="small text-muted">보유 쿠폰</span>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body d-flex align-items-center">
          <i class="bi bi-headset fs-1 text-warning me-3"></i>
          <div>
            <p class="mb-1">궁금한 점이 있으신가요?</p>
            <a href="#" class="fw-bold text-decoration-none text-dark">고객센터에 상담해보세요</a>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header fw-bold bg-white">내 서비스</div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-person-vcard-fill me-2"></i>내 정보</span>
            <a href="#" class="small text-decoration-none">내 정보 변경 ></a>
          </li>
          <li class="list-group-item"><i class="bi bi-credit-card-fill me-2"></i>내 카드</li>
          <li class="list-group-item"><i class="bi bi-calendar-check-fill me-2"></i>예약 내역</li>
          <li class="list-group-item"><i class="bi bi-receipt-cutoff me-2"></i>구매 내역</li>
        </ul>
      </div>

      <div class="card mb-4">
        <div class="card-header fw-bold bg-white">앱 설정</div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><i class="bi bi-shield-lock-fill me-2"></i>개인정보 처리 방침</li>
          <li class="list-group-item"><i class="bi bi-file-text-fill me-2"></i>서비스 이용약관</li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-lock-fill me-2"></i>앱 잠금</span>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" v-model="appSettings.appLock">
            </div>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-person-bounding-box me-2"></i>FACE ID 사용</span>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" v-model="appSettings.faceId">
            </div>
          </li>
        </ul>
      </div>

      <div class="text-center my-4">
        <a href="#" class="text-muted small">로그아웃</a>
        <span class="text-muted small mx-2">|</span>
        <a href="#" class="text-muted small">탈퇴하기</a>
      </div>
    </main>
    
    <footer class="bottom-nav">
      </footer>
  </div>
</template>

<style scoped>
/* 스타일 ... */
.page-container { max-width: 420px; margin: 0 auto; background-color: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column; }
.scrollable-content { flex-grow: 1; overflow-y: auto; padding: 0 1rem; }
.info-box { border: 1px solid #eee; border-radius: 12px; }
.card { border-radius: 12px; border: none; }
.card-header { border-bottom: 1px solid #f0f0f0; }
.list-group-item { display: flex; align-items: center; }
.list-group-item i { color: #6c757d; }
</style>