
// Update in the submit handler to fix batch_number type
// Replace:
const formData = {
  ...values,
  batch_number: values.batch_number.toString(),
  imageFile: selectedImage,
};

// With:
const formData = {
  ...values,
  batch_number: values.batch_number?.toString() || '',
  imageFile: selectedImage,
};
