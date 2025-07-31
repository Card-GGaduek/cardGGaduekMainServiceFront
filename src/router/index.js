import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../pages/MainPage.vue';
import BookingPage from '@/pages/booking/BookingPage.vue';
import MapPage from '@/pages/map/MapPage.vue';
import MyPage from '@/pages/mypage/MyPage.vue';
import AnalysisPage from '@/pages/analysis/AnalysisPage.vue';
import NotFoundPage from '@/pages/common/NotFoundPage.vue';

import LabPage from '@/pages/lab/LabPage.vue';
import FortuneCard from '@/pages/lab/FortuneCard.vue';

const routes = [
  { path: '/', name: 'Main', component: MainPage },
  { path: '/booking', name: 'Booking', component: BookingPage },
  { path: '/map', name: 'Map', component: MapPage },
  { path: '/analysis', name: 'Analysis', component: AnalysisPage },
  { path: '/mypage', name: 'MyPage', component: MyPage },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
  { path: '/lab', name: 'Lab', component: LabPage },
  { path: '/lab/fortune', component: FortuneCard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
