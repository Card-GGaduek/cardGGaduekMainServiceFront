// src/lib/useNaverMap.js
import { ref, watch } from 'vue';
import placeApi from '@/api/placeApi';

export function useNaverMap(ncpKeyId) {
  const defaultCenter = { lat: 37.5665, lng: 126.978 };
  const center = ref({ ...defaultCenter });
  const rectangle = ref({
    low: { latitude: null, longitude: null },
    high: { latitude: null, longitude: null },
  });

  let mapInstance = null;
  let myLocationMarker = null;
  const currentStoreMarkers = ref([]); // [ { latitude, longitude, marker } ]

  function loadNaverMapScript() {
    return new Promise((resolve, reject) => {
      if (window.naver && window.naver.maps) {
        resolve();
        return;
      }
      if (document.getElementById('naver-map-script')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'naver-map-script';
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${ncpKeyId}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('네이버지도 스크립트 로드 실패'));
      document.head.appendChild(script);
    });
  }

  let externalBoundsChangedCallback = null;
  // ★ bounds -> rectangle ref 업데이트
  function updateRectangle() {
    if (!mapInstance) return;
    const bounds = mapInstance.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();
    rectangle.value = {
      low: { latitude: sw.lat(), longitude: sw.lng() },
      high: { latitude: ne.lat(), longitude: ne.lng() },
    };

    // console.log(rectangle.value);
    // 외부에서 등록된 콜백이 있으면 실행
    if (typeof externalBoundsChangedCallback === 'function') {
      externalBoundsChangedCallback();
    }
  }

  // 외부 컴포넌트에서 지도 이동 이벤트를 감지할 수 있도록 콜백 등록 함수 제공
  function registerOnMapMove(callbackFn) {
    externalBoundsChangedCallback = callbackFn;
  }

  // 지도 인스턴스 생성
  async function initNaverMap(div, onBoundsChanged) {
    await loadNaverMapScript();
    mapInstance = new window.naver.maps.Map(div, {
      center: new window.naver.maps.LatLng(center.value.lat, center.value.lng),
      zoom: 15,
    });
    setOrMoveMyLocationMarker(center.value.lat, center.value.lng);
    updateRectangle();
    // 지도가 이동할 때마다 rectangle도 동기화
    window.naver.maps.Event.addListener(
      mapInstance,
      'bounds_changed',
      updateRectangle
    );
  }

  // 내 위치 마커 생성 또는 이동
  function setOrMoveMyLocationMarker(lat, lng) {
    if (!mapInstance) return;
    const position = new window.naver.maps.LatLng(lat, lng);
    if (!myLocationMarker) {
      myLocationMarker = new window.naver.maps.Marker({
        position,
        map: mapInstance,
        icon: {
          content: `<div style="width:22px;height:22px;border-radius:50%;background:#4169e1;border:3px solid #fff;box-shadow:0 0 6px #87ceeb;"></div>`,
          anchor: new window.naver.maps.Point(11, 11),
        },
      });
    } else {
      myLocationMarker.setPosition(position);
    }
  }

  async function addMarkersByStoreName(storeName) {
    if (!mapInstance) return;

    currentStoreMarkers.value.forEach(({ marker }) => {
      if (marker) marker.setMap(null);
    });
    currentStoreMarkers.value = [];

    try {
      const result = await placeApi.getPlacesByTextAndViewPort(
        storeName,
        rectangle.value
      );

      console.log(result.places);

      result.places.forEach((place) => {
        if (place.locationDTO) {
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(
              place.locationDTO.latitude,
              place.locationDTO.longitude
            ),
            map: mapInstance,
          });

          console.log(place.name);

          currentStoreMarkers.value.push({
            latitude: place.locationDTO.latitude,
            longitude: place.locationDTO.longitude,
            marker,
          });
        }
      });
    } catch (e) {
      console.warn(`📍 ${storeName} 검색 실패:`, e.message);
    }
  }

  async function addMarkersByStoreNameList(storeNames) {
    if (!mapInstance) return;
    // 기존 마커 제거 (필요 시)
    currentStoreMarkers.value.forEach(({ marker }) => {
      if (marker) marker.setMap(null);
    });
    currentStoreMarkers.value = [];

    for (const storeName of storeNames) {
      try {
        const result = await placeApi.getPlacesByTextAndViewPort(
          storeName,
          rectangle.value
        );

        console.log(result.places);

        result.places.forEach((place) => {
          if (place.locationDTO) { 
            const marker = new window.naver.maps.Marker({
              position: new window.naver.maps.LatLng(
                place.locationDTO.latitude,
                place.locationDTO.longitude
              ),
              map: mapInstance,
            });

            console.log(place.displayName.text);

            currentStoreMarkers.value.push({
              latitude: place.locationDTO.latitude,
              longitude: place.locationDTO.longitude,
              marker,
            });
          }
        });
      } catch (e) {
        console.warn(`📍 ${storeName} 검색 실패:`, e.message);
      }
    }
  }

  function clearAllStoreMarkers() {
    currentStoreMarkers.value.forEach(({ marker }) => {
      if (marker) marker.setMap(null);
    });
    currentStoreMarkers.value = [];
  }

  // center 값 바뀔 때마다 지도, 마커 위치 갱신
  watch(center, () => {
    if (mapInstance && center.value) {
      mapInstance.setCenter(
        new window.naver.maps.LatLng(center.value.lat, center.value.lng)
      );
      setOrMoveMyLocationMarker(center.value.lat, center.value.lng);
      updateRectangle();
    }
  });

  // 내 위치로 이동
  function moveToMyLocation() {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        center.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      },
      () => {
        alert('위치 정보를 가져올 수 없습니다.');
      }
    );
  }

  // mount 될 때 최초 내 위치로
  async function setCenterToCurrentLocationOrDefault() {
    let foundLocation = defaultCenter;
    if (navigator.geolocation) {
      try {
        foundLocation = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              }),
            () => resolve(defaultCenter)
          );
        });
      } catch {
        foundLocation = defaultCenter;
      }
    }
    center.value = foundLocation;
  }

  return {
    center,
    rectangle,
    initNaverMap,
    setCenterToCurrentLocationOrDefault,
    moveToMyLocation,
    addMarkersByStoreNameList,
    addMarkersByStoreName,
    registerOnMapMove,
    clearAllStoreMarkers,
  };
}