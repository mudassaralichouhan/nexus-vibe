import {NextFunction, Request, Response} from 'express';

function trimValues(input) {
    if (input && input.constructor === Object) {
        for (let prop in input) {
            if (input[prop] && input[prop].constructor !== String) {
                return trimValues(input[prop]);
            }

            if (input[prop] && input[prop].constructor === String && input[prop].length) {
                input[prop] = input[prop].trim();
            }
        }
    } else if (input && input.constructor === Array && input.length) {
        input.forEach(item => trimValues(item));
    } else if (input && input.constructor === String && input.length) {
        input = input.trim();
    }
}

const TrimmerMiddleware = (request: Request, response: Response, next: NextFunction) => {
  if (request.body) {
    trimValues(request.body);
    }

  if (request.params) {
    trimValues(request.params);
    }

  if (request.query) {
    trimValues(request.query);
    }

    next();
}

export default TrimmerMiddleware;