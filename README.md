Nexus Vibe
=

![](./public/icon.jpg)

## _The social network that resonates._


[![N|Solid](https://cldup.com/dTxpPi9lDf.thumb.png)](https://nodesource.com/products/nsolid)

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

User-generated Content (UGC), Trending, Hashtags Influences, Community, Content, Engagement

- Multimedia posts
- Viral content
- ✨Magic ✨

![](https://img.shields.io/github/stars/pandao/editor.md.svg) ![](https://img.shields.io/github/forks/pandao/editor.md.svg) ![](https://img.shields.io/github/tag/pandao/editor.md.svg) ![](https://img.shields.io/github/release/pandao/editor.md.svg) ![](https://img.shields.io/github/issues/pandao/editor.md.svg) ![](https://img.shields.io/bower/v/editor.md.svg)

## Features

- User Authentication and Profiles:

  -   User registration and login
  -   Profile creation and customization
  -   Profile pictures and cover photos
  
- Friendship and Connections:

  -   Add friends/follow other users
  -   Accept/decline friend requests
  -   Friends list and followers/following count
- News Feed:

  -   Personalized feed with posts from friends and followed users
  -   Status updates, text posts, images, and videos
  -   Like, comment, and share posts
- Messaging:

  -   Private messaging system
  -   Group messaging and chat rooms
  -   Multimedia messaging (photos, videos, GIFs)
- Notifications:

  -   Real-time notifications for likes, comments, and friend requests
  -   Email or push notifications
- Content Creation:

  -   Text-based posts
  -   Image and video uploads
  -   Live streaming or video broadcasting
- Discovery and Search:

  -   Search for users, posts, or hashtags
  -   Explore page with trending content
  -   Content recommendations based on user activity
- Privacy and Security:

  -   Privacy settings for posts and profile
  -   Two-factor authentication
  -   Report and block users
- Gamification:

  -   Likes, comments, and shares
  -   Badges or achievements
  -   Leaderboards
- Events and Groups:

  -   Create and join events
  -   Create and join groups or communities
  -   Group discussions and announcements
- Geolocation:

  -   Tagging locations in posts
  -   Check-ins and location-based content
- Integration with Other Platforms:

  -   Share content on other social media platforms
  -   Login with third-party accounts (Google, Facebook)
- Analytics:

  -   User engagement analytics
  -   Popular posts and trending content
  -   User demographics
- Monetization:

  -   Advertisements
  -   Sponsored content
  -   Premium features for a subscription fee
- Settings and Customization:

  -   Account settings
  -   Theme customization
  -   Language preferences
- Moderation and Content Control:

  -   Content reporting and moderation tools
  -   Automated content filtering
  -   Admin tools for managing users and content
- API for Developers:

  -   Open API for third-party app integration
  -   Developer documentation
- Accessibility:

  -   Support for users with disabilities
  -   Text-to-speech and other accessibility features
- Real-Time Features:

  -   Real-time updates for new posts and messages
  -   Live notifications and chat
- Feedback Mechanism:

  -   User feedback forms
  -   Ratings and reviews

Strategically crafted social media campaigns lay the foundation for building brand recognition.
Current online discussions are often mirrored in the trends that capture the digital community's attention.
Users have the ability to manage access to their information through the empowerment of privacy settings.

> Social influences marketing collaboration
> Online community Digital community Social network
> Visual content Multimedia posts Storytelling
> Social engagement Audience interaction User participation

The creation of content by users cultivates authenticity and a communal atmosphere.
Real-time interaction and audience connection are made possible through the medium of live streaming.
Live streaming allows real-time interaction and connection with the audience.

## Tech

Nexus vibe uses a number of open source projects to work properly:

- [node.js] - evented I/O for the backend
- [Express] - fast node.js network app framework
- [Mongo DB] - storage framework
- [Socket IO] - the live build system
- [React](https://gitlab.com/mudassaralichouhan/nexus-vibe-web.git) - Use the WebView component in app.

And of course Dillinger itself is open source with a [public repository][dill]
on GitHub.


### Installation
    ~# git clone github.com/mudassaralichouhan/nexus-vibe.git
    ~# git clone https://gitlab.com/mudassaralichouhan/nexus-vibe-web.git

### docker composer

    ~# docker-compose up

### Environment (.env)
* App
```dockerfile
app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app-ctr
    ports:
      - "9000:9000"
    volumes:
      - .:/app
    networks:
      - clearly-network
    depends_on:
      - mongo
      - redis
      - minio
```
    
    # docker exec -it api_app bash
```dotenv
ENVIRONMENT="development" # production
PORT="9000"
SECRET_KEY="WHCI2QWgEH2eEsKf8hSGVfEfcHJLwfqJ"
JWT_KEY=""

# redis, jwt should be b/w
AUTH_DRIVER="redis"
```

* Mongo DB
```dockerfile
mongo:
    image: "prismagraphql/mongo-single-replica:5.0.3"
    container_name: mongo-ctr
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: $MONGODB_USER
      MONGO_INITDB_ROOT_PASSWORD: $MONGODB_PASSWORD
    volumes:
      - clearly_volume:/data/db
    networks:
      - clearly-network
```
    
    ~# docker exec -it mongo-ctr bash
    ~# mongosh --host <hostname>:<port> --username <your_username> --password <your_password> --authenticationDatabase admin
```dotenv
# database envirment
MONGODB_HOST="mongo"
MONGODB_DATABASE="nexus-vibe"
MONGODB_USER="PrSP92XoT8"
MONGODB_PASSWORD="V7UU40YNpg"
MONGODB_PORT="27017"
DATABASE_URL="mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin&directConnection=true"
```
* Redis
```dockerfile
redis:
    image: "redis:latest"
    container_name: redis-ctr
    ports:
      - "6379:6379"
    command: "redis-server --requirepass $REDIS_PASSWORD"
    volumes:
      - clearly_volume:/usr/local/etc/redis
    networks:
      - clearly-network
```
    
    ~# docker exec -it redis-ctr redis-cli
```dotenv
# caching redis envirment
REDIS_HOST="redis"
REDIS_PORT="6379"
REDIS_USERNAME="default"
REDIS_PASSWORD="YTXbGqPHmI"
```

* MinIO

```dockerfile

minio:
    image: quay.io/minio/minio
    container_name: minio-ctr
    ports:
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=$MINIO_ROOT_USER
      - MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASS
    volumes:
      - clearly_volume:/data
    networks:
      - clearly-network
    command: server /data --console-address ":9001"
```

    ~# docker exec -it minio-ctr bash
```dotenv

# strage minio envirment
MINIO_HOST="minio"
MINIO_PORT="9000"
MINIO_ROOT_USER="root"
MINIO_ROOT_PASS="minio@123"
MINIO_ACCESS_KEY=""
MINIO_SECRET_KEY=""
MINIO_SSL=false
```
To create a pre-signed URL in MinIO, if you default composer configuration
you can access on host machine.
> http://0.0.0.0:$MINIO_PORT

Then, set `MINIO_ACCESS_KEY=""` and `MINIO_SECRET_KEY`
further configuration in `src/services/minio-services.ts`
you can change bucket version [enable or disable] or name

* mailhog

```dockerfile
mailhog:
    image: mailhog/mailhog
    container_name: mail-hog-ctr
    ports:
      - "1025:1025"  # SMTP port
      - "8025:8025"  # HTTP port
    #environment: # To run with authentication, uncomment the following lines
    #  - MH_UI_AUTH_FILE=/auth.htpasswd
    volumes:
      - clearly_volume:/app/data
    #  - ./path/to/auth.htpasswd:/auth.htpasswd
    networks:
      - clearly-network
```
    
    ~# docker exec -it mail-hog-ctr bash

```dotenv
# mail server envirment
MAIL_HOST="mailhog"
MAIL_PORT="1025"
MAIL_USER="5d0d4a05a12c04"
MAIL_PASS="2ffbc2cedc6154"
MAIL_FROM="no-replay@nexus-vibe.net"
```

> http://0.0.0.0:8025

### Prisma
* Seeder
> Package.json
```json
"prisma": {
    "seed": "ts-node prisma/seeder/seed.ts"
}
```
```json
"prisma-bind": "ts-node prisma/generator/schema.prisma.ts && prisma format",
"prisma-gen": "npx prisma generate",
"prisma-push": "npx prisma db push",
"prisma-seed": "npx prisma db seed",
```

    ~# npm run prisma-bind
    ~# npm run prisma-gen
    ~# npm run prisma-push
    ~# npm run prisma-seed
    npm run prisma-bind && npm run prisma-gen && npm run prisma-push



* User
> http://localhost:9000/api

* Admin 
> http://admin.localhost:9000/api


## License

MIT

**Free Software, Hell Yeah!**