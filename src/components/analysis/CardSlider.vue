<template>
  <div class="card-slider-container">
    <!-- 소유자 표시 -->
    <div class="owner-line">
      <span class="highlight">{{ currentCard.owner }}</span>님의 카드 실적 현황
    </div>

    <!-- 슬라이더 영역 -->
    <div class="slider-viewport">
      <div class="slider-track" :style="trackStyle">
        <div
          v-for="card in cards"
          :key="card.cardProductId"
          class="slider-item"
        >
          <div class="card-visual">
            <img :src="card.image" :alt="card.name" />
          </div>
          <div class="card-name">{{ card.name }}</div>
        </div>
      </div>

      <button class="nav-arrow left" @click="prev" :disabled="isFirst">
        <svg viewBox="0 0 24 24"><path d="M15 18L9 12L15 6"/></svg>
      </button>
      <button class="nav-arrow right" @click="next" :disabled="isLast">
        <svg viewBox="0 0 24 24"><path d="M9 18L15 12L9 6"/></svg>
      </button>
    </div>

    <!-- 페이지네이션 -->
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
        <span>{{ formatAmount(currentCard.totalAmount) }}원</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: pct + '%' }" />
      </div>
    </div>

    <!-- 최근 거래내역 -->
    <RecentTransactions
      v-if="currentCard.cardProductId != null"
      class="recent-trans-section"
      :transactions="currentCard.transactions"
      :cardProductId="currentCard.cardProductId"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import RecentTransactions from '@/components/analysis/RecentTransactions.vue'

const props = defineProps({ cards: { type: Array, required: true } })

const route = useRoute()
const idx   = ref(0)

/* ---------- 초기 & 쿼리 동기화 ---------- */
onMounted(syncWithQuery)
watch(() => route.query.cardId, syncWithQuery)

function syncWithQuery() {
  const cid = Number(route.query.cardId)
  const i   = props.cards.findIndex(c => c.cardProductId === cid)
  if (i >= 0) idx.value = i
}

/* ---------- 계산 ---------- */
const currentCard = computed(() => props.cards[idx.value] || {})
const pct = computed(() => {
  const c = currentCard.value
  return c.totalAmount
    ? Math.min((c.currentAmount / c.totalAmount) * 100, 100)
    : 0
})
const isFirst = computed(() => idx.value === 0)
const isLast  = computed(() => idx.value === props.cards.length - 1)
const trackStyle = computed(() => ({
  transform: `translateX(-${idx.value * 100}%)`
}))

/* ---------- 메서드 ---------- */
function prev() { if (!isFirst.value) idx.value-- }
function next() { if (!isLast.value)  idx.value++ }
function formatAmount(v) { return v != null ? v.toLocaleString() : '0' }
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
.highlight {
  color: #FFCD39;
  font-weight: 600;
}
.slider-viewport {
  position: relative;
  overflow: hidden;
}
.slider-track {
  display: flex;
  transition: transform 0.3s ease;
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
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  z-index: 10;
}
.nav-arrow[disabled] { opacity: 0.3; cursor: not-allowed; }
.nav-arrow svg { width: 20px; height: 20px; }
.nav-arrow svg path {
  fill: none;
  stroke: #FFCD39;
  stroke-width: 2px;
}
.nav-arrow.left  { left: calc((100% - 260px) / 2 - 48px); }
.nav-arrow.right { right: calc((100% - 260px) / 2 - 48px); }
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
.pagination-dots span.active { background: #FFCD39; }
.card-performance { margin-top: 12px; }
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
