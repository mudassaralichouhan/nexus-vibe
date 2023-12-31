import mime from "mime-types";
import minioClient, {bucketName} from "../services/minio-service";

interface FileInfo {
  path: string | null;
}

interface PutFileResult {
  error: boolean,
  message: string,
  info: FileInfo | null,
}

export async function putFile(
  path: string,
  uploadedFile,
  maxSizeInBytes: number = 5 * 1024 * 1024,
  allowedMimeTypes: string[] = [],
): Promise<PutFileResult> {
  if (!uploadedFile)
    return {
      error: true,
      message: 'No files were uploaded.',
      info: null,
    }

  if (uploadedFile.size > maxSizeInBytes)
    return {
      error: true,
      message: 'File size exceeds the maximum allowed size.',
      info: null,
    }

  if (!allowedMimeTypes.includes(uploadedFile.mimetype || ''))
    return {
      error: true,
      message: 'Invalid file type',
      info: null,
    }

  const ext = mime.extension(uploadedFile.mimetype)

  const metaData = {
    'Content-Type': uploadedFile.mimetype,
  };

  try {
    path = `${path}.${ext}`;
    const objectInfo = await minioClient.putObject(bucketName, path, uploadedFile.data, metaData);

    return {
      error: false,
      message: 'Upload successfully',
      info: {path: path},
    }
  } catch (e) {
    return {
      error: true,
      message: e.message,
      info: null,
    }
  }
}

export async function deleteFile(objectName: string): Promise<boolean> {
  try {
    await minioClient.removeObject(bucketName, objectName);
    return true;
  } catch (err) {
    console.error("Unable to remove object: ", err);
    return false;
  }
}

export async function listFiles(prefix: string = '') {
  return new Promise((resolve, reject) => {
    const objectsListTemp = [];
    const stream = minioClient.listObjectsV2(bucketName, prefix, true, '');

    stream.on('data', obj => objectsListTemp.push(obj.name));
    stream.on('error', err => {
      console.error('Error listing objects:', err);
      reject(err);
    });
    stream.on('end', () => {
      resolve(objectsListTemp);
    });
  });
}

export async function listObjectsV2WithMetadata() {
  const objectsStream = minioClient.extensions.listObjectsV2WithMetadata(bucketName, '', true, '')
  objectsStream.on('data', function (obj) {
    console.log(obj)
  })
  objectsStream.on('error', function (e) {
    console.log(e)
  })
}

export async function listFiles1(prefix: string = '') {

  // var data = []
  // var stream = minioClient.listObjects(bucketName, 'profile-photos', true, { IncludeVersion: true })
  // stream.on('data', function (obj) {
  //   data.push(obj, '.listObjects')
  // })
  // stream.on('end', function (obj) {
  //   console.log(data)
  // })
  // stream.on('error', function (err) {
  //   console.log(err)
  // })

  console.log(await minioClient.statObject(bucketName, 'profile-photos/657835ab728087b5f0f9ec2d.jpeg'))
  console.log(await minioClient.statObject(bucketName, 'profile-photos/657835ab728087b5f0f9ec2d.jpeg', {versionId: 'ed545244-8ece-4e7d-9595-6a408c76b8ec'}))
}