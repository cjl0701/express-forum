const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const db = require("../lib/db");
const bcrypt = require("bcrypt");

module.exports = function (app) {
  //passort는 session을 필요로 하기 때문에 session 아래에!
  app.use(passport.initialize());
  app.use(passport.session()); //내부적으로 세션을 사용하겠다.

  //세션을 처리하는 방법
  //사용자 정보 객체를 세션에 아이디로 저장
  passport.serializeUser((user, done) => {
    console.log("serializeUser", user);
    done(null, user.id); //user.id를 session store에 저장(data stream으로 만들어 write)
  });
  //user의 식별자를 id로 받아서 DB에서 user의 정보 조회 -> req.user에 저장. (매 페이지에 접속할 때마다 작동)
  passport.deserializeUser((id, done) => {
    let user = db.get("users").find({ id: id }).value();
    console.log("deserializeUser", user);
    done(null, user);
  });

  passport.use(
    //local: id & pwd를 사용하는 strategy(인증 수단)
    new LocalStrategy(
      //기본적으로 LocalStrategy는 username및 라는 매개 변수에서 자격 증명을 찾음. 바꾸려면.
      {
        usernameField: "email",
        passwordField: "pwd",
      },
      function (email, password, done) {
        console.log("LocalStrategy", email, password);
        let user = db.get("users").find({ email: email }).value();
        if (user) {
          bcrypt.compare(password, user.pwd, function (err, result) {
            if (result) return done(null, user, { message: "welcome!!!" });
            else return done(null, false, { message: "wrong password" });
          });
        } else return done(null, false, { message: "wrong email" });
      }
    )
  );

  //구글 oauth 사용
  let googleCredentials = require("../config/google.json");
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0],
      },
      //토큰을 이용해 google+ api에 요청한 결과로 호출되는 콜백함수
      function (accessToken, refreshToken, profile, done) {
        console.log("GoogleStrategy", accessToken, refreshToken, profile);
        let email = profile.emails[0].value;
        let user = db.get("users").find({ email: email }).value();
        if (user) {
          //기존에 같은 이메일로 가입한 유저가 있다면 동기화
          user.google_id = profile.id;
          db.get("users").find({ id: user.id }).assign(user).write();
        }
        return done(null, user);
      }
    )
  );

  app.get(
    "/auth/google",
    //구글에 요청 url을 만듦
    passport.authenticate("google", {
      scope: ["https://www.googleapis.com/auth/plus.login", "email"], //구글로부터 원하는 기능
    })
  );

  //인증 후 콜백 라우트
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/login" }), //인증 실패
    (req, res) => req.session.save(() => res.redirect("/")) //인증 성공
  );

  return passport;
};
