import multer from "multer";

const upload = multer({storgae : multer.diskStorage({})})

export default upload;