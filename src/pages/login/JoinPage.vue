<template>
  <div class="container py-4" style="max-width: 400px">
    <button class="btn btn-link p-0 mb-3">
      <i class="bi bi-arrow-left fs-5"></i>
    </button>

    <h4 class="fw-bold mb-4 text-center">회원가입</h4>

    <!-- 이름 -->
    <div class="mb-3">
      <label class="form-label">이름</label>
      <input
        type="text"
        class="form-control"
        placeholder="이름을 입력하세요"
        v-model="joinForm.name"
      />
    </div>

    <!-- 이메일 -->
    <div class="mb-3">
      <label class="form-label">이메일</label>
      <div class="input-group">
        <input
          type="email"
          class="form-control"
          placeholder="이메일을 입력하세요"
          v-model="joinForm.email"
        />
        <button
          class="btn btn-outline-warning text-dark fw-semibold"
          @click="sendEmailCode"
          :disabled="isSendingEmail"
        >
          이메일 인증
        </button>
        <!-- 이메일 인증코드 입력 -->
        <div v-if="emailSent" class="mt-2">
          <label class="form-label">인증코드</label>
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="인증코드를 입력하세요"
              v-model="emailCode"
            />
            <button class="btn btn-outline-success" @click="verifyEmailCode">
              확인
            </button>
          </div>
          <small class="text-success" v-if="emailVerified"
            >이메일 인증 완료</small
          >
          <small class="text-danger" v-if="emailError">{{ emailError }}</small>
        </div>
      </div>
    </div>

    <!-- 비밀번호 -->
    <div class="mb-2">
      <label class="form-label">비밀번호</label>
      <div class="input-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          placeholder="비밀번호를 입력하세요"
          v-model="joinForm.password"
          @input="validatePassword(), validatePasswordConfirm()"
        />
        <button class="btn btn-outline-secondary" @click="togglePassword">
          <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
        </button>
      </div>
      <small class="text-danger" v-if="passwordError">{{
        passwordError
      }}</small>
    </div>

    <!-- 비밀번호 확인 -->
    <div class="mb-3">
      <label class="form-label">비밀번호 확인</label>
      <div class="input-group">
        <input
          :type="showPasswordConfirm ? 'text' : 'password'"
          class="form-control"
          placeholder="비밀번호 확인"
          v-model="passwordConfirm"
          @input="validatePasswordConfirm(), validatePassword()"
        />
        <button
          class="btn btn-outline-secondary"
          @click="togglePasswordConfirm"
        >
          <i
            class="bi"
            :class="showPasswordConfirm ? 'bi-eye-slash' : 'bi-eye'"
          ></i>
        </button>
      </div>
      <small class="text-danger" v-if="passwordConfirmError">{{
        passwordConfirmError
      }}</small>
    </div>

    <!-- 생년월일 -->
    <div class="mb-3">
      <label class="form-label">생년월일</label>
      <input type="date" class="form-control" />
    </div>

    <!-- 전화번호 -->
    <div class="mb-4">
      <label class="form-label">전화번호</label>
      <div class="input-group">
        <input type="tel" class="form-control" placeholder="전화번호 입력" />
      </div>
    </div>

    <!-- 가입하기 버튼 -->
    <button
      class="btn w-100 fw-bold text-white py-2"
      style="background-color: #ffc107"
      @click="signup"
    >
      가입하기
    </button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import authApi from '@/api/authApi';
import { useRouter } from 'vue-router';

const router = useRouter();

const joinForm = reactive({
  name: '',
  email: '',
  password: '',
  birthDate: '',
  phone: '',
});

const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const passwordError = ref('');
const validatePassword = () => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

  if (!passwordRegex.test(joinForm.password)) {
    passwordError.value =
      '영문, 숫자, 특수문자를 포함하여 8~20자로 입력해주세요.';
  } else {
    passwordError.value = '';
  }
};

const passwordConfirm = ref('');
const passwordConfirmError = ref('');
const validatePasswordConfirm = () => {
  if (passwordConfirm.value != joinForm.password) {
    passwordConfirmError.value = '비밀번호가 일치 하지 않습니다.';
  } else {
    passwordConfirmError.value = '';
  }
};

const showPasswordConfirm = ref(false);
const togglePasswordConfirm = () => {
  showPasswordConfirm.value = !showPasswordConfirm.value;
};

const emailSent = ref(false);
const emailVerified = ref(false);
const emailCode = ref('');
const emailError = ref('');

const isSendingEmail = ref(false);
const sendEmailCode = async () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(joinForm.email)) {
    alert('올바르지 않은 이메일입니다.');
  } else {
    try {
      isSendingEmail.value = true;
      const result = await authApi.sendCode(joinForm.email);
      emailSent.value = true;
      emailVerified.value = false;
      console.log(result);
    } catch (e) {
      //   const message = e.response?.data?.message || '서버 오류';
      //   console.log(message);

      alert(e.message);
    }
  }
};

const verifyEmailCode = async () => {
  emailError.value = '';
  try {
    const result = await authApi.verifyCode(joinForm.email, emailCode.value);
    emailVerified.value = true;
    emailError.value = '';
  } catch (e) {
    emailVerified.value = false;
    emailError.value = e.message;
  }
};

const signup = async () => {
  if (!emailVerified.value) {
    alert('이메일 인증을 완료해주세요.');
    return;
  }

  if (passwordError.value || passwordConfirmError.value) {
    alert('비밀번호를 올바르게 입력해주세요.');
    return;
  }

  if (!joinForm.name) {
    alert('이름을 입력하세요');
    return;
  }

  if (!joinForm.birthDate) {
    alert('생년월일을 입력하세요.');
    return;
  }

  try {
    const result = await authApi.join(joinForm);
    alert('회원가입이 완료되었습니다.');
    router.push('/login'); // 로그인 페이지로 이동
  } catch (e) {
    // alert(e.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    alert(e.message);
  }
};
</script>
