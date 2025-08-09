<template>
  <div class="mission-card">
    <div class="mission-header">
      <img src="@/assets/lab/mission_icon.png" class="mission-icon" />
      <div>
        <h4 class="mt-3 mx-3">
          시즌별 미션 <span class="end-date">~{{ endDate }}</span>
        </h4>
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
          </div>
        </template>
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
}

.mission-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.mission-icon {
  width: 35px;
  height: auto;
  margin-top: -7px;
  margin-right: -2px;
  margin-left: 8px;
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
  border-radius: 12px;
  font-size: 16px;
  overflow: hidden;
}

.mission-item.success {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffd559;
  color: white;
  padding: 12px 16px;
}
/* 진행중인 미션의 프로그레스 바 컨테이너 */
.progress-container {
  position: relative;
  background: white;
  border: 2px solid #ffd559;
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
  background: #ffd559;
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
  color: #5e514d;
  z-index: 2;
}

.mission-title {
  flex: 1;
  font-size: 17px;
}

.mission-status {
  white-space: nowrap;
}
.empty-message {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 12px;
}
</style>
