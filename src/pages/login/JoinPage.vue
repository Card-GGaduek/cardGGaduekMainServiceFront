<template>
  <div class="join-page-wrapper">
    <SubHeader :backTo="'/login'" />

    <div class="join-page">
      <h4 class="title">회원가입</h4>

      <!-- 이름 -->
      <div class="field">
        <label class="label">이름</label>
        <input
          type="text"
          class="input"
          placeholder="이름을 입력하세요"
          v-model="joinForm.name"
          autocomplete="name"
        />
      </div>

      <!-- 이메일 -->
      <div class="field">
        <label class="label">이메일</label>
        <div class="row-append">
          <input
            type="email"
            class="input"
            placeholder="이메일을 입력하세요"
            v-model="joinForm.email"
            autocomplete="email"
          />
          <button
            type="button"
            class="btn-outline-yellow"
            @click="sendEmailCode"
            :disabled="isSendingEmail"
          >
            인증하기
          </button>
        </div>

        <!-- 인증코드 -->
        <div v-if="emailSent" class="row-append mt8">
          <input
            type="text"
            class="input"
            placeholder="인증코드를 입력하세요"
            v-model="emailCode"
          />
          <button
            type="button"
            class="btn-outline-yellow"
            @click="verifyEmailCode"
          >
            코드확인
          </button>
        </div>
        <small class="text-success hint" v-if="emailVerified"
          >이메일 인증 완료</small
        >
        <small class="text-danger hint" v-if="emailError">{{
          emailError
        }}</small>
      </div>

      <!-- 비밀번호 -->
      <div class="field">
        <label class="label">비밀번호</label>
        <div class="input-with-icon">
          <input
            :type="showPassword ? 'text' : 'password'"
            class="input"
            placeholder="비밀번호를 입력하세요"
            v-model="joinForm.password"
            @input="
              validatePassword();
              validatePasswordConfirm();
            "
            autocomplete="new-password"
          />
          <button type="button" class="icon-btn" @click="togglePassword">
            <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
          </button>
        </div>
        <small class="text-danger hint" v-if="passwordError">{{
          passwordError
        }}</small>
      </div>

      <!-- 비밀번호 확인 -->
      <div class="field">
        <label class="label">비밀번호 확인</label>
        <div class="input-with-icon">
          <input
            :type="showPasswordConfirm ? 'text' : 'password'"
            class="input"
            placeholder="비밀번호 확인"
            v-model="passwordConfirm"
            @input="
              validatePasswordConfirm();
              validatePassword();
            "
            autocomplete="new-password"
          />
          <button type="button" class="icon-btn" @click="togglePasswordConfirm">
            <i
              class="bi"
              :class="showPasswordConfirm ? 'bi-eye-slash' : 'bi-eye'"
            ></i>
          </button>
        </div>
        <small class="text-danger hint" v-if="passwordConfirmError">
          {{ passwordConfirmError }}
        </small>
      </div>

      <!-- 생년월일 -->
      <div class="field">
        <label class="label">생년월일</label>
        <input
          type="date"
          class="input"
          v-model="joinForm.birthDate"
          placeholder="YYYY-MM-DD"
        />
      </div>

      <!-- 전화번호 -->
      <div class="field">
        <label class="label">전화번호</label>
        <input
          type="tel"
          class="input"
          placeholder="전화번호 입력"
          autocomplete="tel"
        />
      </div>

      <!-- 가입하기 -->
      <button class="btn-primary submit" @click="signup">가입하기</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import authApi from '@/api/authApi';
import { useRouter } from 'vue-router';
import SubHeader from '@/layout/SubHeader.vue';

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
      isSendingEmail.value = false;
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

  // if (!joinForm.birthDate) {
  //   alert('생년월일을 입력하세요.');
  //   return;
  // }

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

<style scoped>
.join-page-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  box-sizing: border-box;
}

.join-page {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.title {
  text-align: center;
  margin: 12px 0 20px;
}

/* 필드 공통 */
.field {
  margin-bottom: 25px;
}
.label {
  display: block;
  color: #9aa0a6;
  font-size: 16px;
  margin: 0 0 8px 30px;
}

/* 인풋 */
.input {
  width: 90%;
  height: 45px;
  border: none;
  border-radius: 10px;
  background: #f7f7f7;
  padding: 0 18px;
  font-size: 16px;
  color: #222;
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  margin: 0 auto;
  display: block;
}
.input::placeholder {
  color: #c7cbd1;
}

/* 우측 버튼이 붙는 행 */
.row-append {
  display: grid;
  grid-template-columns: 1fr auto;
  /* column-gap: 8px; */
  /* align-items: center; */
  margin-right: 10px;
}
.mt8 {
  margin-top: 8px;
}

/* 비번 눈아이콘 */
.input-with-icon {
  position: relative;
}

.icon-btn {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  cursor: pointer;
}

/* 버튼 */
.btn-outline-yellow {
  height: 45px;
  padding: 0 16px;
  border-radius: 10px;
  border: 2px solid #ffc107;
  background: #fff;
  color: #ffc107;
  font-weight: 600;
}
.btn-outline-yellow:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary.submit {
  width: 90%;
  height: 55px;
  border: none;
  border-radius: 10px;
  background: #ffcc2b;
  color: #fff;
  font-size: 18px;
  margin: 8px auto 10px;
  display: block;
}

.hint {
  margin-left: 1.8rem;
}

/* 모바일 살짝 여백 보정 */
@media (max-width: 360px) {
  .input {
    height: 52px;
  }
  .btn-outline-yellow {
    height: 46px;
  }
  .btn-primary.submit {
    height: 56px;
  }
}
</style>
