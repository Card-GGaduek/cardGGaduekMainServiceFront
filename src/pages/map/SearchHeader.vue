<script setup>
// ==== [SearchHeader.vue] ====
// 상단 검색 UI + 카테고리 칩 UI 컴포넌트
// [map.js 연결 주석 표시] map.js 변수/메소드와 직접 연결되는 부분을 표시합니다.

import { ref } from 'vue'

// === Props ===
// MapPage.vue에서 v-model:keyword로 keyword(ref) 주입 → map.js의 keyword와 연결
// selectedCategory: 현재 선택된 카테고리 (map.js의 selectedCardCategory와 연결 가능)
// categories: categoryColorMap 기반으로 라벨·아이콘 설정
const props = defineProps({
  keyword: { type: String, default: '' },                  // [map.js 연결] keyword
  selectedCategory: { type: String, default: '' },         // [map.js 연결] selectedCardCategory (필요 시)
  categories: { type: Array, default: () => [] },
  myCards : { type: Array, default: () => [] },            // [map.js 연결] myCards
  selectedCardId: {type: [String, Number], default:''},    // [map.js 연결] 선택된 카드 ID 
})


// === Emits ===
// update:keyword → MapPage.vue에서 keyword.value 변경 → map.js.keyword 변경
// search → handleSearch 실행 (map.js.handleSearch 호출)
// selectCategory → handleCardClick 또는 searchStoresByCategory로 연결
// changeCard → 카드선택 기능 호출 map.js myCards와 연결
const emit = defineEmits([
  'update:keyword',     // keyword 변경 시 호출
  'search',             // handleSearch() 호출
  'selectCategory',     // searchStoresByCategory(key) 호출
  'changeCard'          // handleCardClick(cardId) 호출
])

function onChangeCard(e){
  emit('changeCard', e.target.value) 
}



// === 드래그 스크롤 상태/핸들러  ===
//.chip-scroll 컨테이너에 직접 이벤트 바인딩(@mousedown/@touchstart 등)으로 처리
const chipScrollRef = ref(null)   // 스크롤 컨테이너 참조
const isDragging = ref(false)     // 드래그 중 여부
const dragMoved  = ref(false)     // 실제 이동이 발생했는지(클릭 가드)
let startX = 0                    // 드래그 시작 좌표
let startLeft = 0                 // 시작 시 scrollLeft
let guardTimer = null             // 클릭 가드 해제 타이머

const getPageX = (e) => (e.touches ? e.touches[0].pageX : e.pageX)

function onDragStart(e) {
  const el = chipScrollRef.value
  if (!el) return
  isDragging.value = true
  dragMoved.value = false
  startX = getPageX(e)
  startLeft = el.scrollLeft
  // 드래그 시작 시 기존 가드 타이머 정리
  if (guardTimer) { clearTimeout(guardTimer); guardTimer = null }
}

function onDragMove(e) {
  if (!isDragging.value) return
  const el = chipScrollRef.value
  if (!el) return
  const dx = getPageX(e) - startX
  if (Math.abs(dx) > 3) dragMoved.value = true   // 3px 이상 이동 시 클릭 가드
  el.scrollLeft = startLeft - dx
}

function onDragEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  // 클릭 이벤트가 mouseup/touchend 이후에 발생하므로,
  // 아주 짧게 dragMoved=true를 유지해 클릭을 막고, 잠시 뒤 해제
  guardTimer = setTimeout(() => { dragMoved.value = false }, 60)
}
</script>

<template>
  <div class="search-header">
    <!-- 검색창 -->
    <div class="search-row">
      <i class="bi bi-search search-icon" aria-hidden="true"></i>
      <input
        class="search-input"
        :value="keyword"
        @change="e=> emit('update:keyword', e.target.value)"
        @keyup.enter="(e)=>{emit('update:keyword', e.target.value); emit('search')}"
        placeholder="매장 키워드를 입력하세요"
        aria-label="매장 키워드"
      />
      <button type="button" class="search-btn" @click="emit('search')">검색</button>
    </div>

    <!-- 카드 선택 + 카테고리 칩 -->
    <!-- 25.08.11 디자인 수정 -->
    <div class="chip-scroll"
    ref="chipScrollRef"
    @mousedown="onDragStart"
    @mousemove="onDragMove"
    @mouseup="onDragEnd"
    @mouseleave="onDragEnd"
    @touchstart.passive="onDragStart"
    @touchmove.passive="onDragMove"
    @touchend="onDragEnd"
    @touchcancel="onDragEnd">
        <div class="chip-row">
          <!-- 카드 선택 -->
          <div class="chip-select-wrap">
              <select
              class="chip-select"
              :value="selectedCardId || ''"
              @change="onChangeCard"
              >
                <option value="">카드를 선택하기</option>
                <option v-for="c in myCards" :key="c.cardId" :value="c.cardId">
                  {{ c.cardProductName }}
                </option>
                </select>
                <i class="bi bi-caret-down-fill chip-select-caret" aria-hidden="true"></i>
          </div>
          <!-- 카테고리 목록 -->
          <template v-for="c in categories" :key="c.key">
            <button
              type="button"
              class="chip"
              :class="{ 'chip--active': c.key === selectedCategory }"
              @click="!dragMoved && emit('selectCategory',c.key)"
            >
              <i v-if="c.icon" :class="['bi', c.icon]" aria-hidden="true"></i>
              <span class="chip-label">{{ c.label }}</span>
            </button>
          </template>
        </div>
    </div>
    <!-- /25.08.11 디자인 수정 -->
  </div>
</template>

<style scoped>
/* 최상단 고정 레이어 */
.search-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: none;
  padding: 10px 12px 8px;
  box-shadow: none;
}
/* 검색 행 */
.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border-radius: 20px;
  padding: 8px 8px 8px 12px;
  border: 1px solid #ececec;
}
.search-icon {
  font-size: 16px;
  color: #9aa0a6;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
}
.search-btn {
  border: none;
  background: #ffcd39;
  color: #ffffff;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 14px;
  cursor: pointer;
}
/* 셀렉트*/
.chip-select-wrap { 
    position: relative; 
    display: inline-block; 
}
.chip-select {
    appearance: none;
    border: 1px solid #ffc107;
    background: #fffaf0;
    color: #9a6b00;
    border-radius: 16px;
    padding: 6px 28px 6px 12px;   /* 오른쪽 여백(화살표 자리) */
    font-size: 12px;
    line-height: 1;
}
/* 카테고리 화살표 */
.chip-select-caret {
    position: absolute; 
    right: 8px; 
    top: 50%; 
    transform: translateY(-50%);
    font-size: 12px; 
    color: #d39e00; 
    pointer-events: none;
}
/* 칩 행: 가로 스크롤 */
.chip-scroll {
    width: 100%;
    max-width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    margin-top: 2px;
    padding-top: 4px;
    padding-bottom: 0;
    touch-action: pan-x;
}
.chip-row {
  display: inline-flex; /* 가로 정렬 */
  flex-wrap: nowrap;
  gap: 8px; 
  white-space: nowrap; /* 칩이 줄바꿈되지 않도록 */
}

/* 칩 */
.chip {
  flex: 0 0 auto !important; /* 칩 크기 고정 */
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e7e7e7;
  background: #fff;
  border-radius: 14px;
  padding: 5px 10px;
  font-size: 12px;
  white-space: nowrap; 
  box-shadow : 0 1px 2px rgba(0,0,0,0.04)
}
.chip--active {
  border-color: #ffc107;
  background: #fff7e0;
}
.chip--outline-yellow {
  border-color: #ffc107;
  color: #9a6b00;
  background: #fffaf0;
}
.chip-label {
  line-height: 1;
}
</style>
