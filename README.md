# 기본 설치 및 실행
```
$ npm i
$ npm start
```

# 로그인 테스트
```
CSEY-Client의 feat/login 브랜치
$ npm i
$ npm run dev

이후
1. localhost:3000/Login 으로 직접 이동
2. 카카오로그인 버튼 눌러서 로그인 진행
3. /My로 이동됐으면 로그인 성공, 뒤로가기 해서 /Login으로 다시 이동
4. 프론트 코드 변경
  4.1 src/components/Login/index.tsx
  4.2 testSetAlarm 함수의 axios.put('/api/{kakaoID}/alarms'...) 부분의 kakaoID를 자신의 것으로 변경 (f12 콘솔에서 profile.id 값을 확인)
  4.3 혹은 다른 ID로 하고 '토큰과 다른 사용자 오류'를 일으키는 지 확인
5. set alarm test 버튼 클릭하여 잘 작동하는지 확인 (f12 콘솔에서 네트워크 탭의 맨 아래 alarms 확인 or 서버 콘솔 확인)
```