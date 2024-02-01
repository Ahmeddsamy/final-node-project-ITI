// Schema and Model
import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
  categoryName: String,
  imageURL: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const categoryModel = mongoose.model("Category", categorySchema);

export default categoryModel;
