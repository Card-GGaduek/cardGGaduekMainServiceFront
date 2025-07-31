<template>
  <div class="card-slider-container">
    <!-- Owner above card -->
    <div class="owner-line owner-top">
      <span class="highlight">{{ currentCard.owner }}</span>님의 카드 실적 현황
    </div>

    <!-- Slider viewport -->
    <div class="slider-viewport">
      <div class="slider-track" :style="trackStyle">
        <div class="slider-item" v-for="(card, index) in cards" :key="card.id">
          <div class="card-visual">
            <img :src="card.logo || card.image" :alt="card.name" />
          </div>
          <div class="card-name">{{ card.name }}</div>
        </div>
      </div>

      <!-- Left arrow -->
      <button
        class="nav-arrow left"
        @click="goToPrevCard"
        :disabled="isFirst"
        v-if="cards.length > 1"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Right arrow -->
      <button
        class="nav-arrow right"
        @click="goToNextCard"
        :disabled="isLast"
        v-if="cards.length > 1"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Pagination dots -->
    <div class="pagination-dots" v-if="cards.length > 1">
      <span
        v-for="(_, idx) in cards"
        :key="idx"
        :class="{ active: idx === currentCardIndex }"
        @click="currentCardIndex = idx"
      ></span>
    </div>

    <!-- Performance summary below slider -->
    <div class="card-performance">
      <div class="amount-line">
        <span class="amount-text">{{ formatAmount(currentCard.currentAmount) }}원</span>
        <span class="amount-text">{{ formatAmount(currentCard.totalAmount) }}원</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardSlider',
  props: {
    cards: { type: Array, required: true }
  },
  data() {
    return { currentCardIndex: 0 };
  },
  computed: {
    currentCard() {
      return this.cards[this.currentCardIndex] || {};
    },
    progressPercentage() {
      if (!this.currentCard.totalAmount) return 0;
      return Math.min((this.currentCard.currentAmount / this.currentCard.totalAmount) * 100, 100);
    },
    isFirst() {
      return this.currentCardIndex === 0;
    },
    isLast() {
      return this.currentCardIndex === this.cards.length - 1;
    },
    trackStyle() {
      return { transform: `translateX(-${this.currentCardIndex * 100}%)` };
    }
  },
  methods: {
    formatAmount(amount) {
      return amount ? amount.toLocaleString() : '0';
    },
    goToNextCard() {
      if (!this.isLast) this.currentCardIndex++;
    },
    goToPrevCard() {
      if (!this.isFirst) this.currentCardIndex--;
    }
  }
};
</script>

<style scoped>
.card-slider-container {
  max-width: 360px;
  margin: 20px auto;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0px 2px 12px rgba(0,0,0,0.08);
}
.owner-line.owner-top {
  font-size: 18px;
  font-weight: 400;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}
.owner-line.owner-top .highlight {
  color: #FFCD39;
}
.slider-viewport {
  position: relative;
  overflow: hidden;
  width: 100%;
}
.slider-track {
  display: flex;
  transition: transform 0.3s ease-in-out;
}
.slider-item {
  flex: 0 0 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-visual {
  width: 260px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}
.card-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 16px;
}
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  background: transparent;
  box-shadow: none;
  border: none;
  outline: none;
  cursor: pointer;
}
.nav-arrow svg path {
  stroke: #FFCD39;
}
.nav-arrow.left {
  left: 30px;
}
.nav-arrow.right {
  right: 30px;
}
.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.pagination-dots {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
.pagination-dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin: 0 4px;
  border-radius: 50%;
  background: #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}
.pagination-dots span.active {
  background: #FFCD39;
}
.card-performance {
  margin-top: 16px;
}
.amount-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.amount-text {
  font-size: 14px;
  font-weight: 500;
}
.progress-bar {
  width: 100%;
  height: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}
.progress-fill {
  height: 100%;
  background: #FFCD39;
  border-radius: 8px;
}
</style>
