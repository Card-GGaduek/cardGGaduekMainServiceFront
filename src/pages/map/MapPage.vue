<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMap } from '@/pages/map/map';
import PayNavigator from '@/pages/map/PayNavigator.vue';
import WalletButton from '@/pages/map/WalletButton.vue';

const route = useRoute();
const mapDiv = ref(null);
const walletMessage = ref('내 주변 혜택을 받을 수 있는 매장을 검색해보세요');

const selectedCardId = ref('');
const selectableBenefits = computed(
  () => selectedCard.value?.storeBenefitList ?? []
);

const {
  keyword,
  selectedMerchant,
  selectedCard,
  selectedStoreName,
  categoryColorMap,
  categoryLabel,
  isSearching,
  myCards,
  isMapReady,
  noBenefitAlert,
  handleSearch,
  handleCardClick,
  moveToCurrentLocation,
  onMapReady,
  searchByStoreName,
  showNoBenefitMessage,
} = useMap(mapDiv);

// 도착 시 1회만 자동검색
const arrivalSearched = ref(false);

// (A) 맵이 이미 준비된 뒤에 라우트 키워드가 들어오는 경우
watch(
  () => route.query.keyword,
  (k) => {
    const kk = String(k ?? '').trim();
    if (!kk || arrivalSearched.value) return;
    if (isMapReady.value) {
      arrivalSearched.value = true;
      keyword.value = kk;
      handleSearch();
    }
  },
  { immediate: true }
);

// (B) 라우트 키워드는 있는데 맵이 늦게 준비되는 경우
onMapReady(() => {
  if (arrivalSearched.value) return;
  const kk = String(route.query.keyword ?? '').trim();
  if (!kk) return;
  arrivalSearched.value = true;
  keyword.value = kk;
  handleSearch();
});

// 2. 카드 스와이퍼에서 넘어올 경우
// 카드 매장 누적 검색
const headerMessage = computed(() =>
  isSearching.value ? '매장을 검색중입니다' : walletMessage.value
);
watch(
  () => route.query.cardId,
  (newCardId) => {
    if (route.query.autoSearch && newCardId) {
      console.log('자동 실행 - cardId:', newCardId);
      if (newCardId) handleCardClick(Number(newCardId));
    }
  },
  { immediate: false }
);

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
    <!-- 지도 영역 -->
    <div ref="mapDiv" class="map-view"></div>

    <!-- 검색 및 MyCard UI -->
    <div class="controls-container">
      <div class="controls-box">
        <p class="title">
          {{ headerMessage }}
        </p>
        <!-- 가맹점 선택 -->
        <select
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
        </select>

        <!-- 검색창 + 지갑 -->
        <div class="search-bar">
          <input
            v-model="keyword"
            @keyup.enter="handleSearch"
            placeholder="매장 키워드를 입력하세요"
            class="search-input"
          />
          <WalletButton
            :myCards="myCards"
            :selectedCard="selectedCard"
            :handleCardClick="handleCardClick"
            @update-message="walletMessage = $event"
          />
          <button @click="handleSearch" class="search-button">검색</button>
        </div>

        <!-- 카드 리스트 보여주기 (클릭 시 누적 검색) -->
        <!-- <div class="my-cards-wrapper"> 
          <div v-for="card in myCards" :key="card.cardId" class="card-thumbnail" :class="{ active: selectedCard?.cardId === card.cardId }" @click="handleCardClick(card.cardId)">
            <img :src="card.image" class="card-image" :alt="card.cardName" />
          </div>
        </div> -->
      </div>
      <!-- 현재 위치/재검색 -->
      <div class="research-area">
        <button @click="handleSearch" class="research-button">
          📍 현재 지도에서 재검색
        </button>
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
      </div>
    </div>
  </div>

  <!-- 혜택 가능한 매장이 없을 때 알림 -->
  <transition name="fade">
    <div v-if="noBenefitAlert" class="no-benefit-alert">
      조건에 맞는 혜택 가능한 매장이 없습니다.
    </div>
  </transition>

  <!-- 하단 상세 정보 시트 -->
  <transition name="bottom-sheet">
    <div
      v-if="selectedMerchant && !payNavigatorMode"
      class="bottom-sheet-container"
    >
      <div class="bottom-sheet-content">
        <div class="sheet-handle" role="presentation" aria-hidden="true"></div>
        <button @click="selectedMerchant = null" class="close-button">
          &times;
        </button>
        <p class="merchant-name">
          {{ selectedMerchant.name }}
        </p>

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
</template>

<style>
@import '@/assets/main.css';
@import './map.css';
@import './alym.css';
</style>
