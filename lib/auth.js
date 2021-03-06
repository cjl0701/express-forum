module.exports = {
  isOwner: function (req, res) {
    if (req.user) return true;
    else return false;
  },

  statusUI: function (req, res) {
    let authStateUI = `
      <a href="/auth/login">login</a> | 
      <a href="/auth/register">register</a> | 
      <a href="/auth/google">login with google</a>`;
    if (this.isOwner(req, res))
      authStateUI = `${req.user.nickname} | <a href="/auth/logout">logout</a>`;
    return authStateUI;
  },
};
