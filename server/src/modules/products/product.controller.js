import Product from "./product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      size,
      color,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const query = {};

    if (category) {
      query.category = { $in: category.split(",") };
    }

    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    if (color) {
      query["colors.label"] = { $in: color.split(",") };
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};

    switch (sort) {
      case "price_low":
        sortOption.price = 1;
        break;
      case "price_high":
        sortOption.price = -1;
        break;
      case "rating":
        sortOption.rating = -1;
        break;
      case "newest":
        sortOption.createdAt = -1;
        break;
      default:
        sortOption.createdAt = -1;
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      page: Number(page),
      total,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
