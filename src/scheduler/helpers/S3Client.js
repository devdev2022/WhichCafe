const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ region: "ap-northeast-2" });

async function checkFileExistenceInS3(bucketName, imageName) {
  try {
    const params = {
      Bucket: bucketName,
      Key: imageName,
    };

    await s3Client.send(new HeadObjectCommand(params));
    return true;
  } catch (error) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}

async function uploadImageToS3(bucketName, imageName, imageData) {
  try {
    const doesImageExist = await checkFileExistenceInS3(bucketName, imageName);

    if (doesImageExist) {
      console.log(
        `Image already exists in S3 at location - ${bucketName}/${imageName}`
      );
      return `https://${bucketName}.s3.amazonaws.com/${imageName}`;
    }

    const uploadParams = {
      Bucket: bucketName,
      Key: imageName,
      Body: imageData,
      ContentType: "image/jpeg",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return `https://${bucketName}.s3.amazonaws.com/${imageName}`;
  } catch (error) {
    console.error(`Error during the upload process: ${error}`);
    throw error;
  }
}
