<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import memberApi from '@/api/memberApi';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  try {
    const result = await memberApi.getMyInfo();
    myPageInfo.email = result.email;
    myPageInfo.name = result.name;
    myPageInfo.bookingList = result.bookingList;
  } catch (e) {
    alert(e.message);
  }
});
// API를 통해 받아올 사용자 정보를 담을 반응형 객체
const myPageInfo = reactive({
  bookingList: [],
});

// 각 예약의 상세 정보 펼침/접힘 상태를 토글하는 함수
const toggleDetails = (booking) => {
  booking.isExpanded = !booking.isExpanded;
};

// onMounted: 컴포넌트가 로드될 때 실행
onMounted(async () => {
  try {
    // 실제 API 연동 시 아래 주석을 해제하고, 하단의 목업 데이터 부분을 삭제하세요.
    // const result = await memberApi.getMyInfo();
    // const bookingsFromApi = result.bookingList || [];

    // --- 테스트를 위한 목업(Mockup) 데이터 시작 ---
    const bookingsFromApi = result.bookingList || []; 
    // --- 테스트를 위한 목업 데이터 끝 ---


    // API에서 받은 데이터에 isExpanded 상태를 추가하여 반응형으로 관리
    myPageInfo.bookingList = bookingsFromApi.map(booking => ({
      ...booking,
      isExpanded: false, // 모든 카드를 초기에 접힌 상태로 설정
    }));

  } catch (e) {
  }
});
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <button class="back-button">&larr;</button>
      <h1 class="page-title">내 예약내역</h1>
      <div class="placeholder"></div>
    </header>

    <main class="content-area">
      <div v-if="myPageInfo.bookingList.length === 0" class="empty-message">
        <p>예약 내역이 없습니다.</p>
      </div>
      
      <div v-else>
        <div v-for="booking in myPageInfo.bookingList" :key="booking.id" class="booking-card">
          <div class="summary-view">
            <img :src="booking.imageUrl" alt="예약 이미지" class="thumbnail-image" />
            <div class="info-area">
              <span class="booking-title">{{ booking.accommodationName }}</span>
              <a @click.prevent="toggleDetails(booking)" class="details-link">
                {{ booking.isExpanded ? '상세정보 닫기' : '예약정보 보기' }} &rsaquo;
              </a>
            </div>
          </div>

          <transition name="slide-fade">
            <div v-if="booking.isExpanded" class="details-view">
              <ul>
                <li><strong>예약 상태:</strong> {{ booking.status === 'CONFIRMED' ? '예약 완료' : '예약 대기' }}</li>
                <li><strong>이름:</strong> {{ booking.name }}</li>
                <li><strong>핸드폰:</strong> {{ booking.phone }}</li>
                <li><strong>이메일:</strong> {{ booking.email }}</li>
                <li><strong>체크인:</strong> {{ booking.checkInDate }}</li>
                <li><strong>체크아웃:</strong> {{ booking.checkOutDate }}</li>
                <li><strong>숙소 이름:</strong> {{ booking.accommodationName }}</li>
                <li><strong>방 이름:</strong> {{ booking.roomName }}</li>
                <li><strong>결제 금액:</strong> {{ booking.totalPrice }}원</li>
                <li><strong>요청사항:</strong> {{ booking.requestText }}</li>
                <li><strong>예약시간:</strong> {{ booking.bookedAt }}</li>
                <li><strong>주소:</strong> {{ booking.address }}</li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 전체 페이지 컨테이너 */
.page-container {
  max-width: 420px;
  margin: 0 auto;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
}
.back-button { font-size: 24px; background: none; border: none; cursor: pointer; }
.page-title { font-size: 18px; font-weight: bold; margin: 0; }
.placeholder { width: 24px; }

/* 메인 콘텐츠 영역 */
.content-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px 15px;
}
.empty-message { text-align: center; color: #888; padding-top: 50px; }

/* 예약 카드 */
.booking-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden; /* transition을 위해 추가 */
}

/* 요약 정보 뷰 */
.summary-view {
  display: flex;
  align-items: center;
  padding: 15px;
}
.thumbnail-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
}
.info-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.booking-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
}
.details-link {
  font-size: 14px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

/* 상세 정보 뷰 */
.details-view {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #f0f0f0;
  margin: 10px 15px 0 15px;
}
.details-view ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  color: #333;
}
.details-view li {
  margin-top: 10px;
}
.details-view li strong {
  color: #555;
  margin-right: 8px;
}

/* 펼치기/접기 애니메이션 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>