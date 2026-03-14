const http = require('http');

async function run() {
  // 1. Login
  const loginRes = await fetch("http://localhost:3005/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "carlosres@gmail.com", password: "123456" })
  });
  
  const cookie = loginRes.headers.get("set-cookie");

  const offerBody = {
    title: "Senior Backend Engineer",
    description: "Seeking a senior engineer",
    salary: 5000,
    modality: "remote",
    min_experience_years: 5,
    required_english_level: "B2",
    positions_available: 2,
    category_ids: ["9b161bda-00ee-4b9d-91a2-86a7bab7191e"],
    skill_ids: ["7828de3e-fb81-4568-ab63-f438697c22be"]
  };

  console.log("Creating offer...");
  const offerRes = await fetch("http://localhost:3005/offers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookie
    },
    body: JSON.stringify(offerBody)
  });

  const offerData = await offerRes.json();
  console.log("Offer creation response:");
  console.log(offerData);
}

run().catch(console.error);
