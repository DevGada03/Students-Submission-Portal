const mongoose = require('mongoose');

const uri = "mongodb://trail:trail@ac-dlnx5wu-shard-00-00.458t33x.mongodb.net:27017,ac-dlnx5wu-shard-00-01.458t33x.mongodb.net:27017,ac-dlnx5wu-shard-00-02.458t33x.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=portal";

async function run() {
  try {
    console.log("Connecting...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully! Testing query...");
    
    // Define a dummy model to test query
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }), 'users');
    const user = await TestModel.findOne({});
    console.log("Query complete! User found:", user);
  } catch (error) {
    console.error("Connection/Query failed:", error);
  } finally {
    mongoose.connection.close();
  }
}
run();
