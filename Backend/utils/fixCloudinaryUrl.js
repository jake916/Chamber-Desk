/**
 * Fixes Cloudinary URLs for proper file type handling
 * Converts /image/upload/ to /raw/upload/ for non-image files
 * Adds fl_inline for PDFs to enable browser preview
 */
function fixCloudinaryUrl(url, filename = '') {
    if (!url) return url;

    // Extract file extension from URL or filename
    const urlExt = url.split('.').pop().toLowerCase().split('?')[0];
    const filenameExt = filename.split('.').pop().toLowerCase();
    const ext = filenameExt || urlExt;

    // Define image extensions
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const isImage = imageExtensions.includes(ext);

    // If it's an image, return as-is
    if (isImage) {
        return url;
    }

    // For non-images (PDFs, docs, etc.), fix the URL
    let fixedUrl = url;

    // Replace /image/upload/ with /raw/upload/
    if (fixedUrl.includes('/image/upload/')) {
        fixedUrl = fixedUrl.replace('/image/upload/', '/raw/upload/');
    }

    // For PDFs, add fl_inline to enable browser preview
    if (ext === 'pdf' && !fixedUrl.includes('fl_inline')) {
        fixedUrl = fixedUrl.replace('/raw/upload/', '/raw/upload/fl_inline/');
    }

    return fixedUrl;
}

module.exports = fixCloudinaryUrl;
