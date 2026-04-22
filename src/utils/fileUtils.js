/**
 * Converts and compresses an image File to a Base64 string.
 * @param {File} file 
 * @param {Object} options 
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file, options = { maxWidth: 1024, quality: 0.7 }) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > options.maxWidth) {
            height *= options.maxWidth / width;
            width = options.maxWidth;
          }
        } else {
          if (height > options.maxWidth) {
            width *= options.maxWidth / height;
            height = options.maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP for better compression, fallback to JPEG
        const dataUrl = canvas.toDataURL('image/webp', options.quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
