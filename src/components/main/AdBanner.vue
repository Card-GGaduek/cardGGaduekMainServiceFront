<template>
  <div class="ad-banner-section">
    <div class="ad-banner-container" ref="bannerContainer">
      <div class="ad-slide"
           v-for="(banner, index) in banners"
           :key="index"
           :class="{ 'active': index === currentIndex }"
           :style="{ transform: `translateX(${(index - currentIndex) * 100}%)` }"
           @click="handleBannerClick(index)">
        <img :src="banner.image" :alt="banner.alt" class="ad-image" @error="onImageError" @load="onImageLoad" />
      </div>
    </div>

    <!-- 인디케이터를 배너 컨테이너 밖으로 이동 -->
    <div class="ad-indicators">
      <span
          v-for="(banner, index) in banners"
          :key="index"
          class="indicator"
          :class="{ 'active': index === currentIndex }"
          @click="goToSlide(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const currentIndex = ref(0);
const bannerContainer = ref(null);
let autoSlideInterval = null;

// 이미지 경로를 직접 문자열로 설정 (가장 안전한 방법)
const banners = ref([
  {
    image: '/src/assets/main/event1.jpg',
    alt: '이벤트 배너 1',
    url: 'https://omoney.kbstar.com/quics?page=C016559#CP'
  },
  {
    image: '/src/assets/main/event2.jpg',
    alt: '이벤트 배너 2',
    url: 'https://omoney.kbstar.com/quics?page=C016559#CP'
  },
  {
    image: '/src/assets/main/event3.jpg',
    alt: '이벤트 배너 3',
    url: 'https://obank.kbstar.com/quics?page=C021695&cc=b033898:b033878&%EC%9D%B4%EB%B2%A4%ED%8A%B8%EC%9D%BC%EB%A0%A8%EB%B2%88%ED%98%B8=334165'
  },
  {
    image: '/src/assets/main/event4.jpg',
    alt: '이벤트 배너 4',
    url: 'https://obank.kbstar.com/quics?page=C021695&cc=b033898%3Ab033878&%EC%9D%B4%EB%B2%A4%ED%8A%B8%EC%9D%BC%EB%A0%A8%EB%B2%88%ED%98%B8=328440&urlparam=advrCmpgnID%3AADC0006419&abx_tid=1731186334795%3Aa5242b8e-e081-4558-9d72-f98a3d603786'
  }
]);

// 배너 클릭 이벤트 처리
const handleBannerClick = (index) => {
  const banner = banners.value[index];
  if (banner.url) {
    window.open(banner.url, '_blank');
  }
};

// 이미지 로드 성공
const onImageLoad = (event) => {
  console.log('Image loaded:', event.target.src);
};

// 이미지 로드 실패
const onImageError = (event) => {
  console.error('Image failed to load:', event.target.src);
  // 대체 이미지 설정 (선택사항)
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
};

// 다음 슬라이드로 이동
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % banners.value.length;
};

// 특정 슬라이드로 이동
const goToSlide = (index) => {
  currentIndex.value = index;
  resetAutoSlide();
};

// 자동 슬라이드 시작
const startAutoSlide = () => {
  autoSlideInterval = setInterval(nextSlide, 3000);
};

// 자동 슬라이드 리셋
const resetAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
  startAutoSlide();
};

onMounted(() => {
  startAutoSlide();
});

onUnmounted(() => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
});
</script>

<style scoped>
.ad-banner-section {
  width: 100%;
  background-color: #fff;
  padding: 15px 0 15px 0;
}

.ad-banner-container {
  position: relative;
  width: 100%;
  height: 70px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.ad-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
  cursor: pointer; /* 클릭 가능하다는 것을 나타내는 커서 */
}

.ad-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background-color: #f0f0f0;
}

.ad-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 10px 0;
  background-color: #fff;
}

.indicator {
  width: 20px;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(204, 204, 204, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: #333;
  width: 24px;
}

.indicator:hover {
  background-color: rgba(153, 153, 153, 0.8);
}

.indicator.active:hover {
  background-color: #333;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .ad-banner-container {
    height: 100px;
  }

  .ad-indicators {
    padding: 8px 0;
  }

  .indicator {
    width: 16px;
    height: 3px;
  }

  .indicator.active {
    width: 20px;
  }
}

@media (max-width: 480px) {
  .ad-banner-container {
    height: 80px;
  }

  .indicator {
    width: 12px;
    height: 3px;
  }

  .indicator.active {
    width: 16px;
  }
}
</style>