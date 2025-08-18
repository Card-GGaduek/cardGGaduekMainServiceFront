<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import memberApi from '@/api/memberApi';
import MainHeader from '@/layout/MainHeader.vue';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  try {
    const result = await memberApi.getMyInfo();
    myPageInfo.email = result.email;
    myPageInfo.name = result.name;
    myPageInfo.couponList = result.couponList;
  } catch (e) {
    alert(e.message);
  }
});

// onMounted(async () => {
//   const code = route.query.code;
//   const receivedState = route.query.state;

//   console.log(code);
//   console.log(receivedState);

//   if (!code || !receivedState) {
//     alert('로그인 처리 중 오류가 발생했습니다.');
//     router.push('/');
//     return;
//   }

//   const savedState = sessionStorage.getItem('naver_oauth_state');
//   if (savedState !== receivedState) {
//     alert('State 값이 일치하지 않습니다. CSRF 공격 가능성 있음.');
//     router.push('/');
//     return;
//   }

//   try {
//     // Spring Legacy 서버의 네이버 로그인 처리 endpoint로 요청
//     const result = await authApi.naverLogin(code, receivedState);
//     authStore.login(result);
//     router.push('/');
//   } catch (error) {
//     console.error('네이버 로그인 처리 실패:', error.message);
//     alert('로그인 처리에 실패했습니다.');
//     router.push('/login');
//   }
// });

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.logout(); // 상태에서 로그아웃 처리
    router.push('/login'); // 로그아웃 후 로그인 페이지 등으로 이동(원하는 라우트로)
  }
};

const myPageInfo = reactive({
  name: '',
  email: '',
  phone: '',
  couponList: [],
});

const appSettings = ref({
  appLock: false,
  faceId: true,
});

const goToMyCoupons = () => {
  router.push({ name: 'MyCouponPage'});
};

const goToMyBooking = () => {
  router.push({name: 'MyBookingPage'});
};

const goToMyCards = () => {
  router.push({ name: 'MyCardPage'});
};
</script>

<template>
  <MainHeader :user-name="myPageInfo.name"/>
  <div class="page-container">
    <!-- <header class="d-flex justify-content-between align-items-center p-3">
      <img src="@/assets/logo/logo.jpg" alt="카드까득 로고" class="logo-img" />
      <div class="d-flex align-items-center">
        <span class="fw-bold me-2">{{ myPageInfo.name }}님</span>
        <i class="bi bi-person-circle fs-2"></i>
      </div>
    </header> -->
    
    <main class="scrollable-content">
      <div class="d-flex text-center mb-4">
        <div class="card info-box flex-fill ms-2">
          <div class="card-body" @click="goToMyCoupons">
            <h4 class="fw-bold mb-0">{{ myPageInfo.couponList.length }}</h4>
            <span class="small text-muted" >보유 쿠폰</span>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body d-flex align-items-center">
          <i class="bi bi-headset fs-1 text-warning me-3"></i>
          <div>
            <p class="mb-1">궁금한 점이 있으신가요?</p>
            <a href="#" class="fw-bold text-decoration-none text-dark"
              >고객센터에 상담해보세요</a
            >
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header fw-bold bg-white">내 서비스</div>
        <ul class="list-group list-group-flush">
          <li
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span><i class="bi bi-person-vcard-fill me-2"></i>내 정보</span>
          </li>
          <li class="list-group-item" @click="goToMyCards">
            <i class="bi bi-credit-card-fill me-2"></i>내 카드
          </li>
          <li class="list-group-item" @click="goToMyBooking">
            <i class="bi bi-calendar-check-fill me-2"></i>예약 내역
          </li>
          <li class="list-group-item">
            <i class="bi bi-receipt-cutoff me-2"></i>구매 내역
          </li>
        </ul>
      </div>

      <div class="card mb-4">
        <div class="card-header fw-bold bg-white">앱 설정</div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <i class="bi bi-shield-lock-fill me-2"></i>개인정보 처리 방침
          </li>
          <li class="list-group-item">
            <i class="bi bi-file-text-fill me-2"></i>서비스 이용약관
          </li>
          <li
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span><i class="bi bi-lock-fill me-2"></i>앱 잠금</span>
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                v-model="appSettings.appLock"
              />
            </div>
          </li>
          <li
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span
              ><i class="bi bi-person-bounding-box me-2"></i>FACE ID 사용</span
            >
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                v-model="appSettings.faceId"
              />
            </div>
          </li>
        </ul>
      </div>

      <div class="text-center my-4">
        <a href="#" class="text-muted small" @click.prevent="handleLogout"
          >로그아웃</a
        >
        <span class="text-muted small mx-2">|</span>
        <a href="#" class="text-muted small">탈퇴하기</a>
      </div>
    </main>

    <footer class="bottom-nav"></footer>
  </div>
</template>

<style scoped>
/* 스타일 ... */
.logo-img{
  height: 32px;
}
.page-container {
  max-width: 420px;
  margin: 0 auto;
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 1rem;
}
.info-box {
  border: 1px solid black;
  border-radius: 12px;
}
.card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.card-header {
  border-bottom: 1px solid black;
}
.list-group-item {
  display: flex;
  align-items: center;
  cursor: pointer; /* 👈 추가 */

}
.list-group-item i {
  color: #6c757d;
}
</style>
