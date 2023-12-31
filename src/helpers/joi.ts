import Joi from "joi";

export const validate = async (schema: object, body: object) => {
  try {
    await Joi.object(schema).validateAsync(body);
    return false;
  } catch (error) {
    if (error.isJoi)
      return {messages: error.details}

    throw new Error('An unexpected validation error occurred')
  }
};