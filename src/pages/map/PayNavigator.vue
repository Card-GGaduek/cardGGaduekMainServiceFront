<template>
 <div class="bottom-sheet-container">
    <div class="bottom-sheet-content">
        <button class="close-button" @click="$emit('close')">&times;</button>
        <h2 class="navigator-title">Pay Navigator</h2>

        <div class="info">
            <p>선택한 매장 : <strong>{{ selectedMerchant?.name }}</strong></p>
            <p>선택한 카드 : <strong>{{ selectedCard?.cardProductName }}</strong></p>
        </div>

        <div class="discount-form">
            <input v-model.number="inputAmount"
                type="number"
                class="amount-input"
                placeholder="매장에서 사용할 금액을 입력해 주세요"
                />
                <button class="calculator-button" @click="calculatorDiscount">할인 금액 계산</button>
                <p v-if="discountedAmount !== null" class="result">
                    할인 적용 후 예상 결제 금액은 <strong>{{ discountedAmount }}원</strong> 입니다.</p>
        </div>
    </div>
 </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    selectedCard: {
        type: Object,
    },
    selectedMerchant: {
        type: Object,
    }
});

const emit = defineEmits(['close']);
const inputAmount = ref(0);
const discountedAmount = ref(null);

const calculatorDiscount = () => {
    // 현재 선택된 카드 기준으로 해당 매장 혜택 필터
    const benefit = props.selectedMerchant.benefits.find(
        (b) => b.cardName === props.selectedCard?.cardProductName
    );

    if (!benefit) {
        alert('선택한 카드에 적용 가능한 혜택이 없습니다');
        return;
    }

    const {rateValue, amountValue} = benefit;
    const original = inputAmount.value;
    let result = original;
    
    

    if(rateValue) {
        // 비율 할인
        result = original - (original * rateValue) /100;
    } else if (amountValue) {
        // 정액 할인
        result = original - amountValue;
    } else {
        result = original;
    }
    discountedAmount.value = Math.max(0,Math.round(result));
    }
</script>

<style>
.navigator-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}
.amount-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.calculater-button {
  width: 100%;
  background-color: #ffcd39;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
}
.result {
  margin-top: 16px;
  font-size: 16px;
}

</style>