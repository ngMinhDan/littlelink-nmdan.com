// ============================================================================
// MongoDB Associate Developer — Sample Dataset & Seed Script
// ----------------------------------------------------------------------------
// Loads a small, realistic dataset into a "mongodb_learning" database so you
// can practice the queries, indexes, and schema design patterns from the
// study guide against real documents instead of copy-pasting snippets.
//
// Run it with mongosh, e.g.:
//   mongosh "mongodb://admin:password@localhost:27017/mongodb_learning?authSource=admin" seed.js
//
// Or, if you're inside the docker container:
//   docker exec -it mongodb-dev-cert mongosh -u admin -p password \
//     --authenticationDatabase admin mongodb_learning /seed.js
// ============================================================================

const dbName = "mongodb_learning";
db = db.getSiblingDB(dbName);

print(`\n>>> Seeding database "${dbName}" ...\n`);

// ----------------------------------------------------------------------------
// 1. categories — Tree Pattern (Array of Ancestors)
// ----------------------------------------------------------------------------
db.categories.drop();
db.categories.insertMany([
  { _id: "electronics", name: "Electronics", parent: null, ancestors: [] },
  { _id: "computers", name: "Computers", parent: "electronics", ancestors: ["electronics"] },
  { _id: "laptops", name: "Laptops", parent: "computers", ancestors: ["electronics", "computers"] },
  { _id: "phones", name: "Phones", parent: "electronics", ancestors: ["electronics"] },
  { _id: "smartphones", name: "Smartphones", parent: "phones", ancestors: ["electronics", "phones"] }
]);
db.categories.createIndex({ ancestors: 1 });

// ----------------------------------------------------------------------------
// 2. products — Attribute Pattern (varied specs) + Subset Pattern (topReviews)
// ----------------------------------------------------------------------------
db.products.drop();
db.products.insertMany([
  {
    _id: 1,
    name: "AeroBook 14",
    categoryId: "laptops",
    price: 1299.99,
    specs: [
      { k: "cpu", v: "8-core ARM" },
      { k: "ramGB", v: 16 },
      { k: "storageGB", v: 512 }
    ],
    topReviews: [
      { user: "ada", rating: 5, text: "Fast and light." },
      { user: "grace", rating: 4, text: "Great battery life." }
    ],
    totalReviews: 482,
    tags: ["laptop", "ultrabook", "bestseller"]
  },
  {
    _id: 2,
    name: "PixelPhone X100",
    categoryId: "smartphones",
    price: 899.0,
    specs: [
      { k: "resolution", v: "24MP" },
      { k: "waterproof", v: true },
      { k: "batteryMah", v: 4500 }
    ],
    topReviews: [
      { user: "alan", rating: 5, text: "Best camera I've used." }
    ],
    totalReviews: 1210,
    tags: ["phone", "flagship"]
  },
  {
    _id: 3,
    name: "StudyBook Basic",
    categoryId: "laptops",
    price: 449.5,
    specs: [
      { k: "cpu", v: "4-core x86" },
      { k: "ramGB", v: 8 },
      { k: "storageGB", v: 256 }
    ],
    topReviews: [],
    totalReviews: 37,
    tags: ["laptop", "budget"]
  }
]);
// Attribute pattern: one index covers every possible spec key/value pair
db.products.createIndex({ "specs.k": 1, "specs.v": 1 });
db.products.createIndex({ categoryId: 1, price: 1 }); // ESR: equality (categoryId) then range (price)
db.products.createIndex({ tags: 1 }); // multikey index

// ----------------------------------------------------------------------------
// 3. customers — referenced from orders
// ----------------------------------------------------------------------------
db.customers.drop();
db.customers.insertMany([
  { _id: 100, name: "Ada Lovelace", email: "ada@example.com", city: "London" },
  { _id: 101, name: "Alan Turing", email: "alan@example.com", city: "Manchester" },
  { _id: 102, name: "Grace Hopper", email: "grace@example.com", city: "New York" }
]);
db.customers.createIndex({ email: 1 }, { unique: true });

// ----------------------------------------------------------------------------
// 4. orders — Extended Reference Pattern (embeds a customer summary)
// ----------------------------------------------------------------------------
db.orders.drop();
db.orders.insertMany([
  {
    _id: 501,
    customerId: 100,
    customer: { name: "Ada Lovelace", city: "London" }, // extended reference
    status: "shipped",
    items: [
      { sku: 1, name: "AeroBook 14", qty: 1, price: 1299.99 },
      { sku: 3, name: "StudyBook Basic", qty: 1, price: 449.5 }
    ],
    total: 1749.49,
    createdAt: new Date("2026-07-01T10:00:00Z")
  },
  {
    _id: 502,
    customerId: 101,
    customer: { name: "Alan Turing", city: "Manchester" },
    status: "processing",
    items: [{ sku: 2, name: "PixelPhone X100", qty: 1, price: 899.0 }],
    total: 899.0,
    createdAt: new Date("2026-07-15T14:30:00Z")
  },
  {
    _id: 503,
    customerId: 100,
    customer: { name: "Ada Lovelace", city: "London" },
    status: "shipped",
    items: [{ sku: 2, name: "PixelPhone X100", qty: 2, price: 899.0 }],
    total: 1798.0,
    createdAt: new Date("2026-07-20T09:15:00Z")
  },
  {
    _id: 504,
    customerId: 102,
    customer: { name: "Grace Hopper", city: "New York" },
    status: "cancelled",
    items: [{ sku: 3, name: "StudyBook Basic", qty: 1, price: 449.5 }],
    total: 449.5,
    createdAt: new Date("2026-07-22T11:00:00Z")
  }
]);
// ESR-friendly compound index for "find orders by status, sorted by date"
db.orders.createIndex({ status: 1, createdAt: -1 });
db.orders.createIndex({ customerId: 1 });

// ----------------------------------------------------------------------------
// 5. sensor_readings — Bucket Pattern (hourly buckets of sensor data)
// ----------------------------------------------------------------------------
db.sensor_readings.drop();
db.sensor_readings.insertMany([
  {
    sensorId: "sensor-42",
    hour: new Date("2026-07-26T09:00:00Z"),
    readings: [
      { minute: 0, temp: 21.4 },
      { minute: 1, temp: 21.5 },
      { minute: 2, temp: 21.6 }
    ],
    count: 3,
    avgTemp: 21.5,
    minTemp: 21.4,
    maxTemp: 21.6
  },
  {
    sensorId: "sensor-42",
    hour: new Date("2026-07-26T10:00:00Z"),
    readings: [
      { minute: 0, temp: 22.1 },
      { minute: 1, temp: 22.4 }
    ],
    count: 2,
    avgTemp: 22.25,
    minTemp: 22.1,
    maxTemp: 22.4
  }
]);
db.sensor_readings.createIndex({ sensorId: 1, hour: -1 });

print("\n>>> Done. Collections seeded: categories, products, customers, orders, sensor_readings\n");
print(">>> Try it out, e.g.:");
print('    db.orders.find({ status: "shipped" }).sort({ createdAt: -1 })');
print('    db.products.find({ "specs.k": "ramGB", "specs.v": { $gte: 16 } })');
print('    db.orders.aggregate([{ $unwind: "$items" }, { $group: { _id: "$items.name", totalQty: { $sum: "$items.qty" } } }])');
