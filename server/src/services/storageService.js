import supabase from "../config/supabase.js";

const BUCKET_NAME = "documents";

export const uploadFile = async (fileBuffer, filePath, contentType) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteFile = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }
};