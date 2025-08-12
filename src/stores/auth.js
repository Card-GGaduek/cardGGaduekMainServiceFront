import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import { setAuthToken } from '@/api';

// 초기 상태 템플릿
const initState = {
  token: '', // JWT 접근 토큰
  user: {
    username: '', // 사용자 ID
    email: '', // Email
    roles: [], // 권한 목록
  },
};

// 스토어 정의
export const useAuthStore = defineStore('auth', () => {
  const state = ref({ ...initState });

  // computed 속성들
  const isLogin = computed(() => !!state.value.user.username); // 로그인 여부
  const username = computed(() => state.value.user.username); // 로그인 사용자 ID
  const email = computed(() => state.value.user.email); // 로그인 사용자 email
  const token = computed(() => state.value.token); // 로그인 사용자 토큰

  // 액션 메서드
  // 로그인 액션
  const login = async (response) => {
    state.value.token = response.accessToken;
    state.value.user = {
      username: response.user.username,
      email: response.user.email,
    };

    setAuthToken(response.accessToken);
    localStorage.setItem('auth', JSON.stringify(state.value));
    console.log('[Auth Store] 로그인 완료, 토큰 설정:', response.accessToken);
  };

  // 로그아웃 액션
  const logout = () => {
    localStorage.clear(); // localStorage 완전 삭제
    state.value = { ...initState }; // 상태를 초기값으로 리셋

    setAuthToken(null);

    console.log('[Auth Store] 로그아웃 완료, 토큰 제거');
  };

  // 토큰 얻어오기 액션
  const getToken = () => state.value.token;

  // 상태 복원 로직
  // - localStorage에 인증 정보(auth)가 저장되어 있을 경우 상태 복원
  const load = () => {
    const auth = localStorage.getItem('auth');
    if (auth != null) {
      state.value = JSON.parse(auth); // JSON 문자열을 객체로 변환

      if (state.value.token) {
        setAuthToken(state.value.token);
        console.log('[Auth Store] 상태 복원, 토큰 설정:', state.value.token);
      }
      console.log('[Auth Store] 상태 복원 완료:', state.value);
    }
  };

  // 스토어 초기화 시 자동 실행
  load();

  // 외부에서 사용할 수 있도록 반환
  return {
    state,
    token,
    username,
    email,
    isLogin,
    login,
    logout,
    getToken,
  };
});
