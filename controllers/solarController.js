const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { storage, solarCollection } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { getDocs, query, where, addDoc, doc, getDoc, deleteDoc, setDoc } = require("firebase/firestore");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

// @desc    Add Solar document
// @route   POST ~/api/solar
// @access  Public
exports.addSolar = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const image = req.file;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new ApiError('Name is required and should be a non-empty string.', 400));
  }

  const q = query(solarCollection, where("name", "==", name));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return next(new ApiError('Name must be unique.', 400));
  }

  const fileName = `${uuidv4()}${path.extname(image.originalname)}`;
  const storageRef = ref(storage, `images/solar/${fileName}`);
  const buffer = Buffer.from(image.buffer);
  await uploadBytes(storageRef, buffer, {
    contentType: 'image/jpeg',
  });

  const imageUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(solarCollection, {
    image: imageUrl,
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date(),
  });

  if (!docRef) next(new ApiError(`Error adding solar document: ${error.message}`, 500));

  res.status(201).json({ id: docRef.id, message: 'Solar document added successfully!' });
});

// @desc    Get all Solar documents
// @route   GET ~/api/solar
// @access  Public
exports.getAllSolar = asyncHandler(async (req, res, next) => {
  const snapshot = await getDocs(solarCollection);

  if (snapshot.empty) {
    return res.status(404).json({ message: 'No solar documents found.' });
  }

  const solarData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.status(200).json(solarData);
});

// @desc    Get a Solar document by ID
// @route   GET ~/api/solar/:id
// @access  Public
exports.getSolarById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const docRef = doc(solarCollection, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return res.status(404).json({ message: 'Solar document not found.' });
  }

  res.status(200).json({
    id: docSnap.id,
    ...docSnap.data()
  });
});

// @desc    Update a Solar document by ID
// @route   PUT ~/api/solar/:id
// @access  Public
exports.updateSolar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  // Validate the input fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new ApiError('Name is required and should be a non-empty string.', 400));
  }

  try {
    // Get the document reference
    const docRef = doc(solarCollection, id);
    const docSnap = await getDoc(docRef);

    // Check if the document exists
    if (!docSnap.exists()) {
      return res.status(404).json({ message: 'Solar document not found.' });
    }

    // If image is updated, handle the image upload
    let imageUrl = docSnap.data().image;  // Keep the old image URL if no new image is provided
    if (image) {
      // Upload new image to Firebase Storage
      const fileName = `${uuidv4()}${path.extname(image.originalname)}`;
      const storageRef = ref(storage, `images/solar/${fileName}`);
      const buffer = Buffer.from(image.buffer);
      await uploadBytes(storageRef, buffer, {
        contentType: 'image/jpeg',
      });

      // Get the public URL of the uploaded image
      imageUrl = await getDownloadURL(storageRef);
    }

    // Update the Solar document
    await setDoc(docRef, {
      name: name.trim(),
      description: description.trim(),
      image: imageUrl,
      updatedAt: new Date(),
    }, { merge: true });

    res.status(200).json({ message: 'Solar document updated successfully!' });
  } catch (error) {
    next(new ApiError(`Error updating solar document: ${error.message}`, 500));
  }
});


// @desc    Delete a Solar document by ID
// @route   DELETE ~/api/solar/:id
// @access  Public
exports.deleteSolar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const docRef = doc(solarCollection, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return res.status(404).json({ message: 'Solar document not found.' });
  }

  await deleteDoc(docRef);

  res.status(200).json({ message: 'Solar document deleted successfully!' });
});
