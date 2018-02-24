import { DataStore, Responder, HashInterface } from "../interfaces/interfaces";

export class UserInteractor {
  public static async updatePassword(
    dataStore: DataStore,
    responder: Responder,
    hasher: HashInterface,
    email: string,
    password: string
  ) {
    try {
      let pwdhash = hasher.hash(password);
      let userID = await dataStore.findUser(email);
      await dataStore.editUser(userID, "");
      responder.sendOperationSuccess();
    } catch (e) {
      responder.sendOperationError(e);
    }
  }
}
