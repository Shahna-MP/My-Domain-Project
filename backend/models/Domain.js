const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema({
  domainName: {
    type: String,
    required: true,
    unique: true, // Prevent duplicates
    trim: true,
    lowercase: true,
  },
  creationDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: [
      "active",
      "inactive",
      "pending",
      "suspended",
      "deleted",
      null,
      undefined,
    ],
  },
  transferLock: {
    type: Boolean,
    default: null,
  },
  domainType: {
    type: String,
    default: null,
  },
  autoRenew: {
    type: Boolean,
    default: null,
  },
  customerName: {
    type: String,
    default: null,
  },
  company: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  source: {
    type: String,
    enum: ["resellerclub", "cloudflare"],
    required: true,
  },
});

module.exports = mongoose.model("Domain", domainSchema);
