import Joi from "joi";

export const DAY: number = 24 * 60 * 60 * 1000;
export const HOUR: number = 60 * 60;
export const MIN: number = 60;

export const PASSWORD_MIN_LEN: number = 6;

export const joiEmail = Joi.string()
  .max(50)
  .required()
  .email({minDomainSegments: 2, tlds: {allow: ['com', 'net', 'gmail']}});