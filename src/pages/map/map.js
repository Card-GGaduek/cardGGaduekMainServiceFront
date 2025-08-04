import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

import shinhanCardImage from '@/assets/images/cards/shinhandeepdream.png';
import hyundaiCardImage from '@/assets/images/cards/hyundaizero.png';
import kbCardImage from '@/assets/images/cards/kb_tantandaero.png';

export function useMap() {
  const map = ref(null);
  const mapDiv = ref(null);
  const markers = ref([]);
  const currentLocationMarker = ref(null);
  const watchId = ref(null);
  const keyword = ref('');
  const selectedCardCategory = ref('');
  const selectedMerchant = ref(null);
  const myCards = ref([
    { id: 1, name: '신한 Deep Dream', category: 'coffee_shop', color: '#00469B', image: shinhanCardImage ,color: '#00469B'},
    { id: 2, name: '현대 Zero', category: 'convenience_store', color: '#1E1E1E', image: hyundaiCardImage ,color: '#1E1E1E'},
    { id: 3, name: '국민 탄탄대로', category: 'movie_theater', color: '#6A483C', image: kbCardImage ,color: '#6A483C'}
  ]);

  onMounted(() => {
    initMap();
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
    startWatchingLocation();
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
                content: `<div style="width:20px;height:20px;background-color:#ffcd39;border:2px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>`,
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

  const moveToCurrentLocation = () => {
    if (currentLocationMarker.value) {
      map.value.panTo(currentLocationMarker.value.getPosition());
      map.value.setZoom(15);
    }
  };

  const handleSearch = async () => {
    if (!map.value) return;

    markers.value.forEach(marker => marker.setMap(null));
    markers.value = [];

    if (!keyword.value.trim()) {
      console.warn("검색어가 비어 있습니다. 검색을 실행하지 않습니다.");
      return;
    }

    const bounds = map.value.getBounds(); // ✅ 수정된 부분
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
    if (selectedCardCategory.value) {
      requestBody.category = selectedCardCategory.value
    }
    console.log("가맹점 검색 요청:", requestBody);


    try {
      const response = await axios.post('http://localhost:8080/api/place', requestBody);
      const places = response.data?.data?.places || [];
      console.log("가맹점 검색 결과:", places);
      console.log(response.data)
      places.forEach(createMarker);
    } catch (error) {
      console.error("가맹점 검색에 실패했습니다:", error);
    }
  };
  
  const createMarker = (place) => {
    const position = new window.naver.maps.LatLng(place.locationDTO.latitude, place.locationDTO.longitude);
    const markerColor = myCards.value.find(c => c.category === place.primaryType)?.color || '#ffcd39';

    const marker = new window.naver.maps.Marker({
      position,
      map: map.value,
      icon: {
        content: `<div style="background-color: ${markerColor}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        anchor: new window.naver.maps.Point(11, 11),
      },

    });

    window.naver.maps.Event.addListener(marker, 'click', () => {
      selectedMerchant.value = place;
      onMarkerClick(3, place.name);
      map.value.panTo(position);
      map.value.setZoom(16);
      console.log("Marker clicked:", place);
      console.log("Selected Merchant:", selectedMerchant.value);

    });

    markers.value.push(marker);
  };

  async function getStoreBenefits(memberId) {
    try {
      const response = await axios.get(`http://localhost:8080/api/card/front/${memberId}`);
      return response.data.data || [];
    } catch (error) {
      console.error("가맹점 혜택 조회에 실패했습니다:", error);
      return [];
    }
  }

  const onMarkerClick = async (place) => {
    const memberId = 4;
    const benefits = await getStoreBenefits(memberId, place.name);

    selectedMerchant.value = {
      name : store.namem,
      primaryType: store.primaryType,
      location: store.location,
      benefits: benefits,
    };
  };



  const filterByCategory = (category) => {
    selectedCardCategory.value = selectedCardCategory.value === category ? '' : category;
    handleSearch();
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
    onMarkerClick,
    moveToCurrentLocation,
    handleSearch,
    filterByCategory,
    initMap,
    startWatchingLocation,
    createMarker
  };
}
