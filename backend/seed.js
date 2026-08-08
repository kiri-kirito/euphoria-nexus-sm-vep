require('dotenv').config();
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding 50 sellers...');
    const sellerIds = [];
    for (let i = 0; i < 50; i++) {
      const sellerId = faker.string.uuid();
      sellerIds.push(sellerId);
      const name = faker.person.fullName();
      const email = faker.internet.email();
      const passwordHash = 'dummyhash';
      
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'seller')`,
        [sellerId, name, email, passwordHash]
      );
      
      const storeName = faker.company.name();
      // Generate Dhaka-ish coordinates for location testing
      const lat = 23.7 + Math.random() * 0.2;
      const lng = 90.3 + Math.random() * 0.2;
      
      await client.query(
        `INSERT INTO stores (user_id, store_name, is_approved, location) 
         VALUES ($1, $2, true, ST_SetSRID(ST_MakePoint($3, $4), 4326))`,
        [sellerId, storeName, lng, lat]
      );
    }
    
    console.log('Seeding 100 products...');
    const categories = ['Electronics', 'Clothing', 'Home', 'Toys', 'Books'];
    for (let i = 0; i < 100; i++) {
      const sellerId = faker.helpers.arrayElement(sellerIds);
      const name = faker.commerce.productName();
      const description = faker.commerce.productDescription();
      const price = faker.commerce.price({ min: 100, max: 15000, dec: 2 });
      const quantity = faker.number.int({ min: 10, max: 500 });
      const category = faker.helpers.arrayElement(categories);
      const images = JSON.stringify([`https://placehold.co/600x400/png?text=${encodeURIComponent(name)}`]);

      await client.query(
        `INSERT INTO products (seller_id, name, description, price, quantity, category, images) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [sellerId, name, description, price, quantity, category, images]
      );
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', e);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
