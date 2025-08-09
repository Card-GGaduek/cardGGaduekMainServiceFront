<script setup>
import { reactive, onMounted } from 'vue';
// import { useAuthStore } from '@/stores/auth'; // 현재 코드에서는 직접 사용되지 않음
// import { useRouter } from 'vue-router'; // 현재 코드에서는 직접 사용되지 않음
import memberApi from '@/api/memberApi';
import router from '@/router';

// 1. myPageInfo 상태 변수 선언
// reactive를 사용하여 객체 내부의 속성들이 변경될 때 화면이 자동으로 업데이트되도록 합니다.
const myPageInfo = reactive({
  couponList: [], // 쿠폰 목록은 초기에 빈 배열로 설정합니다.
});

// 2. onMounted 라이프사이클 훅 사용
// 컴포넌트가 화면에 마운트(생성)된 직후에 실행될 로직을 정의합니다.
onMounted(async () => {
  try {
    // 3. API 호출
    // memberApi를 통해 서버에 내 정보(쿠폰 포함)를 비동기적으로 요청합니다.
    const result = await memberApi.getMyInfo();

    // 4. 상태 업데이트
    // API로부터 받은 결과(result)를 사용하여 myPageInfo 상태를 업데이트합니다.
    // 이 값이 변경되면 <template>에 바인딩된 부분도 자동으로 갱신됩니다.
    myPageInfo.email = result.email;
    myPageInfo.name = result.name;
    myPageInfo.couponList = result.couponList;
  } catch (e) {
    // 5. 예외 처리
    // API 호출 중 오류가 발생하면 사용자에게 알림창을 띄웁니다.
    console.error('내 정보를 가져오는 데 실패했습니다:', e);
    alert('정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
});
</script>
<template>
  <div class="pt-4 logo-container">
    <img src="@/assets/logo/logo.jpg" alt="카드까득 로고" class="logo-img" />
  </div>

  <header class="page-header pt-4 mb-4">
    <button @click="router.back()" class="back-button">&larr;</button>
    <h1 class="page-title">내 쿠폰함</h1>
    <div class="placeholder"></div>
  </header>

  <main class="coupon-list-container">
    <div v-if="myPageInfo.couponList.length === 0" class="empty-message">
      <p>텅 비었어요!</p>
      <p>보유한 쿠폰이 없습니다.</p>
    </div>

    <div v-else>
      <div
        v-for="coupon in myPageInfo.couponList"
        :key="coupon.id"
        class="coupon-card"
      >
        <div v-if="coupon.couponCategory === 'FOOD'">
          <div class="coupon-icon">{{ coupon.icon || '☕️' }}</div>
        </div>
        <div v-else-if="coupon.couponCategory === 'SHOPPING'">
          <div class="coupon-icon">{{ coupon.icon || '🛒' }}</div>
        </div>
        <div v-else-if="coupon.couponCategory === 'TRAVEL'">
          <div class="coupon-icon">{{ coupon.icon || '🧳' }}</div>
        </div>
        <div v-else-if="coupon.couponCategory === 'CULTURE'">
          <div class="coupon-icon">{{ coupon.icon || '🎡' }}</div>
        </div>
        <div v-else-if="coupon.couponCategory === 'TRANSPORT'">
          <div class="coupon-icon">{{ coupon.icon || '🚀' }}</div>
        </div>
        <div v-else-if="coupon.couponCategory === 'MEDICAL'">
          <div class="coupon-icon">{{ coupon.icon || '🏥' }}</div>
        </div>
        <div class="coupon-details">
          <p class="coupon-title">{{ coupon.couponName }}</p>
          <p class="coupon-expiry">~ {{ coupon.expiredAt }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.logo-container {
  padding-left: 1rem; /* 이 부분을 추가하여 내부 요소를 가운데 정렬합니다. */
}

/* 로고 헤더 */
.logo-img {
  height: 32px;
  background-color: white;
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.back-button {
  font-size: 24px;
  font-weight: bold;
  background: none;
  border: none;
  cursor: pointer;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.placeholder {
  width: 24px; /* 뒤로가기 버튼과 너비를 맞추어 제목을 중앙에 배치 */
  background-color: white;
}

/* 쿠폰 목록 컨테이너 */
.coupon-list-container {
  padding: 20px 15px;

  background-color: white;
}

/* 개별 쿠폰 카드 */
.coupon-card {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 15px;

  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.coupon-icon {
  font-size: 36px;
  margin-right: 20px;
  width: 50px;
  text-align: center;
}

.coupon-details {
  display: flex;
  flex-direction: column;
}

.coupon-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.coupon-expiry {
  font-size: 13px;
  color: #888;
  margin: 5px 0 0 0;
}
</style>
