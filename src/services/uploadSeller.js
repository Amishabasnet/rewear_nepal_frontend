import api from "./api";

const uploadService = {
  // Uploads a single image and returns its hosted URL.
  uploadProductImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/product", formData, {
      headers: { "Content-Type": undefined },
    });
  },
};

export default uploadService;
