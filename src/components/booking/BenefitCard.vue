<script setup>
import { computed } from "vue";

// props 정의: benefit 객체와 isTravelCategory 여부를 받습니다.
const props = defineProps({
  benefit: {
    type: Object,
    required: true,
  },
  isTravelCategory: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["book"]);

// 카드를 클릭했을 때의 동작
function handleClick() {
  if (props.isTravelCategory) {
    emit("book", props.benefit); // '여행' 카테고리면 'book' 이벤트 발생
  } else {
    // 그 외 카테고리는 링크가 있을 경우 새 탭으로 열기
    if (props.benefit.linkUrl) {
      window.open(props.benefit.linkUrl, '_blank');
    }
  }
}

// '예상 혜택 금액' 계산 로직
const calculatedDiscountAmount = computed(() => {
  // 백엔드에서 받은 benefit 객체 안의 price를 기준 금액으로 사용
  const basePrice = props.benefit.price;

  if (!basePrice || basePrice === 0) {
    return 0;
  }
  
  // [수정] 'PERCENT' -> 'RATE' 로 변경하여 백엔드와 일치시킴
  if (props.benefit.valueType === 'PERCENT' && props.benefit.rateValue) {
    return Math.floor(basePrice * (props.benefit.rateValue / 100));
  } else if (props.benefit.valueType === 'AMOUNT' && props.benefit.amountValue) {
    return props.benefit.amountValue;
  }

  return 0;
});

// 숫자 포맷팅 함수
function formatAmount(amount) {
  if (amount === null || amount === undefined) return '';
  return amount.toLocaleString('ko-KR');
}
</script>

<template>
  <div class="card benefit-card mb-3" @click="handleClick">
    <div class="card-body d-flex align-items-center">
      <img :src="benefit.imageUrl" class="rounded me-3 benefit-image" alt="Benefit Image" />
      <div class="flex-grow-1">
        <p class="card-text small mb-2">
          보유하신 {{ benefit.cardName }}로 {{ benefit.title }}에서
          <span class="text-highlight fw-bold">
            <span v-if="benefit.valueType === 'PERCENT'">최대 {{ benefit.rateValue }}% 할인</span>
            <span v-else-if="benefit.valueType === 'AMOUNT'">최대 {{ formatAmount(benefit.amountValue) }}원 할인</span>
          </span>
          을 받을 수 있습니다.
        </p>

        <p v-if="calculatedDiscountAmount > 0" class="card-text small mb-2 fw-bold">
          예상 혜택 금액 : {{ formatAmount(calculatedDiscountAmount) }}원
          
        </p>
        <a
          v-if="isTravelCategory"
          href="#"
          @click.prevent 
          class="stretched-link text-decoration-none text-muted small"
        >
          예약하기 <i class="bi bi-chevron-right"></i>
        </a>
        <a
          v-else
          :href="benefit.linkUrl || '#'"
          target="_blank"
          @click.stop
          class="stretched-link text-decoration-none text-muted small"
        >
          자세히 보기 <i class="bi bi-chevron-right"></i>
        </a>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
.benefit-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}
.benefit-card:hover {
  transform: translateY(-5px);
}
.benefit-card img {
  width: 80px;
  height: 80px;
  object-fit: cover;
}
.text-highlight {
  color: #ff9900;
}
</style>