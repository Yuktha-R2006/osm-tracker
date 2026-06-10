const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const platformSchema = mongoose.Schema({
  name: String,
  logo: String,
  accentColor: String,
  status: String,
});

const Platform = mongoose.models.Platform || mongoose.model('Platform', platformSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    const platforms = await Platform.find({});
    console.log('Platforms found in database:');
    platforms.forEach(p => {
      console.log(`- ID: ${p._id}, Name: ${p.name}, Logo: ${p.logo}, Status: ${p.status}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
