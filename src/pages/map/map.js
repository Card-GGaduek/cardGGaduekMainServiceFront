import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

import shinhanCardImage from '@/assets/images/cards/shinhandeepdream.png';
import hyundaiCardImage from '@/assets/images/cards/hyundaizero.png';
import kbCardImage from '@/assets/images/cards/kb_tantandaero.png';
import { cat } from 'fontawesome';
import { useRoute, useRouter } from 'vue-router';

export function useMap() {
  const map = ref(null);
  const mapDiv = ref(null);
  const markers = ref([]);
  const currentLocationMarker = ref(null);
  const watchId = ref(null);

  const keyword = ref('');
  const selectedCardCategory = ref('');
  const selectedMerchant = ref(null);

  const route = useRoute();
  const router = useRouter();
  const selectedCard = ref(null);
  const mapMarkers = ref([]);

  const myCards = ref([
    { id: 1, name: '신한 Deep Dream', category: 'coffee_shop', color: '#00469B', image: shinhanCardImage },
    { id: 2, name: '현대 Zero', category: 'convenience_store', color: '#1E1E1E', image: hyundaiCardImage },
    { id: 3, name: '국민 탄탄대로', category: 'movie_theater', color: '#6A483C', image: kbCardImage }
  ]);

  onMounted(async () => {
    initMap();
    moveToCurrentLocation();
    loadMyCards(4);
  });

  onUnmounted(() => {
    if (watchId.value) {
      navigator.geolocation.clearWatch(watchId.value);
    }
  });

  const initMap = () => {
    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5665, 126.9780),
      zoom: 15,
      minZoom: 6,
    };
    map.value = new window.naver.maps.Map(mapDiv.value, mapOptions);
  };

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("현재 위치를 사용할 수 없습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const location = new window.naver.maps.LatLng(lat, lng);
        map.value.setCenter(location);

        if (currentLocationMarker.value) {
          currentLocationMarker.value.setMap(null);
        }

        currentLocationMarker.value = new window.naver.maps.Marker({
          position: location,
          map: map.value,
          icon: {
            content: `
              <div class=\"animated-location-marker\">
                <div class=\"marker-core\"></div>
                <div class=\"marker-wave\"></div>
              </div>
            `,
          },
        });
      },
      (error) => {
        alert("위치 정보를 가져올 수 없습니다.");
        console.error("Geolocation error:", error);
      }
    );
  };

  const handleSearch = async () => {
    if (!map.value) return;
  
    markers.value.forEach(marker => marker.setMap(null));
    markers.value = [];
  
    if (!keyword.value.trim()) {
      console.warn("검색어가 비어 있습니다. 검색을 실행하지 않습니다.");
      return;
    }
  
    const bounds = map.value.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();
  
    const requestBody = {
      textQuery: keyword.value,
      languageCode: "ko",
      locationBias: {
        rectangle: {
          low: {
            latitude: sw.y,
            longitude: sw.x
          },
          high: {
            latitude: ne.y,
            longitude: ne.x
          }
        }
      }
    };
    console.log("검색 요청 바디:", requestBody);
  
    // ✅ 로그로 현재 선택된 카테고리 확인
    console.log("선택된 카드 category:", selectedCardCategory.value);

    const categoryMap = {
      'coffee_shop': '커피전문점',
      'convenience_store': '편의점',
      'movie_theater': '영화관',
      'restaurant': '음식점',
      'gas_station': '주유소',
      'theme_park': '놀이공원',
      'hotel': '호텔'
    };
    
    const mappedCategory = categoryMap[selectedCardCategory.value] || selectedCardCategory.value;
    requestBody.category = mappedCategory;
    
  
    if (selectedCardCategory.value) {
      requestBody.category = selectedCardCategory.value;
    } else {
      console.warn("선택된 카드의 카테고리가 비어 있습니다. 검색 요청 중단.");
      return;
    }
  
    // ✅ 최종 요청 로그 출력
    console.log("가맹점 검색 요청:", requestBody);
  
    try {
      const response = await axios.post('http://localhost:8080/api/place', requestBody);
      const places = response.data?.data?.places || [];
  
      if (places.length === 0) {
        console.warn("검색된 매장이 없습니다.");
      }
  
      places.forEach(createMarker);
    } catch (error) {
      console.error("가맹점 검색에 실패했습니다:", error);
    }
  };
  

  const loadMyCards = async (memberId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/main/card/list?memberId=${memberId}`);

      myCards.value = response.data.data.map(card => ({
        ...card,
        cardId: card.cardId,
        cardName: card.cardName,
        image: card.cardImageUrl,
        category: card.category
      }));

      const selectedId = Number(route.query.cardId);
      if (!selectedId) return;

      const matchedCard = myCards.value.find(card => card.cardId === selectedId);
      if (matchedCard) {
        selectedCardCategory.value = matchedCard.category;
        selectedCard.value = matchedCard;

        // ✅ 자동으로 URL에 쿼리 파라미터 붙이기
        router.replace({
          query: {
            ...route.query,
            cardId: matchedCard.cardId
          }
        });
      }
    } catch (error) {
      console.error("카드 목록을 불러오는 데 실패했습니다:", error);
    }
  };

  const createMarker = (place) => {
    const position = new window.naver.maps.LatLng(place.locationDTO.latitude, place.locationDTO.longitude);
    const markerColor = myCards.value.find(c => c.category === place.primaryType)?.color || '#ffcd39';

    const marker = new window.naver.maps.Marker({
      position,
      map: map.value,
      icon: {
        content: `<div style=\"background-color: ${markerColor}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\"></div>`,
        anchor: new window.naver.maps.Point(11, 11),
      },
    });

    window.naver.maps.Event.addListener(marker, 'click', () => {
      selectedMerchant.value = place;
    });

    markers.value.push(marker);
  };

  const getStoreBenefits = async (memberId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/card/front/${memberId}`);
      return response.data.data || [];
    } catch (error) {
      console.error("가맹점 혜택 조회에 실패했습니다:", error);
      return [];
    }
  };

  const onMarkerClick = async (place) => {
    const memberId = 4;
    const benefits = await getStoreBenefits(memberId, place.name);

    selectedMerchant.value = {
      name: place.name,
      primaryType: place.primaryType,
      location: place.location,
      benefits,
    };
  };

  const startWatchingLocation = () => {
    if (navigator.geolocation) {
      watchId.value = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition = new window.naver.maps.LatLng(position.coords.latitude, position.coords.longitude);

          if (!currentLocationMarker.value) {
            currentLocationMarker.value = new window.naver.maps.Marker({
              position: newPosition,
              map: map.value,
              icon: {
                content: `<div style=\"width:20px;height:20px;background-color:#ffcd39;border:2px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.5);\"></div>` ,
                anchor: new window.naver.maps.Point(10, 10),
              },
            });
            map.value.setCenter(newPosition);
            handleSearch();
          } else {
            currentLocationMarker.value.setPosition(newPosition);
          }
        },
        (error) => {
          console.error("위치 정보를 가져오는 데 실패했습니다:", error.message);
          handleSearch();
        }
      );
    } else {
      console.error("이 브라우저는 위치 정보를 지원하지 않습니다.");
      handleSearch();
    }
  };

  return {
    map,
    mapDiv,
    markers,
    currentLocationMarker,
    watchId,
    keyword,
    selectedCardCategory,
    selectedMerchant,
    myCards,
    selectedCard,
    mapMarkers,
    handleSearch,
    useRoute,
    moveToCurrentLocation,
    initMap,
    loadMyCards,
  };
}
