const axios = require("axios");
const Domain = require("../models/Domain");

const RESELLERCLUB_API_KEY = process.env.RESELLERCLUB_API_KEY;
const RESELLERCLUB_USERID = process.env.RESELLERCLUB_USERID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Internal helper: fetch & save from ResellerClub
async function fetchResellerClubData() {
  if (!RESELLERCLUB_API_KEY || !RESELLERCLUB_USERID) {
    throw new Error("Missing ResellerClub API credentials");
  }

  const response = await axios.get(
    `https://httpapi.com/api/domains/search.json?auth-userid=${RESELLERCLUB_USERID}` +
      `&api-key=${RESELLERCLUB_API_KEY}&no-of-records=100&page-no=1`
  );

  const domainList = Object.entries(response.data)
    .filter(([key]) => !isNaN(key))
    .map(([_, item]) => {
      const name = item["entity.description"];
      const cT = parseInt(item["orders.creationtime"]);
      const eT = parseInt(item["orders.endtime"]);
      if (!name || isNaN(cT) || isNaN(eT)) return null;
      return {
        domainName: name,
        creationDate: new Date(cT * 1000),
        expiryDate: new Date(eT * 1000),
        status: item["entity.currentstatus"],
        transferLock: item["orders.transferlock"] === "true",
        domainType: item["entitytype.entitytypename"] || null,
        autoRenew: item["orders.autorenew"] === "true",
        customerId: item["entity.customerid"],
      };
    })
    .filter(Boolean);

  for (const itm of domainList) {
    const custRes = await axios.get(
      `https://httpapi.com/api/customers/details-by-id.json?auth-userid=${RESELLERCLUB_USERID}` +
        `&api-key=${RESELLERCLUB_API_KEY}&customer-id=${itm.customerId}`
    );
    const cust = custRes.data;

    await Domain.updateOne(
      { domainName: itm.domainName },
      {
        $set: {
          domainName: itm.domainName,
          creationDate: itm.creationDate,
          expiryDate: itm.expiryDate,
          status: itm.status,
          transferLock: itm.transferLock,
          domainType: itm.domainType,
          autoRenew: itm.autoRenew,
          customerName: cust.name || null,
          company: cust.company || null,
          email: cust.useremail || null,
          source: "Resellerclub",
        },
      },
      { upsert: true }
    );
  }
}

// Internal helper: fetch & save ALL Cloudflare zones with pagination
async function fetchCloudflareData() {
  if (!CLOUDFLARE_API_TOKEN) {
    throw new Error("Missing Cloudflare API Token");
  }

  const headers = {
    Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  let page = 1;
  const perPage = 50;
  let totalPages = 1;
  let allZones = [];

  do {
    const res = await axios.get(
      `https://api.cloudflare.com/client/v4/zones?page=${page}&per_page=${perPage}`,
      { headers }
    );
    const { result, result_info } = res.data;
    allZones = allZones.concat(result);
    totalPages = result_info.total_pages;
    page += 1;
  } while (page <= totalPages);

  for (const z of allZones) {
    await Domain.updateOne(
      { domainName: z.name },
      {
        $set: {
          domainName: z.name,
          creationDate: new Date(z.created_on),
          expiryDate: null,
          status: z.status,
          transferLock: null,
          domainType: null,
          autoRenew: null,
          customerName: null,
          company: null,
          email: null,
          source: "Cloudflare",
        },
      },
      { upsert: true }
    );
  }
}

// Controller: fetch & save from both sources, then return all domains
const getDomainsFromDb = async (req, res) => {
  try {
    // Always update data before returning
    await fetchResellerClubData();
    await fetchCloudflareData();

    const domains = await Domain.find();
    res.json(domains);
  } catch (err) {
    console.error("❌ Error in getDomainsFromDb:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Expose the individual fetch if you still want manual triggers
const getDomainsFromResellerClub = async (req, res) => {
  try {
    await fetchResellerClubData();
    res.json({ message: "✅ ResellerClub domains fetched and saved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getDomainsFromCloudflare = async (req, res) => {
  try {
    await fetchCloudflareData();
    res.json({ message: `✅ Cloudflare domains fetched and saved.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDomainsFromDb,
  getDomainsFromResellerClub,
  getDomainsFromCloudflare,
};
