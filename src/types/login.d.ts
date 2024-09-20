declare namespace LOGIN {
  /**
   * @description 登录入参
   * @param {string} account -账号
   * @param {string} password -密码
   * @param {string} captchaId -图片验证码key
   * @param {string} captcha -图片验证码value
   *
   */
  interface loginParams {
    account: string;
    password: string;
    codeKey: string;
    captcha: string;
  }
  /**
   * @description 登录返回
   * @param {string} token -用户token
   * @param {string} message -返回信息
   */
  interface loginResponse {
    token: string;
    message: string;
  }
  /**
   * @description 验证码返回
   * @param {string} codeKey -验证码key
   * @param {string} codeValue -验证码图片(base64)
   */
  interface valiDateCodeResponse {
    codeKey: string;
    codeValue: string;
  }
}
