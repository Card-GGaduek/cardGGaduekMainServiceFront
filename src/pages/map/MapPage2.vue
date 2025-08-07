<template>
  <div style="position: relative; width: 100%; height: 100%">
    <!-- 드롭다운 컨트롤 -->
    <div class="map-controls">
      <!-- 카드 선택 -->
      <select v-model="selectedCardId" @change="onCardChange">
        <option v-for="card in cards" :key="card.cardId" :value="card.cardId">
          {{ card.cardProductName }}
        </option>
      </select>

      <select
        v-if="
          selectedCard &&
          selectedCard.storeBenefitList &&
          selectedCard.storeBenefitList.length
        "
        v-model="selectedStoreName"
      >
        <option disabled value="">가맹점을 선택하세요</option>
        <option
          v-for="store in selectedCard.storeBenefitList"
          :key="store.storeName"
          :value="store.storeName"
        >
          {{ store.storeName }}
        </option>
      </select>

      <!-- 검색 버튼 -->
      <button @click="onSearchSpecificStore">검색</button>
    </div>

    <div ref="mapRef" style="width: 100%; height: 100%"></div>
    <button
      class="move-to-my-location-btn"
      @click="moveToMyLocation"
      aria-label="내 위치로 이동"
    >
      내 위치
    </button>

    <!-- 재검색 버튼: 지도 이동/줌 후 보이도록 고정 -->
    <button
      v-if="showSearchButton"
      class="re-search-btn"
      @click="onReSearchClick"
      aria-label="현재 지도 위치에서 재검색"
    >
      지도 범위 내 재검색
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useNaverMap } from './js/NaverMap';
import memberApi from '@/api/memberApi';

const ncpKeyId = import.meta.env.VITE_NAVER_NCP_KEY_ID;
const mapRef = ref(null);

const {
  center,
  rectangle,
  initNaverMap,
  setCenterToCurrentLocationOrDefault,
  moveToMyLocation,
  addMarkersByStoreNameList,
  addMarkersByStoreName,
  registerOnMapMove,
  clearAllStoreMarkers,
} = useNaverMap(ncpKeyId);

const cards = ref([]);
const selectedCardId = ref(null);
const selectedCard = computed(() =>
  cards.value.find((card) => card.cardId === selectedCardId.value)
);
// ⬇️ 복수 선택, mount 시/카드 변경 시 빈배열이 되도록 함
const selectedStoreName = ref('');
const showSearchButton = ref(false);

const loadMyCards = async () => {
  try {
    const result = await memberApi.getMyCard();
    cards.value = result;

    if (result.length > 0) {
      selectedCardId.value = result[0].cardId;
      selectedStoreName.value = ''; // 아무것도 선택 안함
      // (초기엔 마커 아무것도 안 찍음)
    }
    console.log(selectedCard.value);
    console.log(selectedCardId.value);
  } catch (e) {
    alert(e.message);
  }
};

// 카드 변경 => 가맹점 선택도 모두 해제(초기화)
const onCardChange = async () => {
  selectedStoreName.value = '';
  // 마커도 비움
  clearAllStoreMarkers();
  console.log(selectedCard.value);
  console.log(selectedCard.value.storeBenefitList);
  // console.log(selectedStoreNames.value);
};

// 검색 버튼: 선택된 가맹점들만 마커
const onSearchSpecificStore = async () => {
  if (selectedStoreName.value) {
    await addMarkersByStoreName(selectedStoreName.value);
    return;
  } else {
    alert('가맹점을 선택해 주세요.');
  }
};

// 지도 변경 시 호출되는 함수 - 재검색 버튼 노출
function onMapChanged() {
  showSearchButton.value = true;
}

// 재검색 버튼 클릭 시 현재 선택된 가맹점만 검색
const onReSearchClick = async () => {
  showSearchButton.value = false;
  await onSearchSpecificStore();
};

onMounted(async () => {
  // 1. 내 위치로 center 먼저 세팅
  await setCenterToCurrentLocationOrDefault();
  // 2. 지도 초기화 및 마커 찍기
  await initNaverMap(mapRef.value);
  registerOnMapMove(onMapChanged);
  await loadMyCards();

  // console.log(rectangle.value);
  console.log(cards.value);
});
</script>

<style>
.map-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 200;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.map-controls select,
.map-controls button {
  padding: 6px 10px;
  font-size: 14px;
}

.move-to-my-location-btn {
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 100;
  background: #fff;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: background 0.2s;
}
.move-to-my-location-btn:hover {
  background: #fafad2;
}

.re-search-btn {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 101; /* 내 위치 버튼보다 위에 */
  background: #fff;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: background 0.2s;
}
.re-search-btn:hover {
  background: #fafad2;
}
</style>
