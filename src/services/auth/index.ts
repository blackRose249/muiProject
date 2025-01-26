import type { User } from 'firebase/auth';

import { jwtDecode } from 'jwt-decode';

import { hash } from 'src/utils/encrypt';

import { auth } from 'src/configs/firebase';
import { Cache, CacheKeys } from 'src/utils';

import UserService from '../user';
import { UserRole } from '../user/user.dto';

import type { UserLoginBody, CreateUserBody } from './auth.dto';

export default class AuthService {
  private static token: string | null = Cache.get(CacheKeys.Token);

  static async register(data: CreateUserBody) {
    const valid = await UserService.validateSecret(data.secret!);
    delete data?.secret;
    if (!valid) throw new Error('INVALID_SECRET_KEY');
    const pass = hash(data.password!);
    const user = await auth.createUser(data.email, pass);
    const token = await user.user.getIdToken();
    this.setToken(token);
    delete data.password;
    return UserService.create({
      ...data,
      pledgeAmount: Number(data.pledgeAmount),
      id: user.user.uid,
      role: [UserRole.Partner],
    });
  }

  static async login(data: UserLoginBody) {
    const pass = hash(data.password);
    const user = await auth.signIn(data.email, pass);
    const token = await user.user.getIdToken();
    this.setToken(token);
    return UserService.get(user.user.uid);
  }

  static async logout() {
    await auth.logout();
    Cache.clear();
  }

  static setToken(token: string | null) {
    this.token = token;
    Cache.set(CacheKeys.Token, token);
  }

  static getToken(): string | null {
    return this.token || Cache.get<string>(CacheKeys.Token);
  }

  static hasToken() {
    return !!this.getToken();
  }

  static decodeToken(token = this.getToken()) {
    if (!token) return null;
    const decoded = jwtDecode(token);
    console.log(decoded);
    return decoded;
  }

  static listen(cb: (val: User | null) => void) {
    auth.listen(cb);
  }
}
