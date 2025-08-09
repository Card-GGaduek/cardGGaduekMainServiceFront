<template>
  <div class="qr-wrapper">
    <div class="qr-container">
      <p class="qr-text">QR 코드를 스캔하여<br />결제해주세요</p>

      <div class="qr-box" v-if="qrImage">
        <img :src="qrImage" alt="QR 코드" class="qr-img" />
      </div>
      <p v-else>QR 코드 생성 중...</p>

      <div class="timer">
        {{ minutes }}:{{ seconds.toString().padStart(2, '0') }}
        <span @click="regenerateQRCode" class="reload">🔄</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';

const userStore = useUserStore();
userStore.setUser(7);

const memberId = userStore.memberId;
const cardId = userStore.selectedCardId;

const qrImage = ref('');
const minutes = ref(2);
const seconds = ref(59);
let timerInterval = null;

const generateQRCode = async () => {
  try {
    const response = await axios.post(
      'http://localhost:8080/api/payment/qr',
      { memberId, cardId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    qrImage.value = response.data.data;
  } catch (error) {
    console.error('QR 생성 실패:', error);
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

onMounted(() => {
  generateQRCode();
  startTimer();
});
</script>

<style scoped>
.qr-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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

.reload {
  cursor: pointer;
  font-size: 1.1rem;
}
</style>
