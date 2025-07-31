<template>
  <div class="card-slider-container">
    <!-- 카드 소유자 + 제목 -->
    <div class="owner-line">
      <span class="highlight">{{ currentCard.owner }}</span>님의 카드 실적 현황
    </div>

    <!-- 슬라이더 -->
    <div class="slider-viewport">
      <div class="slider-track" :style="trackStyle">
        <div
          class="slider-item"
          v-for="(card, i) in cards"
          :key="card.id"
        >
          <div class="card-visual">
            <img :src="card.image" :alt="card.name" />
          </div>
          <div class="card-name">{{ card.name }}</div>
        </div>
      </div>

      <!-- 이전 화살표 -->
      <button
        class="nav-arrow left"
        @click="prev"
        :disabled="isFirst"
      >
        <svg viewBox="0 0 24 24">
          <path d="M15 18L9 12L15 6" />
        </svg>
      </button>

      <!-- 다음 화살표 -->
      <button
        class="nav-arrow right"
        @click="next"
        :disabled="isLast"
      >
        <svg viewBox="0 0 24 24">
          <path d="M9 18L15 12L9 6" />
        </svg>
      </button>
    </div>

    <!-- 페이지 닷 -->
    <div class="pagination-dots">
      <span
        v-for="(_, j) in cards"
        :key="j"
        :class="{ active: j === idx }"
        @click="idx = j"
      />
    </div>

    <!-- 실적 바 -->
    <div class="card-performance">
      <div class="amount-line">
        <span>{{ formatAmount(currentCard.currentAmount) }}원</span>
        <span>{{ formatAmount(currentCard.totalAmount)   }}원</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: pct + '%' }" />
      </div>
    </div>

    <!-- 최근 거래 3건 -->
    <RecentTransactions
      v-if="currentCard.transactions?.length"
      :transactions="currentCard.transactions"
    />
  </div>
</template>

<script>
import RecentTransactions from '@/components/analysis/RecentTransactions.vue';

export default {
  name: 'CardSlider',
  components: { RecentTransactions },
  props: {
    cards: { type: Array, required: true }
  },
  data() {
    return { idx: 0 };
  },
  computed: {
    currentCard() {
      return this.cards[this.idx] || {};
    },
    pct() {
      const c = this.currentCard;
      return c.totalAmount
        ? Math.min((c.currentAmount / c.totalAmount) * 100, 100)
        : 0;
    },
    isFirst() { return this.idx === 0 },
    isLast()  { return this.idx === this.cards.length - 1 },
    trackStyle() {
      return { transform: `translateX(-${this.idx * 100}%)` };
    }
  },
  methods: {
    formatAmount(v) { return v?.toLocaleString() || '0'; },
    next() { if (!this.isLast) this.idx++ },
    prev() { if (!this.isFirst) this.idx-- }
  }
};
</script>

<style scoped>
.card-slider-container {
  max-width: 360px;
  margin: 0 auto 24px;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.owner-line {
  text-align: center;
  margin-bottom: 12px;
  font-size: 18px;
}
.owner-line .highlight {
  color: #FFCD39;
  font-weight: 600;
}

.slider-viewport {
  position: relative;
  overflow: hidden;
}

.slider-track {
  display: flex;
  transition: transform .3s ease;
}

.slider-item {
  flex: 0 0 100%;
  text-align: center;
}
.card-visual {
  width: 260px;
  height: 150px;
  margin: 0 auto 8px;
  border-radius: 12px;
  overflow: hidden;
}
.card-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-name {
  font-weight: 600;
  margin-bottom: 16px;
}

/* ← 화살표 공통 스타일: 배경 제거, 패딩만 유지 → */
.nav-arrow {
  position: absolute;
  top: 35%;                /* 살짝 더 위로 */
  transform: translateY(-50%);
  background: transparent;  /* 원형 배경 제거 */
  padding: 8px;             /* 클릭 영역 확보 */
  cursor: pointer;
  z-index: 10;
  border: none;
}
.nav-arrow[disabled] {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-arrow svg {
  width: 20px;
  height: 20px;
}
.nav-arrow svg path {
  fill: none;
  stroke: #FFCD39;   /* 화살표 색상을 노란색으로 */
  stroke-width: 2;
}

/* ← 좌우 위치 조정: 카드 엣지에서 더 멀리 → */
.nav-arrow.left {
  left: calc((100% - 260px) / 2 - 48px);
}
.nav-arrow.right {
  right: calc((100% - 260px) / 2 - 48px);
}

.pagination-dots {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}
.pagination-dots span {
  width: 6px;
  height: 6px;
  margin: 0 4px;
  border-radius: 50%;
  background: #f5f5f5;
  cursor: pointer;
}
.pagination-dots span.active {
  background: #FFCD39;
}

.card-performance {
  margin-top: 12px;
}
.amount-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
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
