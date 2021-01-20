const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../lib/db");
module.exports = function (app) {
  //학습용. 실서버가 이렇게 하면 안된다.
  const authData = {
    email: "cjl2076@naver.com",
    pwd: "0000",
    nickname: "Owner",
  };

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
        let user = db
          .get("users")
          .find({ email: email, pwd: password })
          .value();
        if (user) return done(null, user, { message: "welcome!!!" });
        else return done(null, false, { message: "Incorrect infomation." });
      }
    )
  );

  return passport;
};
