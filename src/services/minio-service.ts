import * as Minio from 'minio'
import {env} from "../helpers"

export const bucketName = 'nexus-vibe-bucket'

const minioClient = new Minio.Client({
  region: "auto",
  endPoint: env('MINIO_HOST'),
  port: parseInt(env('MINIO_PORT', 9000)),
  useSSL: env('MINIO_SSL') === 'true',
  accessKey: env('MINIO_ACCESS_KEY'),
  secretKey: env('MINIO_SECRET_KEY'),
});

// Ensure that the bucket exists, create it if not
minioClient.bucketExists(bucketName, function (err, exists) {
  if (!exists) {
    minioClient.makeBucket(bucketName, 'auto', function (err) {
      if (err) {
        console.error('Error creating bucket: ', err)
      } else {
        console.log('Bucket created successfully');

        minioClient.setBucketVersioning(bucketName, {Status: 'Enabled'})
          .then((config) => {
            console.log('setBucketVersioning', config)
          });

        minioClient.getBucketVersioning(bucketName).then((config) => {
          console.log(config)
        });
      }
    });
  }
});

export default minioClient