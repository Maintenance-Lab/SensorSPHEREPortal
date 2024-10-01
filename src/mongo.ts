// import mongoose from "mongoose";
// import { IS_PROD, MONGODB_URI } from "./config.js";

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
// }

// let cached: any = { conn: null, promise: null };

// export const dbConnect = async () => {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: !IS_PROD
//       // bufferCommands: true
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose;
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.promise = null;
//     throw e;
//   }

//   return cached.conn;
// };

// export default dbConnect;
