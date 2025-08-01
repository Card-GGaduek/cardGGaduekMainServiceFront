import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

// 초기 상태 템플릿
const initState = {
  token: '', // JWT 접근 토큰
  user: {
    username: '', // 사용자 ID
    email: '', // Email
    roles: [], // 권한 목록
  },
  avatarTimestamp: Date.now(), // (1) 아바타 이미지 경로에 추가할 쿼리스트링값(타임스탬프)
};

// 스토어 정의
export const useAuthStore = defineStore('auth', () => {
  const state = ref({ ...initState });

  // computed 속성들
  const isLogin = computed(() => !!state.value.user.username); // 로그인 여부
  const username = computed(() => state.value.user.username); // 로그인 사용자 ID
  const email = computed(() => state.value.user.email); // 로그인 사용자 email

  // isLogin 사용자명 존재 여부로 로그인 상태 판단
  // username, email 반응형 데이터로 컴포넌트에서 자동 업데이트
  // !! 연산자로 boolean 타입 변환 보장

  // (2) 로그인 여부에 따라 아바타 이미지 다운로드 주소 변경
  const avatarUrl = computed(() =>
    state.value.user.username // 사용자명이 있다면 == 로그인 상태라면
      ? `/api/member/${state.value.user.username}/avatar?t=${state.value.avatarTimestamp}`
      : null
  );

  // 액션 메서드

  // (3) 아바타 업데이트 액션 추가
  const updateAvatar = () => {
    state.value.avatarTimestamp = Date.now();
    localStorage.setItem('auth', JSON.stringify(state.value));
  };

  // 로그인 액션
  const login = async (member) => {
    // 임시 테스트용 로그인 (실제 API 호출 전)
    // state.value.token = 'test token';
    // state.value.user = {
    //   username: member.username,
    //   email: member.username + '@test.com',
    // };

    // 실제 API 호출
    const { data } = await axios.post('/api/auth/login', member);
    state.value = { ...data }; // 서버 응답 데이터로 상태 업데이트

    // localStorage에 상태 저장
    localStorage.setItem('auth', JSON.stringify(state.value));
  };

  // 로그아웃 액션
  const logout = () => {
    localStorage.clear(); // localStorage 완전 삭제
    state.value = { ...initState }; // 상태를 초기값으로 리셋
  };

  // 토큰 얻어오기 액션
  const getToken = () => state.value.token;

  // 상태 복원 로직
  // - localStorage에 인증 정보(auth)가 저장되어 있을 경우 상태 복원
  const load = () => {
    const auth = localStorage.getItem('auth');
    if (auth != null) {
      state.value = JSON.parse(auth); // JSON 문자열을 객체로 변환
      console.log(state.value);
    }
  };

  // 프로필 변경 후 로컬 상태 동기화 액션
  const changeProfile = (member) => {
    state.value.user.email = member.email; // 이메일 업데이트
    localStorage.setItem('auth', JSON.stringify(state.value)); // 로컬스토리지 동기화
  };

  // 스토어 초기화 시 자동 실행
  load();

  // 외부에서 사용할 수 있도록 반환
  return {
    state,
    username,
    email,
    isLogin,
    login,
    logout,
    getToken,
    changeProfile,

    // (4) 아바타 관련 구문 return 추가
    avatarUrl,
    updateAvatar,
  };
});
