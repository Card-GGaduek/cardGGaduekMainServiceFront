export default [
  // 카드 편집 (이미지 변경 + 삭제)
  {
    path: '/card/edit',
    name: 'card/edit',
    component: () => import('@/pages/card/CardEditPage.vue'),
  },
];
