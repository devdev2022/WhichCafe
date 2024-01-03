import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

class S3ClientModule {
  private s3Client: S3Client;

  constructor(region = "ap-northeast-2") {
    this.s3Client = new S3Client({ region });
  }

  async checkFileExistenceInS3(bucketName: string, imageName: string) {
    try {
      const params = {
        Bucket: bucketName,
        Key: imageName,
      };

      await this.s3Client.send(new HeadObjectCommand(params));
      return true;
    } catch (error) {
      if ((error as Error).name === "NotFound") {
        return false;
      }
      throw error;
    }
  }

  async uploadImageToS3(
    bucketName: string,
    imageName: string,
    imageData: string
  ) {
    try {
      const doesImageExist = await this.checkFileExistenceInS3(
        bucketName,
        imageName
      );

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

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      return `https://${bucketName}.s3.amazonaws.com/${imageName}`;
    } catch (error) {
      console.error(`Error during the upload process: ${error}`);
      throw error;
    }
  }
}

export { S3ClientModule };
