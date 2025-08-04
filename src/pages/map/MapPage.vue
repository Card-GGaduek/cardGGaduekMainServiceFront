<template>
  <div class="map-container">
    <div ref="mapDiv" class="map-view"></div>

    <!-- 검색 및 필터 UI -->
    <div class="controls-container">
      <div class="controls-box">
        
        <span>내 카드에 맞는 가맹점을 찾아보세요</span><br/>
        <div class="search-bar">
          <input 
            type="text" 
            v-model="keyword"
            @keyup.enter="updateMarkers"
            placeholder="내 카드 가맹점 검색" 
            class="search-input"
          />
          <button @click="updateMarkers" class="search-button">
            검색
          </button>
        </div>

        <!-- 카드 이미지 필터 UI -->
        <div class="filter-section">
          <p>MyCard</p>
            <div class="card-filter-buttons">
              <div
                  v-for="card in myCards"
                  :key="card.id"
                  @click="filterByCategory(card.category)"
                  class="card-image-wrapper"
                  :class="{ 'active': selectedCardCategory === card.category }"
              > 
                <img :src="card.image" :alt="card.name" class="card-image" />
              </div>
            </div>
        </div>
      </div>
      
      <div class="research-area">
        <button @click="handleSearch" class="research-button">
          📍 현재 지도에서 재검색
        </button>
        <button @click="moveToCurrentLocation" class="location-button" aria-label="현재 위치로 이동">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="location-icon">
          <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"></path>
        </svg>
      </button>
      </div>
    </div>


    <!-- 하단 상세 정보 시트 -->
    <transition name="bottom-sheet">
      <div v-if="selectedMerchant" class="bottom-sheet-container">
        <div class="bottom-sheet-content">
          <button @click="selectedMerchant = null" class="close-button">
            &times;
          </button>
          <h2 class="merchant-name">{{ selectedMerchant.name }}</h2>
          <p class="merchant-category">{{ selectedMerchant.primaryType }}</p>
          
          <div class="benefits-list">
            <h3 class="benefits-title">받을 수 있는 혜택</h3>
            <div v-for="benefit in selectedMerchant.benefits" :key="benefit.cardName" 
                 class="benefit-item" :class="{ 'primary': benefit.isPrimary }">
              <p class="benefit-desc">{{ benefit.description }}</p>
              <p class="benefit-card">{{ benefit.cardName }} | {{ benefit.rateValue }}% 할인</p>
              <span v-if="benefit.isPrimary">🥇</span>
            </div>
          </div>
          
          <button class="navigator-button">
            🥇 페이 내비게이터 실행하기
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useMap } from '@/pages/map/map';


const {
  mapDiv,
  keyword,
  myCards,
  selectedMerchant,
  selectedCardCategory,
  updateMarkers,
  onMarkerClick,
  filterByCategory,
  moveToCurrentLocation,
  handleSearch, 
} = useMap();

// 템플릿의 @click="updateMarkers" 부분을 @click="handleSearch"로 통일하거나,
// handleSearch의 이름을 updateMarkers로 변경하면 더 일관성 있어 보입니다.
</script>

<style scoped>
@import '@/assets/main.css';
@import './map.css';
</style>  