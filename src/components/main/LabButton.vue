<template>
  <div class="lab-button-section">
    <div class="lab-header">
      <h3 class="lab-title">요즘 소비, 재밌게 해야죠? 🤔</h3>
      <p class="lab-subtitle">
        이번 주 지갑 운세부터,<br>
        여름 미션까지 쏠쏠하게 챙겨보세요!
      </p>
    </div>

    <div class="lab-card" @click="goToLab">
      <div class="lab-content">
        <div class="lab-icon">
          <img src="@/assets/main/labmain.png" alt="실험실 아이콘" class="lab-icon-image" />
        </div>
        <div class="lab-info">
          <h4 class="lab-feature-title">여긴 소비 탐구실 🔍</h4>
          <p class="lab-feature-desc">지갑을 열기 전에, 먼저 실험해보세요!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLab = () => {
  router.push('/lab');
};
</script>

<style scoped>
.lab-button-section {
  padding: 20px;
  background-color: #f5f5f5;
}

.lab-header {
  margin-bottom: 20px;
}

.lab-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.lab-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
  line-height: 1.5;
}

.lab-card {
  background: white;
  border-radius: 16px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.lab-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.lab-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.lab-icon {
  width: 80px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.lab-icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.lab-info {
  flex: 1;
}

.lab-feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.lab-feature-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .lab-button-section {
    padding: 16px;
  }

  .lab-title {
    font-size: 18px;
  }

  .lab-subtitle {
    font-size: 13px;
  }

  .lab-card {
    padding: 16px;
  }

  .lab-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .lab-feature-title {
    font-size: 15px;
  }

  .lab-feature-desc {
    font-size: 13px;
  }
}
</style>