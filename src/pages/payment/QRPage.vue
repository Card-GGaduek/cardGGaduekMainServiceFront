<template>
  <div>
    <!-- SubHeader 추가 -->
    <SubHeader />

    <div class="qr-wrapper">
      <div class="qr-container">
        <p class="qr-text">QR 코드를 스캔하여<br />결제해주세요</p>

        <div class="qr-box" v-if="qrImage">
          <img :src="qrImage" alt="QR 코드" class="qr-img" />
        </div>
        <p v-else>QR 코드 생성 중...</p>


        <div class="timer">
          {{ minutes }}:{{ seconds.toString().padStart(2, '0') }}
          <button @click="regenerateQRCode" class="reload-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23 20V14H17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      <div class="timer">
        {{ minutes }}:{{ seconds.toString().padStart(2, '0') }}
        <span @click="regenerateQRCode" class="reload"
          ><i class="bi bi-arrow-clockwise"></i
        ></span>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import SubHeader from '@/layout/SubHeader.vue';
import memberApi from '@/api/memberApi';
import axios from 'axios';


const router = useRouter();
const authStore = useAuthStore();

const memberId = userStore.memberId;
const cardId = userStore.selectedCardId;

const selectedCard = ref(null);
const qrImage = ref('');
const minutes = ref(2);
const seconds = ref(59);
let timerInterval = null;

// URL 쿼리에서 선택된 카드 정보 가져오기 또는 기본 카드 사용
const loadSelectedCard = async () => {
  try {
    const cards = await memberApi.getMyCard();
    console.log('로드된 카드 데이터:', cards);

    if (cards && cards.length > 0) {
      // URL 쿼리에서 cardId가 있으면 해당 카드 사용, 없으면 첫 번째 카드 사용
      const queryCardId = router.currentRoute.value.query.cardId;

      if (queryCardId) {
        selectedCard.value = cards.find(card => card.cardId == queryCardId);
      }

      // 선택된 카드가 없으면 첫 번째 카드 사용
      if (!selectedCard.value) {
        selectedCard.value = cards[0];
      }

      console.log('선택된 카드:', selectedCard.value);
      return true;
    } else {
      console.error('등록된 카드가 없습니다.');
      alert('등록된 카드가 없습니다. 카드를 먼저 등록해주세요.');
      return false;
    }
  } catch (error) {
    console.error('카드 정보 로드 실패:', error);
    alert('카드 정보를 불러오는데 실패했습니다.');
    return false;
  }
};

const generateQRCode = async () => {
  if (!selectedCard.value) {
    console.error('선택된 카드가 없습니다.');
    return;
  }

  try {
    // authStore 또는 여러 방법으로 사용자 ID 가져오기
    let memberId = null;

    // 방법 1: authStore에서 가져오기
    if (authStore.user?.id) {
      memberId = authStore.user.id;
      console.log('authStore에서 사용자 ID 가져옴:', memberId);
    }
    // 방법 2: JWT 토큰에서 추출
    else {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          memberId = parseInt(payload.sub);
          console.log('JWT에서 사용자 ID 추출:', memberId);
        }
      } catch (jwtError) {
        console.error('JWT 파싱 실패:', jwtError);
      }
    }

    // 방법 3: 개발용 임시 값 (최후 수단)
    if (!memberId) {
      console.log('사용자 ID를 가져올 수 없어 임시 값 사용');
      memberId = 7; // 로그에서 확인된 사용자 ID
    }

    const requestData = {
      memberId: memberId,
      cardId: selectedCard.value.cardId
      // timestamp는 백엔드에서 자동 생성
    };

    console.log('QR 코드 생성 요청:', requestData);
    console.log('선택된 카드:', selectedCard.value.cardProductName);

    const response = await axios.post(
        'http://localhost:8080/api/payment/qr',
        requestData,
        { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('QR 코드 생성 응답:', response.data);

    // ApiResponse 구조에 맞게 데이터 추출
    if (response.data.success && response.data.data) {
      qrImage.value = response.data.data;
      console.log('QR 코드 이미지 설정 완료');
    } else {
      console.error('QR 코드 생성 실패:', response.data.message);
      alert('QR 코드 생성에 실패했습니다.');
    }
  } catch (error) {
    console.error('QR 생성 실패:', error);
    if (error.response) {
      console.error('서버 응답:', error.response.data);
      alert(`QR 코드 생성에 실패했습니다: ${error.response.data.message || '서버 오류'}`);
    } else {
      alert('QR 코드 생성에 실패했습니다.');
    }
  }
};

const startTimer = () => {
  minutes.value = 2;
  seconds.value = 59;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (seconds.value === 0) {
      if (minutes.value === 0) {
        clearInterval(timerInterval);
        regenerateQRCode();
        return;
      }
      minutes.value--;
      seconds.value = 59;
    } else {
      seconds.value--;
    }
  }, 1000);
};

const regenerateQRCode = () => {
  generateQRCode();
  startTimer();
};

onMounted(async () => {
  // 선택된 카드 정보를 먼저 로드한 후 QR 코드 생성
  const success = await loadSelectedCard();
  if (success) {
    generateQRCode();
    startTimer();
  }
});
</script>

<style scoped>
.qr-wrapper {
  min-height: calc(100vh - 150px); /* SubHeader 높이를 고려해서 조정 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  overflow: hidden; /* 스크롤 방지 */
}

.qr-container {
  text-align: center;
}

.qr-text {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.qr-box {
  display: inline-block;
  border: 2px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.qr-img {
  width: 100%;
  height: 100%;
  display: block;
}

.timer {
  font-size: 1.1rem;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.reload-button {
  background-color: #ffd559;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reload-button:hover {
  background-color: #f4c025;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.reload-button:active {
  transform: scale(0.95);
}

.reload-button svg {
  animation: none;
}

.reload-button:hover svg {
  animation: spin 0.6s ease-in-out;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>