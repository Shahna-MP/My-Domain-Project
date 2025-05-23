const express = require("express");
const router = express.Router();

const {
  getDomainsFromResellerClub,
  getDomainsFromCloudflare,
  getDomainsFromDb,
} = require("../controllers/domainController");

// Fetch and store domains from ResellerClub
router.get("/fetch/resellerclub", getDomainsFromResellerClub);

// Fetch and store domains from Cloudflare
router.get("/fetch/cloudflare", getDomainsFromCloudflare);

// Get all domains from MongoDB
router.get("/", getDomainsFromDb);

module.exports = router;
