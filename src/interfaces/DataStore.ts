export interface DataStore {
  login(username: string, password: string);
  register(user);
}