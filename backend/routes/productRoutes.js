const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const {
  authMiddleware,
  adminMiddleware,
  sellerMiddleware,
} = require("../middleware/auth");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!file || !allowedTypes.includes(file.mimetype)) {
      console.error("Invalid file type:", file ? file.mimetype : "No file");
      return cb(new Error("Only JPEG, PNG, GIF, or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

cloudinary.config({
  cloud_name: "dnt02rm0d",
  api_key: 425324363575823,
  api_secret: "FRI7Pb9-ekv0q7pMrIEK0L4OZRk"
});

router.post(
  "/",
  authMiddleware,
  sellerMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    console.log("Received product creation request:", req.body, "file", req.files)
    const {
      name,
      description,
      price,
      category,
      stock,
      currency = "USD",
    } = req.body;

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    let imageUrls = [];

    if (req.files && req.files.length) {
      console.log("Uploading images to Cloudinary...");
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            { folder: "products" },
          );
          console.log("Uploaded image URL:", result.secure_url);
          imageUrls.push(result.secure_url);
        } catch (uploadErr) {
          console.error("Cloudinary upload error:", uploadErr);
          continue;
        }
      }
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      currency,
      category: category.trim(),
      stock: parsedStock,
      seller: req.user.id,
      sellerType: req.user.role === "seller" ? "seller" : "admin",
      images: imageUrls,
    });

    await product.save();
    res.status(201).json(product);
  },
);

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product.deleted) {
      console.log("Product already deleted");
      return res.status(400).json({ message: "Product already deleted" });
    }

    product.deleted = true;
    await product.save();
    res.json({ message: "Product marked as deleted" });
  } catch (err) {
    console.error("Product deletion error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ deleted: false });
    console.log("Fetched products count:", products.length);
    res.json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
});

router.get("/my-products", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.id,
      deleted: false,
    });
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/seller", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }

    product.deleted = true;
    await product.save();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      deleted: false,
    }).populate("reviews.user");
    if (!product) {
      console.error("Product not found or deleted:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Failed to fetch product:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: err.message });
  }
});
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const { rating, comment } = req.body;
  console.log("req.user", req.user);

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const newReview = {
    user: req.user.id,
    rating,
    comment,
  };
  console.log("review", newReview);

  product.reviews.push(newReview);

  product.averageRating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save();
  let data = await Product.findById(id).populate("reviews.user");
  console.log("data", data.reviews[3].user.name);
  data.reviews.map((val) => {
    console.log("name", val?.user?.name);
  });
  let product2 = await Product.findById(id).populate("reviews.user");

  res.status(200).json(data);
});

module.exports = router;
