<!-- src/pages/map/FanCardDock.vue -->
<template>
    <div class="fan-dock" :style="{ bottom: bottomOffset + 'px' }">
      <div class="fan-stage">
        <img
          v-for="(card, i) in myCards"
          :key="card.cardId"
          :src="card.image"
          :alt="card.cardProductName"
          class="fan-card"
          :class="{
            active: selectedCard && selectedCard.cardId === card.cardId
          }"
          :style="fanStyle(i)"
          @mouseenter="hoveredId = card.cardId"
          @mouseleave="hoveredId = null"
          @click="onPick(card.cardId)"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  // 실무용 주석(파일: FanCardDock.vue)
  // - 부모(MapPage.vue)에서 [map.js] myCards/selectedCard/handleCardClick을 그대로 props로 받음
  // - 클릭 시 map.js.handleCardClick(cardId, { autoSearch:false }) 호출(선택만 반영)
  
  import { ref, computed, onMounted } from 'vue'
  
  const props = defineProps({
    myCards: { type: Array, required: true },         // [map.js 연결] myCards
    selectedCard: { type: Object, required: false },  // [map.js 연결] selectedCard
    handleCardClick: { type: Function, required: true }, // [map.js 연결] handleCardClick
    bottomOffset: { type: Number, default: 84 },      // 탭바 높이만큼 띄우기(디자인 보정)
  })
  
  const hoveredId = ref(null)
  const count = computed(() => props.myCards.length)
  
  // 초기 진입 시 살짝 부채꼴로 퍼지게
  const mountedAt = ref(0)
  onMounted(() => { mountedAt.value = Date.now() })
  
  // 각 카드 위치/회전 계산
  function fanStyle(index) {
    if (!count.value) return {}
    const totalAngle = 40                        // 부채꼴 총 각도
    const spread = (count.value === 1) ? 0 : totalAngle / (count.value - 1)
    const start = -totalAngle / 2
    const angle = start + spread * index
    const radius = 100                           // 원호 반경(px)
    const rad = (Math.PI / 180) * angle
    const x = Math.sin(rad) * radius
    const y = Math.cos(rad) * radius
  
    const isHovered = hoveredId.value === props.myCards[index]?.cardId
  
    return {
      transform: `translate(${x}px, ${-y}px) rotate(${angle}deg) ${isHovered ? 'translateY(-8px) scale(1.04)' : ''}`,
      transition: 'transform .35s ease, box-shadow .25s ease, filter .25s ease',
      boxShadow: isHovered ? '0 10px 24px rgba(0,0,0,.25)' : '0 3px 10px rgba(0,0,0,.15)',
      filter: isHovered ? 'brightness(1.02)' : 'none',
    }
  }
  
  // 클릭 → 카드만 선택(검색 안 함)
  function onPick(cardId) {
    try {
      props.handleCardClick(Number(cardId), { autoSearch: false }) // [map.js 연결]
    } catch (e) {
      console.error('handleCardClick 호출 실패:', e)
    }
  }
  </script>
  
  <style scoped>
  .fan-dock {
    position: fixed;        /* 화면 하단 고정 */
    left: 47%;
    top: 86%;
    transform: translateX(-50%);
    z-index: 1000;
    pointer-events: none;   /* 무대밖 클릭은 통과 */
  }
  
  .fan-stage {
    position: relative;
    width: 420px;           /* 카드 개수에 따라 자동 래핑되지만, 기본 폭을 줘 중심 배치 */
    height: 180px;          /* 부채꼴 높이 */
    pointer-events: auto;   /* 카드 클릭 가능 */
  }
  
  .fan-card {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 76px;            /* 카드 폭 */
    border-radius: 10px;
    transform-origin: 50% 100%;
    cursor: pointer;
    user-select: none;
    will-change: transform, box-shadow, filter;
    outline: none;
  }
  
  /* 선택 카드 강조 */
  .fan-card.active {
    box-shadow: 0 12px 28px rgba(0, 0, 0, .28), 0 0 0 3px rgba(255,205,57,.9);
    filter: brightness(1.05);
  }
  @media (max-width: 420px) {
    .fan-stage { width: 340px; }
    .fan-card { width: 68px; }
  }
  </style>
  