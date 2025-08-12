<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMap } from '@/pages/map/map';
import axios from 'axios';
import { calculator } from 'fontawesome';
import PayNavigator from '@/pages/map/PayNavigator.vue';

//25.08.11 컴포넌트 추가
import SearchHeader from './SearchHeader.vue';
import FanMyCards from './FanMyCards.vue';


const route = useRoute();
const mapDiv = ref(null);
const walletMessage = ref('내 주변 혜택을 받을 수 있는 매장을 검색해보세요');

const selectedCardId = ref('');
const selectableBenefits = computed(
  () => selectedCard.value?.storeBenefitList ?? []
);

/* 25.08.11 추가 */
// 중복 카테고리 검색을 위한 동의어 집합
// UI에서 들어온 카테고리 키를 동의어 집합으로 확장하여
// map.js.searchStoresByCategory를 여러 번 호출한다.
const CATEGORY_SYNONYMS = {
  COFFEE_SHOP: ['CAFE', 'COFFEE_SHOP'],  // 카페 1개 칩 → 내부 2개 검색
  // 필요시 여기에 더 추가: SUPERMARKET: ['SUPERMARKET','GROCERY'] 등
}
async function onCategoryFromUI(key) {
  if (!selectedCard.value) { alert('먼저 카드를 선택해 주세요.'); return; }

  clearMarkers('category-click') // 직전 검색 카테고리 마커 제거
  const keys = CATEGORY_SYNONYMS[key] || [key]
  for (const k of keys) {
    // [map.js 연결] 누적 카테고리 검색
    await searchStoresByCategory(k)
  }
}

// === [map.js 연결] ===  
// 25.08.11 주석 추가
const {
  keyword,                // SearchHeader v-model → map.js.keyword
  selectedMerchant,       // 상세 시트 데이터
  selectedCard,           // 선택된 카드
  selectedStoreName,      // 드롭다운 선택 매장명
  categoryColorMap,       // 카테고리 색상/라벨 매핑
  isSearching,            // 검색 중 상태
  myCards,                // 카드 리스트
  isMapReady,             // 지도 준비 여부
  noBenefitAlert,         // 혜택 없음 알림
  categoriesForUI,      // UI에서 사용할 카테고리 목록
  markers,
  handleSearch,           // 검색 실행 메소드
  handleCardClick,        // 카드 선택 시 실행
  moveToCurrentLocation,  // 현재 위치 이동
  onMapReady,              // 지도 준비 콜백
  searchByStoreName,      // 드롭다운 검색 실행
  searchStoresByCategory, // 카테고리별 매장 검색
  showNoBenefitMessage,   // 혜택 없음 메시지
  clearMarkers,          // 마커 초기화
} = useMap(mapDiv)

// 도착 시 1회만 자동검색
const arrivalSearched = ref(false);

// (A) 맵이 이미 준비된 뒤에 라우트 키워드가 들어오는 경우
// 라우트 keyword → 초기 검색
watch(
  () => route.query.keyword,
  (newVal) => {
    const kk = String(newVal ?? '').trim();
    if (!kk || arrivalSearched.value) return;

    if (isMapReady.value) {
      arrivalSearched.value = true;
      keyword.value = kk;
      handleSearch();
    }
  }
);

 


// 2. 카드 스와이퍼에서 넘어올 경우
// 카드 매장 누적 검색
// const headerMessage = computed(() =>
//   isSearching.value ? '매장을 검색중입니다' : walletMessage.value
// );
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword && newKeyword !== keyword.value) {
      onMapReady(() => {
        keyword.value = newKeyword;
        handleSearch();
      });
    }
  }
);

// 3. 셀렉트 카드 옵션 선택 후 카테고리 검색
// 카드 관련 혜택 매장 카테고리 검색
function onChangeCardFromHeader(cardId) {
 
  const v = String(cardId || '').trim();

  if (!v) {
    // 빈 값(“카드 선택하기”) → 선택돼 있던 카드가 있으면 해제(검색 없음)
    if (selectedCard.value?.cardId) {
      handleCardClick(Number(selectedCard.value.cardId), { autoSearch: false }); // 해제만
    }
    return;
  }
  // 카드 선택만 반영(검색 없음)
  handleCardClick(Number(v), { autoSearch: false });
}

// 페이 네비게이터 모드 관리용 변수
const payNavigatorMode = ref(false);
const openPayNavigator = () => {
  console.log('🟢 openPayNavigator 실행');
  console.log('selectedCard:', selectedCard.value);
  console.log('selectedMerchant:', selectedMerchant.value);
  payNavigatorMode.value = true;
};
const closePayNavigator = () => {
  payNavigatorMode.value = false;
};
// 🔍 selectedMerchant 변경 추적
watch(selectedMerchant, (newVal) => {
  if (newVal === null) {
    console.warn('❗ selectedMerchant = null → Stack trace:');
    console.trace(); // 변경이 발생한 코드 스택 출력
  } else {
    console.log('📌 selectedMerchant 변경됨:', newVal);
  }
});
watch(selectedCard, (newVal) => {
  if (newVal === null) {
    console.warn('❗ selectedCard = null → Stack trace:');
    console.trace(); // 변경이 발생한 코드 스택 출력
  } else {
    console.log('📌 selectedCard 변경됨:', newVal);
  }
});
</script>
<template>
  <div class="map-container">
    <button
          @click="moveToCurrentLocation"
          class="location-button"
          aria-label="현재 위치로 이동"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="#ffcd39"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"></path>
          </svg>
        </button>
        <button @click="handleSearch" class="research-button">
          📍 현재 지도에서 재검색
        </button>
    <!-- [map.js 연결] SearchHeader 컴포넌트 -->
     <SearchHeader
      v-model:keyword="keyword"
      :selected-category="''"
      :selected-card-id="selectedCard?.cardId || ''"
      :categories="categoriesForUI"
      :my-cards="myCards"
      @search="handleSearch"
      @select-category="onCategoryFromUI"
      @change-card="onChangeCardFromHeader" 
     />
    <!-- 지도 영역 -->
    <div ref="mapDiv" class="map-view"></div>
    
    <!-- 검색 및 MyCard UI -->
     <!-- 25.08.11 주석처리 -->
    <!-- <div class="controls-container">
      <div class="controls-box">
        <p class="title">
          {{ headerMessage }}
        </p> -->
        <!-- 가맹점 선택 -->
        <!-- <select
          v-if="selectableBenefits.length"
          v-model="selectedStoreName"
          @change="searchByStoreName"
        >
          <option disabled value="">가맹점을 선택하세요</option>
          <option
            v-for="benefit in selectableBenefits"
            :key="benefit.storeName"
            :value="benefit.storeName"
          >
            {{ benefit.storeName }}
          </option>
        </select> -->

        <!-- 검색창 + 지갑 -->
        <!-- 25.08.11 주석처리 -->
        <!-- <div class="search-bar"> -->
          <!-- <input
            v-model="keyword"
            @keyup.enter="handleSearch"
            placeholder="매장 키워드를 입력하세요"
            class="search-input"
          /> -->
           <!-- <WalletButton
            :myCards="myCards"
            :selectedCard="selectedCard"
            :handleCardClick="handleCardClick"
            @update-message="walletMessage = $event"
          />  -->
          <!-- <button @click="handleSearch" class="search-button">검색</button> -->
        <!-- </div>  -->
        

        <!-- 카드 리스트 보여주기 (클릭 시 누적 검색) -->
        <!-- <div class="my-cards-wrapper"> 
          <div v-for="card in myCards" :key="card.cardId" class="card-thumbnail" :class="{ active: selectedCard?.cardId === card.cardId }" @click="handleCardClick(card.cardId)">
            <img :src="card.image" class="card-image" :alt="card.cardName" />
          </div>
        </div> -->
      </div>
      <!-- 현재 위치/재검색 -->
      <!-- <div class="research-area"> -->
        
        
      <!-- </div> -->
    <!-- </div>
  </div> -->

  <!-- 하단 상세 정보 시트 -->
  <transition name="bottom-sheet">
    <div
      v-if="selectedMerchant && !payNavigatorMode"
      class="bottom-sheet-container"
    >
      <div class="bottom-sheet-content">
        <button @click="selectedMerchant = null" class="close-button">
          &times;
        </button>
        <h2 class="merchant-name">{{ selectedMerchant.name }}</h2>
        <p class="merchant-category">{{ categoryLabel }}</p>

        <!-- 혜택 리스트 -->
        <div class="benefits-list">
          <h3 class="benefits-title">받을 수 있는 혜택</h3>
          <!-- 혜택이 있을 경우 -->
          <div
            v-if="selectedMerchant.benefits && selectedMerchant.benefits.length"
          >
            <div
              v-for="benefit in selectedMerchant.benefits"
              :key="benefit.cardName + benefit.storeName"
              class="benefit-item"
              :class="{ primary: benefit.isPrimary }"
              @click="openPayNavigator"
            >
              <img
                v-if="benefit.cardImageUrl"
                :src="benefit.cardImageUrl || selectedCard.image"
                :alt="benefit.cardName"
                class="benefit-card-image"
              />
              <div class="benefit-text">
                <!-- 카드 이미지 -->

                <p class="benefit-desc">{{ benefit.description }}</p>
                <p class="benefit-card">
                  {{ benefit.cardName }}
                  <template v-if="benefit.rateValue">
                    | {{ benefit.rateValue }}% 할인</template
                  >
                  <template v-else-if="benefit.amountValue">
                    | {{ benefit.amountValue }}원 할인</template
                  >
                </p>
              </div>
              <span v-if="benefit.isPrimary">🥇</span>
            </div>

            <button class="navigator-button" @click="openPayNavigator">
              🥇 페이 네비게이터 실행하기
            </button>
          </div>
          <!-- 혜택이 없을 경우 -->
          <div v-else class="no-benefits">
            <p class="no-benefit-msg">
              해당 매장에서 받을 수 있는 혜택이 없습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- 🥇 페이 네비게이터 모드-->
  <transition name="bottom-sheet">
    <PayNavigator
      v-if="payNavigatorMode && selectedCard && selectedMerchant"
      :selectedCard="selectedCard"
      :selectedMerchant="selectedMerchant"
      @close="closePayNavigator"
    />
  </transition>
  <FanMyCards
  :my-cards="myCards"                 
  :selected-card="selectedCard"       
  :handle-card-click="handleCardClick"
  :bottom-offset="84"                
    />

</template>

<style>
@import '@/assets/main.css';
@import './map.css';
</style>
