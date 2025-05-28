require('dotenv').config();
const mongoose = require('mongoose');

async function dropEmailIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const collection = mongoose.connection.db.collection('contacts');
    const indexes = await collection.indexes();

    const emailIndex = indexes.find(idx => idx.name === 'email_1');
    if (emailIndex && emailIndex.unique) {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped unique index on email');
    } else {
      console.log('ℹ️ No unique unique index on email found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error dropping index:', error.message);
  }
}

dropEmailIndex();
