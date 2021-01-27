# express-forum
node.js의 대표 웹 프레임워크인 express를 이용해 게시판 만들기

---

### 주요 기능
- 글 작성, 수정, 조회 및 삭제 기능
- 회원가입 및 구글 oauth
- 쿠키, 세션을 활용한 사용자 정보 유지
- 사용자 권한에 따른 접근 제어 기능

---

### 사용 기술
- routing 및 DB 연동을 통해 CRUD API 구현
- passport.js를 활용한 인증 구현, 접근 제어
  - LocalStrategy
  - GoogleStrategy
  - session store에 인증 정보 저장
- middleware 생성 및 활용
- helmet(for 보안), compression(for 압축 전송) 등 third-party middleware 활용

---

##### 개발 환경
- Language: JavaScript
- Node.js: v14.15.4
- express: v4.17.1

---

##### 시작

```nodemon start main.js```

---

##### 참고
> 생활코딩 web2 Node.js

> 생활코딩 Node.js - MySQL

> 생활코딩 Node.js - EXPRESS

> 생활코딩 Node.js - Passport.js

