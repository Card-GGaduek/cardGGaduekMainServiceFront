<script setup>
import { ref } from 'vue';
import { useMap } from '@/pages/map/map';
import axios from 'axios';

const mapDiv = ref(null);

const {
  keyword,
  selectedCard,
  selectedMerchant,
  handleSearch,
  moveToCurrentLocation,
  myCards,
} = useMap(mapDiv);

// 모달 관리용 변수
const selectedCardDetail = ref(null);
const selectedCardDetailModal = ref(false);

// 카드 클릭 시 혜택 모달 호출
const handleCardClick = async (cardId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/main/card/${cardId}/back`);
    selectedCardDetail.value = response.data.data;
    selectedCardDetailModal.value = true;
  } catch (error) {
    console.error('카드 상세 정보를 불러오지 못했습니다:', error);
  }
};
</script>
<template>
  <div class="map-container">
    <!-- 지도 영역 -->
    <div ref="mapDiv" class="map-view"></div>

    <!-- 검색 및 MyCard UI -->
    <div class="controls-container">
      <div class="controls-box">
        <p class="title">내 카드로 혜택을 적용할 수 있는 매장을 찾아보세요</p>


      
        
        <!-- 선택된 카드 보여주기 -->
        <div class="selected-card-box" v-if="selectedCard">
          <img :src="selectedCard.image" :alt="selectedCard.name" class="selected-card-img" />
          <div class="selected-card-info">
            <p class="card-name">카드명:  {{ selectedCard.name }}</p>
            <p class="card-category">카테고리: {{ selectedCard.category }}</p>
          </div>
        </div>
        
        <!-- 검색창 -->
        <div class="search-bar">
          <input
          v-model="keyword"
          @keyup.enter="handleSearch"
          placeholder="매장 키워드를 입력하세요"
          class="search-input"
          />
          <button @click="handleSearch" class="search-button">검색</button>
        </div>
        <!-- 카드 리스트 보여주기 (클릭 시 상세 모달) -->
        <div class="my-cards-wrapper">
          <div v-for="card in myCards" :key="card.cardId" class="card-thumbnail" :class="{ active: selectedCard?.cardId === card.cardId }" @click="handleCardClick(card.cardId)">
            <img :src="card.image" class="card-image" :alt="card.cardName" />
          </div>
        </div>
      </div>
      
      <!-- 현재 위치/재검색 -->
      <div class="research-area">
        <button @click="handleSearch" class="research-button">📍 현재 지도에서 재검색</button>
        <button @click="moveToCurrentLocation" class="location-button" aria-label="현재 위치로 이동">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 하단 상세 정보 시트 -->
<transition name="bottom-sheet">
  <div v-if="selectedMerchant" class="bottom-sheet-container">
    <div class="bottom-sheet-content">
      <button @click="selectedMerchant = null" class="close-button">&times;</button>
      <h2 class="merchant-name">{{ selectedMerchant.name }}</h2>
      <p class="merchant-category">{{ selectedMerchant.primaryType }}</p>

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
            :class="{ 'primary': benefit.isPrimary }"
          >
            <p class="benefit-desc">{{ benefit.description }}</p>
            <p class="benefit-card">
              {{ benefit.cardName }}
              <template v-if="benefit.rateValue"> | {{ benefit.rateValue }}% 할인</template>
              <template v-else-if="benefit.amountValue"> | {{ benefit.amountValue }}원 할인</template>
            </p>
            <span v-if="benefit.isPrimary">🥇</span>
          </div>
        </div>

        <!-- 혜택이 없을 경우 -->
        <div v-else>
          <p class="no-benefit-msg">적용 가능한 카드 혜택이 없습니다.</p>
        </div>
      </div>

      <button class="navigator-button">🥇 페이 내비게이터 실행하기</button>
    </div>
  </div>
</transition>

    
  </div>
</template>



<style>
@import '@/assets/main.css';
@import './map.css';


</style>