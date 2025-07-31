import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

// 카드 이미지 import
import shinhanCardImage from '@/assets/images/cards/shinhandeepdream.png';
import hyundaiCardImage from '@/assets/images/cards/hyundaizero.png';
import kbCardImage from '@/assets/images/cards/kb_tantandaero.png';

export function useMap() {
     
// --- 상태 관리 (State) ---
const map = ref(null);
const mapDiv = ref(null);
const markers = ref([]);
const currentLocationMarker = ref(null);
const watchId = ref(null);
const keyword = ref('');
const selectedCardCategory = ref('');
const selectedMerchant = ref(null);
const myCards = ref([
  { id: 1, name: '신한 Deep Dream', category: 'coffee_shop', color: '#00469B', image: shinhanCardImage },
  { id: 2, name: '현대 Zero', category: 'convenience_store', color: '#1E1E1E', image: hyundaiCardImage },
  { id: 3, name: '국민 탄탄대로', category: 'movie_theater', color: '#6A483C', image: kbCardImage }
]);

// --- 라이프사이클 훅 ---
onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value);
  }
});

// --- 지도 및 위치 관련 로직 ---

/**
 * 네이버 지도를 초기화하고, 이벤트 리스너를 등록하며, 위치 추적을 시작합니다.
 */
const initMap = () => {
    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5665, 126.9780), // 기본 위치: 서울시청
      zoom: 15,
      minZoom: 6,
    };
    map.value = new window.naver.maps.Map(mapDiv.value, mapOptions);
  
    startWatchingLocation();
  };
  
  /**
   * 브라우저의 Geolocation API를 사용하여 사용자의 위치를 실시간으로 추적합니다.
   */
  const startWatchingLocation = () => {
    if (navigator.geolocation) {
      watchId.value = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition = new window.naver.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
  
          if (!currentLocationMarker.value) {
            // 최초 위치 수신: 마커를 생성하고, 지도를 해당 위치로 이동시킨 후 검색 실행
            currentLocationMarker.value = new window.naver.maps.Marker({
              position: newPosition,
              map: map.value,
              icon: {
                content: `<div style="width:20px;height:20px;background-color:#ffcd39;border:2px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>`,
                anchor: new window.naver.maps.Point(10, 10),
              },
            });
            map.value.setCenter(newPosition);
            handleSearch();
          } else {
            // 이후 위치 변경: 마커 위치만 업데이트
            currentLocationMarker.value.setPosition(newPosition);
          }
        },
        (error) => {
          console.error("위치 정보를 가져오는 데 실패했습니다:", error.message);
          // 위치 정보 실패 시 기본 위치에서 검색 실행
          handleSearch();
        }
      );
    } else {
      console.error("이 브라우저는 위치 정보를 지원하지 않습니다.");
      // 위치 정보 미지원 시 기본 위치에서 검색 실행
      handleSearch();
    }
  };
  
  /**
   * '내 위치' 버튼 클릭 시, 저장된 현재 위치로 지도를 부드럽게 이동시킵니다.
   */
  const moveToCurrentLocation = () => {
    if (currentLocationMarker.value) {
      map.value.panTo(currentLocationMarker.value.getPosition());
      map.value.setZoom(15);
    }
  };
  
  // --- 가맹점 검색 및 마커 관련 로직 ---
  
  /**
   * 검색 및 필터 상태를 기반으로 백엔드에 가맹점을 요청하고 마커를 업데이트합니다.
   */
  const handleSearch = async () => {
    if (!map.value) return;
  
    // 1. 기존 가맹점 마커 제거
    markers.value.forEach(marker => marker.setMap(null));
    markers.value = [];
  
    // 2. 현재 지도 영역 좌표 가져오기
    const bounds = map.value.getBounds();
    const params = {
      name: keyword.value,
      minLatitude: bounds.getSW().lat(),
      minLongitude: bounds.getSW().lng(),
      maxLatitude: bounds.getNE().lat(),
      maxLongitude: bounds.getNE().lng(),
    };
  console.log( 
    'name:', params.name,
    'minLatitude:', params.minLatitude,
    'minLongitude:', params.minLongitude,
    'maxLatitude:', params.maxLatitude,
    'maxLongitude:', params.maxLongitude,)

    if (selectedCardCategory.value) {
      params.category = selectedCardCategory.value;
    }
  
    try {
      // 3. 백엔드 API로 가맹점 데이터 요청
      const response = await axios.get('http://localhost:8080/api/place', { params });
      const places = response.data?.data?.places || [];
      
      // 4. 검색 결과를 바탕으로 새 마커 생성
      places.forEach(createMarker);
    } catch (error) {
      console.error("가맹점 검색에 실패했습니다:", error);
    }
  };
  
  /**
   * 가맹점 데이터 하나를 받아 지도에 마커를 생성하고 클릭 이벤트를 추가합니다.
   * @param {object} place - 가맹점 정보 객체
   */
  const createMarker = (place) => {
    const position = new window.naver.maps.LatLng(place.location.latitude, place.location.longitude);
    const markerColor = myCards.value.find(c => c.category === place.primaryType)?.color || '#888';
  
    const marker = new window.naver.maps.Marker({
      position,
      map: map.value,
      icon: {
        content: `<div style="background-color: ${markerColor}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        anchor: new window.naver.maps.Point(11, 11),
      },
    });
  
    // 마커 클릭 시 바텀시트를 띄우기 위해 selectedMerchant 상태 업데이트
    window.naver.maps.Event.addListener(marker, 'click', () => {
      selectedMerchant.value = place;
    });
  
    markers.value.push(marker);
  };
  
  /**
   * 카드 카테고리를 필터링하고 재검색을 실행합니다.
   * @param {string} category - 필터링할 카테고리명
   */
  const filterByCategory = (category) => {
    // 이미 선택된 카테고리를 다시 클릭하면 필터 해제, 아니면 새로운 카테고리로 설정
    selectedCardCategory.value = selectedCardCategory.value === category ? '' : category;
    handleSearch(); // 변경된 필터로 즉시 재검색
  };

  return {
    mapDiv,
    map,
    markers,
    currentLocationMarker,
    watchId,
    keyword,
    selectedCardCategory,
    selectedMerchant,
    myCards,
    moveToCurrentLocation,
    handleSearch,
    filterByCategory,
    initMap,
    startWatchingLocation,
    createMarker,
    filterByCategory
  };
}

