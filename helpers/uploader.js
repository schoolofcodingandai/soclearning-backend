import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { Types } from 'mongoose';

// Configure dotenv for accessing environment variables
import dotenv from "dotenv";
dotenv.config();

// TODO: Optimize images before uploading to S3

const ASSET_TYPES = {
	COURSE_IMAGE: 'course-image',
	RESOURCE_IMAGE: 'resource-image',
	OTHER: 'other',
};

const IMAGE_FILES = {
	JPG: '.jpg',
	JPEG: '.jpeg',
	PNG: '.png',
	GIF: '.gif',
};

const MIME_TYPES = {
	IMAGE: 'image/',
};

/**
 * @description Sanitize file before uploading
 * @param {Array} allowedFileTypes 
 * @param {String} allowedMimeType 
 * @param {*} file 
 * @param {*} cb 
 * @returns 
 */
const sanitizeFile = (allowedFileTypes, allowedMimeType, file, cb) => {
	const isAllowedExt = allowedFileTypes.includes(
		path.extname(file.originalname.toLowerCase())
	);

	const isAllowedMimeType = file.mimetype.startsWith(allowedMimeType);

	if (isAllowedExt && isAllowedMimeType) {
		return cb(null, true);
	} else {
		cb(
			'Error: File type not allowed. Allowed types: ' + allowedFileTypes.joiin(', ')
		);
	}
}

/**
 * @description S3 setup
 */
const s3 = new S3Client({
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	},
	region: process.env.AWS_REGION
});


/**
 * @description Multer setup for public images
 */
const getPublicStorage = (assetType, id) => {
	const assetId = id || new Types.ObjectId().toString();
	console.log('asset type', assetType, 'asset id', assetId);
	return multerS3({
		s3,
		bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
		acl: 'public-read',
		metadata: (req, file, cb) => {
			cb(null, { fieldname: file.fieldname, assetId });
		},
		key: (req, file, cb) => {

			console.log('req inside getPublicStorage', req);
			const fileName = Date.now().toString() + '-' + file.fieldname + '-' + file.originalname;
			const folderName = assetType && assetId ? `${assetType}/${assetId}/${fileName}` : fileName;
			cb(null, folderName);
		}
	});
}

/**
 * @description Common function to upload images
 */
const uploadImage = (storageType, allowedFileTypes, allowedMimeType, maxFileSize, assetType, assetId = null) => multer({
	storage: storageType || getPublicStorage(assetType, assetId),
	fileFilter: (req, file, callback) => {
		sanitizeFile(
			allowedFileTypes,
			allowedMimeType,
			file,
			callback
		);
	},
	limits: {
		fileSize: maxFileSize || 1024 * 1024 * 1, // 1MB
	},
});

/**
 * @description Common function to upload single image
 */
const uploadSingleImage = (allowedFileTypes, allowedMimeType, maxFileSize) => multer({
	storage: multer.memoryStorage(),
	fileFilter: (req, file, callback) => {
		sanitizeFile(
			allowedFileTypes,
			allowedMimeType,
			file,
			callback
		);
	},
	limits: {
		fileSize: maxFileSize || 1024 * 1024 * 1, // 1MB
	},
});

/**
 * @description Common function to uploading video files
 */
// const uploadVideo = 

export {
	ASSET_TYPES,
	IMAGE_FILES,
	MIME_TYPES,
	getPublicStorage,
	uploadImage,
	uploadSingleImage,
};