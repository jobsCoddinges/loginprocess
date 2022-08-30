module.exports = function (app) {
  var authData = {
    email: "egoing777@gmail.com",
    password: "111111",
    nickname: "egoing",
  };

  // paspport 불러오는 곳
  var passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;
  // express에서 passport의 initialize로 passport를 시작하고
  // passport의 session을 사용하겠다는 것임.
  app.use(passport.initialize());
  app.use(passport.session());

  // 세션화 시키는 부분
  // serializeUser 부분에서 user는 아까 성공했을때 done에서 받아옴
  // 여기서 serializeUser를 통해 session화를 시키고
  // sessions라는 폴더를 보면 user에 뭔가가 만들어지는 것을 볼수가 있다.
  // 만들어진 것은 우리가 done()에 넣은 user.email이 들어 가있다.
  passport.serializeUser((user, done) => {
    console.log("serializeUser", user);
    process.nextTick(function () {
      return done(null, user.email);
    });
  });
  //그러면 deserializeUser에서 id에 session에서 찾은 user의 값을
  //넣어주게 되고 id는 user.email의 값이 나오게 되는 것이다.
  //그리고 done() 2번째 인자로 authData를 주게 되면
  //request.user 라는 값이 생기게 되어 거기에 저장이 된다.
  passport.deserializeUser((id, done) => {
    console.log("deserializeUser", id);
    process.nextTick(function () {
      return done(null, authData);
    });
  });

  // middleware 사용
  passport.use(
    new LocalStrategy(
      // 여기 usernameField와 passwordField 부분은 내가 username과 password로 말고
      //email과 pwd로 받고 싶다고 적는 거임
      // 그러니깐 내가 auth/login 에 form 형태를 보면 input의 name 부분에 username, password라고 적어 주어야 하나
      // 여기서 이렇게 설정함으로써 name 부분에 email, pwd라고 적어도 상관이 없어진 것임

      { usernameField: "email", passwordField: "pwd" },
      function verify(username, password, done) {
        console.log("LocalStrategy", username, password);
        if (username === authData.email) {
          console.log(1);
          if (password === authData.password) {
            console.log(2);
            //성공했을때 authData를 보내서 serializeUser에서 받아옴
            return done(null, authData);
          } else {
            console.log(3);
            return done(null, false, {
              message: "Incorrect password",
            });
          }
        } else {
          console.log(4);
          return done(null, false, {
            message: "Incorrect Username",
          });
        }
      }
    )
  );
  return passport;
};
