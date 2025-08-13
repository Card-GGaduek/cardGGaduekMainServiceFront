<!-- AllTransactions.vue -->
<template>
  <div class="all-transactions">
    <!-- 상단 서브헤더 -->
    <SubHeader
      title="지출 내역"
      :back-to="{ name: 'Analysis', query: { cardId: selectedCardId } }"
      class="local-subheader"
    />

    <!-- 최근 거래 + 카드 선택 -->
    <div class="sub-header">
      <div class="recent-trans">최근 거래내역</div>

      <!-- 커스텀 드롭다운 -->
      <div class="card-select" ref="dropdownRef">
        <button class="select-btn" type="button" @click="toggleOpen">
          {{ selectedCardName || '카드 선택' }}
        </button>

        <ul v-if="open" class="options" role="listbox">
          <li
            v-for="c in cardList"
            :key="c.cardProductId"
            class="option"
            :class="{ selected: c.cardProductId === selectedCardId }"
            role="option"
            @click="choose(c.cardProductId)"
          >
            <span class="label">{{ c.cardName }}</span>
            <span class="check" v-if="c.cardProductId === selectedCardId">✓</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 거래 리스트 -->
    <div class="tx-list">
      <div v-for="tx in sortedTransactions" :key="tx.id" class="tx-item">
        <div class="tx-info">
          <span class="datetime">
            {{ formatDate(tx.transDate) }} {{ formatTime(tx.transDate) }}
          </span>
          <span class="store">{{ tx.storeName }}</span>
        </div>
        <span class="amount">-{{ formatAmount(tx.amount) }}원</span>
      </div>
    </div>

    <!-- 상태 메시지 -->
    <p v-if="loading" class="status-msg">불러오는 중...</p>
    <p v-else-if="!loading && sortedTransactions.length === 0" class="status-msg">
      거래 내역이 없습니다.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCardTransactions } from '@/api/analysisindex.js'
import SubHeader from '@/layout/SubHeader.vue'

const router = useRouter()
const route  = useRoute()

const transactions   = ref([])
const cardList       = ref([])
const selectedCardId = ref(Number(route.query.cardId) || null)
const loading        = ref(false)

/* 커스텀 드롭다운 제어 */
const open = ref(false)
const dropdownRef = ref(null)
const selectedCardName = computed(
  () => cardList.value.find(c => c.cardProductId === selectedCardId.value)?.cardName ?? ''
)
function toggleOpen(){ open.value = !open.value }
function closeOnOutside(e){
  if (!dropdownRef.value) return
  if (!dropdownRef.value.contains(e.target)) open.value = false
}
onMounted(()=> document.addEventListener('click', closeOnOutside))
onBeforeUnmount(()=> document.removeEventListener('click', closeOnOutside))

function choose(cardId){
  if (selectedCardId.value === cardId) { open.value = false; return }
  selectedCardId.value = cardId
  open.value = false
  onCardChange()
}

/* 데이터 로드 */
async function loadAll() {
  loading.value = true
  try {
    const res  = await getCardTransactions()
    const list = res.data.data || []

    transactions.value = list.flatMap(c =>
      c.transactions.map(tx => ({ ...tx, cardProductId: c.cardProductId }))
    )
    cardList.value = list.map(c => ({
      cardProductId: c.cardProductId,
      cardName:      c.cardName
    }))

    if (!selectedCardId.value && cardList.value.length) {
      selectedCardId.value = cardList.value[0].cardProductId
      router.replace({ name: 'AllTransactions', query: { cardId: selectedCardId.value } })
    }
  } finally {
    loading.value = false
  }
}
onMounted(loadAll)

/* 변경 시 URL 동기화 */
function onCardChange() {
  router.replace({ name: 'AllTransactions', query: { cardId: selectedCardId.value } })
}

/* 정렬 & 필터 */
const sortedTransactions = computed(() =>
  transactions.value
    .filter(tx => tx.cardProductId === selectedCardId.value)
    .sort((a, b) => new Date(b.transDate) - new Date(a.transDate))
)

/* 유틸 */
function formatDate(dt) {
  const d = new Date(dt)
  return [d.getMonth()+1, d.getDate()].map(n => String(n).padStart(2,'0')).join('.')
}
function formatTime(dt) { return dt.split(' ')[1].slice(0,5) }
function formatAmount(v) { return v.toLocaleString() }

/* 쿼리 → 상태 동기화 */
watch(() => route.query.cardId, val => {
  if (val) selectedCardId.value = Number(val)
})
</script>

<style scoped>
.all-transactions {
  padding: 1rem;
  background: #fff;
  min-height: 100vh;
}
/* 기준 컨테이너 */
.local-subheader { position: relative; }

/* 헤더 레이아웃 */
.local-subheader :deep(header.py-1.px-3) {
  display: flex;
  align-items: center;
  justify-content: center;    /* 제목 중앙 */
  height: 48px;
  padding: 0 48px;            /* ← 화살표/오른쪽 여유 확보 */
  background: #fff;
  border-bottom: 1px solid #f2f2f2;
  position: sticky; top: 0; z-index: 20;
}

/* 뒤로가기 버튼은 왼쪽 고정 */
.local-subheader :deep(.back-button) {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translate(-2px, -50%); 
  font-size: 22px;
  background: none;
  border: 0;
}

/* 제목: 중앙 + 폭 확보 + 부트스트랩 마진 제거 */
.local-subheader :deep(.title),
.local-subheader :deep(.title.ms-2) {
  display: block;             /* 또는 flex: 1 */
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: 500;
  margin: 0 !important;
  margin-left: 0 !important;  /* ← ms-2를 확실히 무력화 */
}

.sub-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:.75rem;
  margin-bottom:.5rem;
}
.recent-trans{
  font-size: 1.2rem;
  margin: 1rem 0;
}

/* ---------- 커스텀 드롭다운 ---------- */
.card-select{
  position: relative;
  margin-top:0.1rem;
  display: inline-block;
  box-sizing: border-box;
}
.select-btn{
  height: 36px;
  min-width: 220px;
  width: 100%;
  text-align: left;
  padding: 0 0.5rem 0 .9rem;
  border: 1px solid #D9D9D9;
  border-radius: 10px;
  background: #fff;
  font-size: .95rem;
  color: #333;
  line-height: 36px;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
}
.select-btn::after{
  content: "";
  position: absolute;
  right: .5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 12px; height: 8px;
  background: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239AA3AF' stroke-width='2' fill='none'/%3E%3C/svg%3E") no-repeat center;
  background-size: 12px 8px;
  pointer-events: none;
}
.options{
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  width: 100%;
  max-height: 320px;
  overflow: auto;
  padding: .4rem 0;
  margin: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
  z-index: 10;
  box-sizing: border-box;
}
.option{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .6rem .9rem;
  cursor: pointer;
  font-size: 0.95rem;
  white-space: nowrap;
}
.option:hover{ background: #F7F7F7; }
.option.selected .label{ font-weight: 600; }
.check{ font-size: 1rem; }

/* ---------- 리스트 ---------- */
.tx-list { margin-top: 1rem; }
.tx-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f2f2f2;
}
.tx-info { display: flex; flex-direction: column; }
.datetime { font-size: 0.875rem; color: #666; }
.store    { font-size: 1rem; }
.amount   { font-weight: 600; color: #d9534f; margin-top:1.3rem; }
</style>
