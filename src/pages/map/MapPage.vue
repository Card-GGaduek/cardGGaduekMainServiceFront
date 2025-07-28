<template>
  <div>
    <!-- 지도 -->
    <div id="map" style="width:100%; height:400px;"></div>

    <!-- 검색 UI -->
    <div style="margin-top:10px;">
      <input v-model="keyword" placeholder="검색어 입력" />
      <label>
    혜택 매장만
    <input type="checkbox" v-model="benefit" />
  </label>

  <label style="margin-left:10px;">
    카테고리
    <select v-model="category">
      <option value="">전체</option>
      <option value="편의점">편의점</option>
      <option value="카페">카페</option>
      <option value="영화관">영화관</option>
      <option value="주유소">주유소</option>
    </select>
  </label>

  <button @click="searchStores" style="margin-left:10px;">검색</button>

    </div>

    <!-- 상세보기 모달 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ selectedStore.name }}</h3>
        <p>{{ selectedStore.address }}</p>
        <img :src="staticMapUrl" alt="Static Map" style="width:100%; margin:10px 0;" />
        <div v-if="selectedStore.benefitList?.length">
          <h4>혜택 정보</h4>
          <ul>
            <li v-for="benefit in selectedStore.benefitList" :key="benefit.cardName">
              {{ benefit.cardName }} - {{ benefit.discount }} ({{ benefit.description }})
            </li>
          </ul>
        </div>
        <button @click="openDirections">길찾기</button>
        <button @click="closeModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const map = ref(null);
const markers = ref([]);
const keyword = ref('');
const latitude = ref(37.4979); // 기본값: 강남
const longitude = ref(127.0276);
const benefit = ref(false);
const category = ref('');
const showModal = ref(false);
const selectedStore = ref({});
const staticMapUrl = ref('');

// 1. 지도 초기화
const initMap = () => {
  map.value = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(latitude.value, longitude.value),
    zoom: 15
  });
};

onMounted(() => {
  const check = setInterval(() => {
    if (window.naver && window.naver.maps) {
      clearInterval(check);
      initMap();
    }
  }, 200);
});

// 2. 구글맵에서 좌표 가져오기 → 검색 API → 마커 생성
const searchStores = async () => {
  try {
//     // 1. 구글에서 주소 -> 좌표 변환
//     const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//     const googleRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
//       params:{
//         address : keyword.value,
//         key : googleKey
//       }
//     });
//     const location = googleRes.data.results[0]?.geometry?.location;
//     if (!location) {
//       alert('검색 결과가 없습니다.');
//       return;
//     }
//     if (!keyword.value.trim()) {
//     alert('검색어를 입력해주세요.');
//     return;
// }
//     lat.value = location.lat;
//     lng.value = location.lng;

//     if (map.value) {
//       map.value.setCenter(new naver.maps.LatLng(lat.value, lng.value));
//     }

    // 2. 백엔드 검색 api 호출
    const res = await axios.get("http://localhost:8080/api/stores/search", {
      params: {
        latitude: latitude.value,
        longitude: longitude.value,
        keyword: keyword.value,
        benefit: benefit.value,
        storeCategory: category.value,
        radius : 10000 // 반경 10km
      }
    });

    const stores = res.data?.data || [];
    console.log('검색 결과 store 리스트:', stores);
    if (stores.length === 0) {
      alert('해당 조건에 맞는 매장이 없습니다.');
      return;
    }

    // 3. 기존 마커 제거
    markers.value.forEach(marker => marker.setMap(null));
    markers.value = [];

    // 4. 새 마커 생성
    stores.forEach(store => {
      console.log(`🧭 마커 좌표 확인: ID=${store.id}, lat=${store.latitude}, lng=${store.longitude}`);

      if (!store.latitude || !store.longitude) return;

      const position = new naver.maps.LatLng(store.latitude, store.longitude);
      const iconUrl = store.benefit
        ? '/icons/marker.png'
        : '/icons/marker.png';

        const marker = new naver.maps.Marker({
          position,
          map : map.value,
          icon : {
            url : iconUrl,
            size : new naver.maps.Size(32, 32),
            scaledSize : new naver.maps.Size(32, 32)
          }
    });
    console.log('마커 생성됨:', store.storeName);

    const infoWindow = new naver.maps.InfoWindow({
      content : `
      <div style = "width:150px;">
        <h4>${store.name}</h4>
        <p>${store.address}</p>
        <button id="detail-btn-${store.id}" class="detail-btn">상세보기</button>
        </div>`
    });
    console.log('서버 응답 전체:', res.data);
    naver.maps.Event.addListener(marker, 'click', () => {
      infoWindow.open(map.value, marker);
    });

     // InfoWindow가 렌더링된 이후 '상세보기' 버튼을 찾아 바인딩
     setTimeout(() => {
      const btn = document.getElementById(`detail-btn-${store.id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('✅ 상세보기 클릭됨:', store.id);
          openDetailModal(store.id);
        });
      } else {
        console.warn('❗ 상세보기 버튼을 찾을 수 없습니다.');
      }
    }, 50);
    
  });


  } catch(err) {
    console.error('검색 중 오류발생', err);
    alert('검색 중 문제가 발생했습니다. 다시 시도해주세요.');
  }
  
}

// 3. 상세보기 모달
const openDetailModal = async (id) => {
  const res = await axios.get(`/api/stores/${id}`);
  selectedStore.value = res.data?.data;

  staticMapUrl.value = `https://maps.apigw.ntruss.com/map-static/v2/raster?w=400&h=300&center=${selectedStore.value.longitude},${selectedStore.value.latitude}&level=16&markers=type:d|size:mid|pos:${selectedStore.value.longitude} ${selectedStore.value.latitude}&X-NCP-APIGW-API-KEY-ID=79nbqt46ij&X-NCP-APIGW-API-KEY=Tdy25QOVOcfxPPkOHfzWjxFojFZGiiWHrscl9e51`;

  showModal.value = true;
};

const openDirections = () => {
  const startLat = lat.value;
  const startLng = lng.value;
  const destLat = selectedStore.value.latitude;
  const destLng = selectedStore.value.longitude;

  const directionUrl = `https://map.naver.com/v5/directions/${startLng},${startLat}/to/${destLng},${destLat}`;
  window.open(directionUrl, '_blank');
};

const closeModal = () => {
  showModal.value = false;
};



</script>

<style>
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
}
</style>
