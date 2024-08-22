import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import Bluebird from 'bluebird';
import { v4 as uuidv4 } from 'uuid';
import { ASSET_TYPES } from './uploader.js';

dotenv.config();
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_PUBLIC_BUCKET_NAME } = process.env;

AWS.config.setPromisesDependency(Bluebird);
AWS.config.update({
	accessKeyId: AWS_ACCESS_KEY_ID,
	secretAccessKey: AWS_SECRET_ACCESS_KEY,
	region: AWS_REGION
});

const s3 = new AWS.S3();

const types = {
	COURSE_IMAGE: 'course-image',
	RESOURCE_IMAGE: 'resource-image',
	OTHER: 'other',
};

const imageUpload = async (base64, type) => {
	const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

	// Getting the file type, ie: jpeg, png or gif
	const imageType = base64.split(';')[0].split('/')[1];

	const time = new Date().getTime();

	type = isValueInTypes(type) ? type : types.OTHER;

	const params = {
		Bucket: AWS_PUBLIC_BUCKET_NAME,
		Key: `${type}/${time}.${imageType}`,
		Body: base64Data,
		ACL: 'public-read',
		ContentEncoding: 'base64',
		ContentType: `image/${imageType}`
	};

	let location = '';
	let key = '';
	try {
		const { Location, Key } = await s3.upload(params).promise();
		console.log('key', Key);
		location = Location;
		key = Key;
	} catch (error) {
		console.log("error uploading image", error);
	}

	return {
		location,
		key,
		type: `image/${imageType}`,
		size: base64Data.length
	};
}

const imageBufferUpload = async (id, buffer, mimetype, type, originalname) => {
	const time = new Date().getTime();

	type = isValueInTypes(type) ? type : ASSET_TYPES.OTHER;

	const params = {
		Bucket: AWS_PUBLIC_BUCKET_NAME,
		Key: `${type}/${id}/${time}-${originalname}`,
		Body: buffer,
		ACL: 'public-read',
		// ContentEncoding: 'base64',
		ContentType: mimetype
	};

	let location = '';
	let key = '';
	try {
		const { Location, Key } = await s3.upload(params).promise();
		location = Location;
		key = Key;
		return {
			location,
			key,
		};
	} catch (error) {
		console.log("error uploading image", error);
	}
}

const imageDelete = async (key) => {
	if (!key) {
		console.log("No key found");
		return;
	}

	let data = {};
	try {
		const params = {
			Bucket: AWS_PUBLIC_BUCKET_NAME,
			Key: key
		};

		data = await s3.deleteObject(params).promise();
	} catch (error) {
		console.log('error deleting image:', error);
	}

	return data;
}

const getSignedUrl = async (assetId, filename, filetype, assetType) => {
	try {
		assetType = isValueInTypes(assetType) ? assetType : types.OTHER;

		const params = {
			Bucket: AWS_PUBLIC_BUCKET_NAME,
			Key: `${assetType}/${assetId}/${filename}`,
			Expires: 60,
			ContentType: filetype,
			ACL: 'public-read'
		};

		const data = await s3.getSignedUrl('putObject', params);
		return data;

	} catch (error) {
		console.log('error getting signed url:', error);
	}
}

const renameFile = async (productId, filename, assetType) => {
	try {
		const oldKey = `${AWS_PUBLIC_BUCKET_NAME}/${assetType}/${productId}/${filename}`;
		const oldDeleteKey = `${assetType}/${productId}/${filename}`;
		const newKey = `${assetType}/${productId}/${uuidv4()}`;

		const copyParams = {
			Bucket: AWS_PUBLIC_BUCKET_NAME,
			CopySource: oldKey,
			Key: newKey,
			ACL: 'public-read'
		};

		const deleteParams = {
			Bucket: AWS_PUBLIC_BUCKET_NAME,
			Key: oldDeleteKey,
		};

		await s3.copyObject(copyParams).promise();
		await s3.deleteObject(deleteParams).promise();

		const location = `https://${AWS_PUBLIC_BUCKET_NAME}.s3.amazonaws.com/${newKey}`;
		return {
			location,
			key: newKey,
		};
	} catch (error) {
		console.log('error renaming file:', error);
	}
};

const deleteFile = async (key) => {
	try {
		const deleteParams = {
			Bucket: AWS_PUBLIC_BUCKET_NAME,
			Key: key,
		};

		await s3.deleteObject(deleteParams).promise();
		return true;
	} catch (error) {
		console.log('error renaming file:', error);
		return false;
	}
};

const getFilesDetails = async (assetId, assetType, limit = 10) => {
	try {
		const params = {
			Bucket: AWS_PUBLIC_BUCKET_NAME,
			Delimiter: '/',
			Prefix: `${assetType}/${assetId}/`,
			MaxKeys: limit
		};

		const data = await s3.listObjectsV2(params).promise();
		data.Contents?.forEach(content => {
			content.Location = `https://${AWS_PUBLIC_BUCKET_NAME}.s3.amazonaws.com/${content.Key}`;
		});

		return data;
	} catch (error) {
		console.log('error getting file details:', error);
	}

}

function isValueInTypes(value) {
	for (const key in ASSET_TYPES) {
		if (ASSET_TYPES.hasOwnProperty(key) && ASSET_TYPES[key] == value) {
			return true;
		}
	}
	return false;
}

export {
	imageUpload,
	imageBufferUpload,
	imageDelete,
	types,
	getSignedUrl,
	renameFile,
	deleteFile,
	getFilesDetails,
}