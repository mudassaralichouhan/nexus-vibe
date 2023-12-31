/*
 *
 */

import express, {Express} from 'express'

import cors from 'cors'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import path from 'path'
import mongoSanitize from 'express-mongo-sanitize'
import TrimmerMiddleware from './middleware/trimmer-middleware'
import {env} from './helpers'
import RateLimiterMiddleware from './middleware/rate-limit-middleware'
import responseTime from "response-time"

global.__dirname = path.resolve()

export const AUTH_DRIVER = env('AUTH_DRIVER')

const app: Express = express()

app.use(responseTime())
app.use(RateLimiterMiddleware)
app.use(TrimmerMiddleware)
app.use(express.json())
app.use(mongoSanitize())

app.use(cors({
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  origin: '*',
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(fileUpload())
app.use(express.static('public'))

app.use(bodyParser.json({limit: '5mb'}))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

export default app
