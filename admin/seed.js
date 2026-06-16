require('dotenv').config();
const mongoose = require('mongoose');
const Footer = require('./models/Footer');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Footer.deleteMany({});
  await Footer.create({
    brand: { title: "Habib's Fashion", logo: "/logo.png", about: "Your ultimate destination..." },
    socials: [
      { name: 'facebook', url: 'https://facebook.com', icon: 'FaFacebookF' },
      { name: 'instagram', url: 'https://instagram.com', icon: 'FaInstagram' }
    ],
    quickLinks: [{ label: 'Home', href: '/' }, { label: 'All Products', href: '/products' }],
    categories: [{ name: 'Shirts', slug: 'shirts' }, { name: 'Pants', slug: 'pants' }],
    contact: { address: 'Jamalpur, Bangladesh', phone: '+8801788563988', email: 'habibsfashion@gmail.com', website: 'www.habibsfashion.com' },
    copyrightText: '© 2025 Habib\'s Fashion. All Rights Reserved.'
  });
  console.log('Seeded');
  process.exit(0);
}
seed().catch(console.error);
