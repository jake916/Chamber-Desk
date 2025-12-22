const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Use service key for backend operations
);

// Storage bucket name
const BUCKET_NAME = 'chamber-desk-documents';

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Name of the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{url: string, path: string}>}
 */
async function uploadFile(fileBuffer, fileName, mimeType) {
    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBuffer, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return {
        url: publicUrl,
        path: filePath
    };
}

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - Path of the file in storage
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

module.exports = {
    supabase,
    uploadFile,
    deleteFile,
    BUCKET_NAME
};
