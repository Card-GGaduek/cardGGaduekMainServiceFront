<template>
  <div class="wallet-container">
    <button @click="toggleWallet" class="wallet-button">
      <img
        :src="isWalletOpen ? openWalletImg : closeWalletImg"
        alt="지갑 버튼"
        class="wallet-img"
      />
    </button>

    <!-- 부채꼴 카드 드롭다운 -->
    <transition-group name="fan" tag="div" class="fan-card-wrapper">
      <img
        v-for="(card, i) in animatedCards"
        :key="card.cardId"
        :src="card.image"
        class="fan-card"
        :class="{ show: shownCardIds.includes(card.cardId) }"
        :style="fanCardStyle(i, card)"
        @mouseover="hoveredCard = card.cardId"
        @mouseleave="hoveredCard = null"
        @click="handleCardSelection(card)"
      />
    </transition-group>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import closeWalletImg from '@/assets/images/wallet/closeWalletImg.png';
import openWalletImg from '@/assets/images/wallet/openWalletImg.png';

// props
const props = defineProps({
  myCards: {
    type: Array,
    required: true,
  },
  selectedCard: {
    type: Object,
    required: false,
  },
  handleCardClick: {
    type: Function,
    required: true,
  },
});
const emit = defineEmits(['update-message']);

const isWalletOpen = ref(false); // 카드 지갑 열림/닫힘
const animatedCards = ref([]); // 카드 부채꼴 애니메이션
const hoveredCard = ref(null); // 카드 호버하면 떠오름
const shownCardIds = ref([]); // 애니메이션 렌더링 속도 문제 해결용

const toggleWallet = async () => {
  isWalletOpen.value = !isWalletOpen.value;
  animatedCards.value = [];
  shownCardIds.value = [];

  if (isWalletOpen.value) {
    emit('update-message', '내 카드를 클릭하면 혜택 매장을 찾아드립니다!');
    for (let i = 0; i < props.myCards.length; i++) {
      const card = props.myCards[i];
      animatedCards.value.push(card); // 카드 추가
      await nextTick(); // DOM 렌더링 기다림
      await new Promise((resolve) => setTimeout(resolve, 400)); // 0.1초 대기
      shownCardIds.value.push(card.cardId); // 애니메이션 표시
    }
  } else {
    emit('update-message', '내 주변 혜택을 받을 수 있는 매장을 검색해보세요');
  }
};

const fanCardStyle = (i, card) => {
  const spread = 60 / props.myCards.length; // 카드 수에 따라 각도 조정
  const angle = (i - (animatedCards.value.length - 1) / 2) * spread;
  const radius = 110;
  const x = Math.sin((angle * Math.PI) / 180) * radius;
  const y = Math.cos((angle * Math.PI) / 180) * -radius + 30;
  const isHovered = hoveredCard.value === card.cardId;

  return {
    position: 'absolute',
    left: `calc(50% + ${x}px)`,
    top: `-${y}px`,
    transform:
      `translate(${x}px, ${y}px) rotate(${angle}deg)` +
      (isHovered ? ' translateY(-10px) scale(1.05)' : ''),
    opacity: 1,
    zIndex: isHovered ? 999 : 'auto',
    transition: 'transform 0.6s ease, opacity 0.3s ease',
    transitionDelay: `${i * 0.3}s`,
    boxShadow: isHovered ? '0 6px 20px rgba(0, 0, 0, 0.3)' : '',
  };
};

const handleCardSelection = (card) => {
  props.handleCardClick(card.cardId);
  //   isWalletOpen.value = false;
  //   animatedCards.value = [];
  emit('update-message', '내 카드로 주변 혜택 매장을 검색합니다!');
};
</script>

<style scoped>
/* 타이틀 문구 */
.title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  text-align: center;
}
/* 카드지갑 */
.wallet-container {
  position: fixed;
  bottom: 100px;
  left: 49%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wallet-button {
  background: none;
  border: none;
  cursor: pointer;
}

.wallet-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.fan-card-wrapper {
  position: relative;
  left: -49%;
  transform: translateX(-30%);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}

.fan-card {
  width: 60px;
  height: auto;
  border-radius: 8px;
  position: relative;
  bottom: 50px;
  opacity: 0;
  transform: scale(0.9);
  transition: transform 0.1s ease, opacity 0.1s ease;
}
/* show 클래스가 붙으면 나타남 */
.fan-card.show {
  opacity: 1;
  transform: scale(1);
}
/* .fan-card:hover {
  transform: translateY(-10px) scale(1.05); 
  z-index: 999; 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); 
} */
</style>
