const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload folders exist
const uploadDir = path.resolve(__dirname, '../../uploads');
const dirs = [
  uploadDir,
  path.join(uploadDir, 'avatars'),
  path.join(uploadDir, 'thumbnails'),
  path.join(uploadDir, 'videos'),
  path.join(uploadDir, 'assignments')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadDir;
    
    // Choose subfolder based on field name or destination hint
    if (file.fieldname === 'avatar') {
      folder = path.join(uploadDir, 'avatars');
    } else if (file.fieldname === 'thumbnail') {
      folder = path.join(uploadDir, 'thumbnails');
    } else if (file.fieldname === 'video') {
      folder = path.join(uploadDir, 'videos');
    } else if (file.fieldname === 'file') {
      folder = path.join(uploadDir, 'assignments');
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (optional helper)
const fileFilter = (req, file, cb) => {
  // Accept standard file types: images, pdfs, videos
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.mov', '.pdf', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type uploaded. Allowed extensions: ' + allowedExtensions.join(', ')));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max file size (for video uploads)
  }
});

module.exports = upload;
