<template>
  <div class="mission-card">
    <div class="mission-header">
      <img src="@/assets/lab/mission_icon.png" class="mission-icon" />
      <div>
        <h2 class="mt-3 mx-3">
          시즌별 미션 <span class="end-date">~{{ endDate }}</span>
        </h2>
        <p class="description mx-3">미션 성공 시 관련 쿠폰이 까득</p>
      </div>
    </div>

    <div v-if="missions.length === 0" class="empty-message">
      진행 중인 미션이 없습니다.
    </div>

    <div v-else class="mission-list mt-4">
      <div
        v-for="mission in missions"
        :key="mission.missionId"
        class="mission-item"
        :class="{ success: mission.isSuccess }"
      >
        <!-- 미션 성공시 기존 스타일 유지 -->
        <template v-if="mission.isSuccess">
          <span class="mission-title">{{ mission.missionTitle }}</span>
          <span class="mission-status">미션 성공</span>
        </template>

        <!-- 진행중인 미션에 프로그레스 바 적용 -->
        <template v-else>
          <div class="progress-container">
            <div
              class="progress-fill"
              :style="{ width: getProgressPercentage(mission) + '%' }"
            ></div>
            <div class="progress-content">
              <span class="mission-title">{{ mission.missionTitle }}</span>
              <span class="mission-status">
                {{ mission.progressValue }} / {{ mission.goalValue }}
              </span>
            </div>
            <!-- 흰색 텍스트 레이어 (채워진 부분에만 표시) -->
            <div
              class="progress-text-overlay"
              :style="{ width: getProgressPercentage(mission) + '%' }"
            >
              <span class="mission-title">{{ mission.missionTitle }}</span>
            </div>
          </div>
        </template>
        <!-- <span class="mission-title">{{ mission.missionTitle }}</span>
        <span class="mission-status">
          <template v-if="mission.isSuccess">미션 성공</template>
          <template v-else
            >{{ mission.progressValue }} / {{ mission.goalValue }}</template
          >
        </span> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  missions: {
    type: Array,
    default: () => [],
  },
});

// 모든 미션의 종료일은 동일하다고 가정 → 첫 번째 미션에서 가져오기
const endDate = computed(() => {
  if (!props.missions.length) return '';
  const raw = props.missions[0].endAt;
  const date = new Date(raw);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
});

// 진행율 계산 함수
const getProgressPercentage = (mission) => {
  if (mission.goalValue === 0) return 0;
  return Math.min((mission.progressValue / mission.goalValue) * 100, 100);
};
</script>

<style scoped>
.mission-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.mission-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.mission-icon {
  width: 50px;
  height: auto;
  margin-right: 8px;
}
.end-date {
  font-size: 14px;
  color: #888;
  margin-left: 8px;
}
.description {
  margin: 4px 0 0;
  font-size: 14px;
  color: #999;
}

.mission-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.mission-item {
  /* display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff7e0;
  border: 2px solid #f7c744;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #222; */
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  overflow: hidden;
}

.mission-item.success {
  /* background: #f7c744;
  color: white;
  border: none; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7c744;
  color: white;
  padding: 12px 16px;
}
/* 진행중인 미션의 프로그레스 바 컨테이너 */
.progress-container {
  position: relative;
  background: white;
  border: 2px solid #f7c744;
  border-radius: 12px;
  height: 48px;
  overflow: hidden;
}

/* 프로그레스 바 채워지는 부분 */
.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #f7c744;
  transition: width 0.3s ease;
  z-index: 1;
}

/* 프로그레스 바 텍스트 컨테이너 (검은색 텍스트) */
.progress-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  color: #222;
  z-index: 2;
}

/* 흰색 텍스트 오버레이 (채워진 부분에만 표시) */
.progress-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
  overflow: hidden;
  z-index: 3;
  transition: width 0.3s ease;
  /* 텍스트 위치를 정확히 맞추기 위해 */
  white-space: nowrap;
}

.mission-title {
  flex: 1;
  /* 두 레이어의 텍스트가 정확히 같은 위치에 오도록 */
  font-size: 15px;
  font-weight: 500;
  /* white-space: nowrap;
  overflow: hidden; */
  /* text-overflow: ellipsis; */
}

.mission-status {
  /* font-weight: bold; */
  font-weight: bold;
  white-space: nowrap;
}
.empty-message {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 12px;
}
</style>
