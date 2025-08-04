export default [
  // 시즌별 미션
  {
    path: '/lab/missions',
    name: 'lab/missions',
    component: () => import('@/pages/lab/MissionCard.vue'),
  },

  // 소비 운세
  {
    path: '/lab/fortune',
    name: 'lab/fortune',
    component: () => import('@/pages/lab/FortuneCard.vue'),
  },

  // 소비 성향
  {
    path: '/lab/analysis',
    name: 'lab/analysis',
    component: () => import('@/pages/lab/AnalysisCard.vue'),
  },
];
