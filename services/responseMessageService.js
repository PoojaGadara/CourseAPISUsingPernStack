class responseMessageService {
  static async inValidToken() {
      var msg = { success: false, message: 'Failed to authenticate token.' };
      return msg;
  }
}

export default responseMessageService;