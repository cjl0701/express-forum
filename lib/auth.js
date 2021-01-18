module.exports = {
  isOwner: function (req, res) {
    if (req.session.is_logined === true) return true;
    else return false;
  },

  statusUI: function (req, res) {
    let authStateUI = '<a href="/auth/login">login</a>';
    if (this.isOwner(req, res))
      authStateUI = `${req.session.nickname} | <a href="/auth/logout_process">logout</a>`;
    return authStateUI;
  },
};
