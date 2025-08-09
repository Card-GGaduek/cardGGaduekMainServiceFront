<template>
  <div class="bottom-sheet-container">
    <div class="bottom-sheet-content">
      <div class="sheet-handle" role="presentation" aria-hidden="true"></div>
      <button class="close-button" @click="$emit('close')">&times;</button>
      <h2 class="navigator-title">페이 네비게이터</h2>

      <div class="info">
        <p>
          선택한 매장 : <strong>{{ selectedMerchant?.name }}</strong>
        </p>
        <p>
          선택한 카드 : <strong>{{ selectedCard?.cardProductName }}</strong>
        </p>
      </div>

      <div class="discount-form">
        <input
          v-model.number="inputAmount"
          type="number"
          class="amount-input"
          placeholder="매장에서 사용할 금액을 입력해 주세요"
        />
        <button class="calculator-button" @click="calculatorDiscount">
          할인 금액 계산
        </button>
        <div class="discount-result">
          <p v-if="discountedAmount !== null" class="result">
            할인 적용 후 예상 결제 금액은
            <strong>{{ discountedAmount }}원</strong> 입니다.
          </p>
          <button
            v-if="discountedAmount !== null"
            class="payment-button"
            @click="handlePayment"
          >
            <img
              :src="quickPay"
              alt="결제하기"
              class="payment"
              @click="goToPayment"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import quickPay from '@/assets/images/pay/quickpay.png';
import { useRouter } from 'vue-router';

const props = defineProps({
  selectedCard: {
    type: Object,
  },
  selectedMerchant: {
    type: Object,
  },
});

const emit = defineEmits(['close']);
const inputAmount = ref(0);
const discountedAmount = ref(null);
const router = useRouter();

const calculatorDiscount = () => {
  // 현재 선택된 카드 기준으로 해당 매장 혜택 필터
  const benefit = props.selectedMerchant.benefits.find(
    (b) => b.cardName === props.selectedCard?.cardProductName
  );

  if (!benefit) {
    alert('선택한 카드에 적용 가능한 혜택이 없습니다');
    return;
  }

  const { rateValue, amountValue } = benefit;
  const original = inputAmount.value;
  let result = original;

  if (rateValue) {
    // 비율 할인
    result = original - (original * rateValue) / 100;
  } else if (amountValue) {
    // 정액 할인
    result = original - amountValue;
  } else {
    result = original;
  }
  discountedAmount.value = Math.max(0, Math.round(result));
};

// 결제 페이지로 이동
const goToPayment = () => {
  router.push('/payment/qr');
};
</script>

<style>
/* 드래그 핸들 */
.sheet-handle {
  animation: sheetPulse 2.4s ease-in-out infinite;
}
@keyframes sheetPulse {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.95;
  }
  50% {
    transform: translateY(1px);
    opacity: 0.85;
  }
}
.sheet-handle {
  position: relative;
  margin: 4px auto 12px;
  width: 44px;
  height: 6px;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    var(--grad-start, #ffd43b),
    var(--grad-end, #ff6b6b)
  );
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  opacity: 0.95;
}
.bottom-sheet-content {
  padding: 10px 10px 20px;
}
.navigator-title {
  font-size: 22px;
  font-weight: bold;
  color: #ff6b6b;
  margin-bottom: 16px;
  text-align: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  color: #ff6b6b;
  float: right;
  cursor: pointer;
}

.info p strong {
  font-size: 14px;
  margin: 4px 0;
  color: #ff6b6b;
}

.amount-input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  /* margin-top: 12px; */
  border: none;
  border-radius: 12px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}

.calculator-button {
  width: 100%;
  background: linear-gradient(90deg, #ffd43b, #ff6b6b);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: bold;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.calculator-button:hover {
  background: linear-gradient(90deg, #ffc107, #ff5252);
}

.discount-result {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.result strong {
  font-size: 16px;
  color: #ff6b6b;
  font-weight: 500;
}

.payment-button {
  background: none;
  border: none;
}

.payment {
  background: white;
  border-radius: 50%;
  padding: 10px;
  width: 60px;
  height: 60px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.payment:hover {
  transform: scale(1.05);
}

.payment img {
  width: 32px;
  height: 32px;
}
</style>
