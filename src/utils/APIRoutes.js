export const host = process.env.REACT_APP_BACKEND_BASEURL;
export const loginRoute = `${host}/api/v1/user/login`;
export const registerRoute = `${host}/api/v1/user/registration`;
export const logoutRoute = `${host}/api/v1/user/logout`;
export const allUsersRoute = `${host}/api/v1/user/list`;
export const sendMessageRoute = `${host}/api/v1/sendMessage`;
export const recieveMessageRoute = `${host}/api/v1/fetchMessage`;
export const setAvatarRoute = `${host}/api/auth/setavatar`;
