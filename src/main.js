import './assets/main.css';
import 'bootstrap/dist/css/bootstrap.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// createPinia 인스턴스를 먼저 만들고
const pinia = createPinia();
app.use(pinia); // 그리고 app에 등록

console.log('[main.js] 앱 초기화 완료 - Auth Store의 load()에서 토큰 처리');

app.use(router);
app.mount('#app');
