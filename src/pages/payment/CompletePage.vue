<template>
  <div class="payment-complete-container">
    <!-- 기존 subheader 컴포넌트 사용 -->
    <SubHeader  @back="goBack" />

    <!-- 메인 컨텐츠 -->
    <div class="main-content">
      <!-- 성공 아이콘 -->
      <div class="success-icon">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="30" fill="#ffcd39"/>
          <path d="M18 30L26 38L42 22" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- 완료 메시지 -->
      <h2 class="completion-title">예약이 완료되었습니다</h2>
      <p class="completion-message">
        예약내용은 홈 > 마이페이지 > 예약 내역에서<br>
        화깅ㄴ하실 수 있습니다.
      </p>

      <!-- 완료 버튼 -->
      <button class="complete-button" @click="goToHome">
        메인으로 돌아가기
      </button>
    </div>
  </div>
</template>

<script>
import SubHeader from '@/layout/SubHeader.vue';

export default {
  name: 'PaymentComplete',
  components: {
    SubHeader,
    NavBar
  },
  methods: {
    goBack() {
      // 뒤로가기 기능
      this.$router.go(-1);
    },
    goToHome() {
      // 홈으로 이동
      this.$router.push('/');
    }
  },
  mounted() {
    // 페이지 로드 시 성공 애니메이션 등 추가 가능
    console.log('Payment completed successfully');
  }
}
</script>

<style scoped>
.payment-complete-container {
  min-height: 100%;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.success-icon {
  margin-bottom: 30px;
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.completion-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}

.completion-message {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 40px 0;
}

.complete-button {
  background-color: #ffcd39;
  border: none;
  border-radius: 8px;
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 200px;
}

.complete-button:hover {
  background-color: #f5c32f;
}

.complete-button:active {
  transform: translateY(1px);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .completion-title {
    font-size: 20px;
  }

  .completion-message {
    font-size: 13px;
  }

  .complete-button {
    padding: 14px 30px;
    font-size: 15px;
    min-width: 180px;
  }
}
</style>