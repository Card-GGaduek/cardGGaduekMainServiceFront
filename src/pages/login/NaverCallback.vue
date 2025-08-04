<template>
  <div>네이버 로그인 처리 중입니다...</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authApi from '@/api/authApi';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const router = useRouter();
const route = useRoute();

// alert(route.fullPath) // 로그 찍어보고 쿼리 포함 여부 확인

onMounted(async () => {
  const code = route.query.code;
  const receivedState = route.query.state;

  console.log(code);
  console.log(receivedState);

  if (!code || !receivedState) {
    alert('로그인 처리 중 오류가 발생했습니다.');
    router.push('/');
    return;
  }

  const savedState = sessionStorage.getItem('naver_oauth_state');
  if (savedState !== receivedState) {
    alert('State 값이 일치하지 않습니다. CSRF 공격 가능성 있음.');
    router.push('/');
    return;
  }

  try {
    // Spring Legacy 서버의 네이버 로그인 처리 endpoint로 요청
    const result = await authApi.naverLogin(code, receivedState);
    authStore.login(result);
    router.push('/');
  } catch (error) {
    console.error('네이버 로그인 처리 실패:', error.message);
    alert('로그인 처리에 실패했습니다.');
    router.push('/login');
  }
});
</script>
