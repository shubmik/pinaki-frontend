import client from './client';
export const sendOTP = (mobile) => client.post('/auth/send-otp/', { mobile });
export const verifyOTP = (mobile, otp) => client.post('/auth/verify-otp/', { mobile, otp });
export const registerMember = (data) => client.post('/auth/register/', data);
export const getMe = () => client.get('/auth/me/');
export const logoutApi = (refresh) => client.post('/auth/logout/', { refresh });
