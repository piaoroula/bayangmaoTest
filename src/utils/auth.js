import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const UserName = 'User-Name'
export function getToken() {
  return Cookies.get(TokenKey)
}
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
export function setUserName(username) {
  return localStorage.setItem(UserName, username)
}
export function getUserName() {
  return localStorage.getItem(UserName)
}