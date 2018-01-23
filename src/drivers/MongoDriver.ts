import { DataStore } from "../interfaces/interfaces";

export default class MongoDriver implements DataStore {
  login(username: string, password: string) {
    throw new Error("Method not implemented.");
  }
  register(user: any) {
    throw new Error("Method not implemented.");
  }

}