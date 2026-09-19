// src/utils/regex.ts
export const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/;

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

export const usernameRegex = /^[a-z][a-z0-9]*$/;
