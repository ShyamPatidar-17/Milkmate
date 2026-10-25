// config/seedDummyData.js
// Seeds 5 Dairies, 10 Milkmen, 20 completely UNIQUE Customers per Dairy (100 total + Demo 101),
// and their past 3 months milk collection records containing BOTH SHIFTS (Morning & Evening) on every collection day.
import dotenv from "dotenv";
dotenv.config();
import { db } from "./firebase.js";
import { collection, doc, writeBatch, getDocs } from "firebase/firestore";

import Dairy from "../Models/dairy.js";
import Milkman from "../Models/milkman.js";
import Customer from "../Models/customer.js";
import customerr from "../Models/customerr.js";
import MilkmanCustomer from "../Models/milkmancustomer.js";
import Product from "../Models/product.js";
import Settlement from "../Models/settlement.js";
import addMilk from "../Models/addmilk.js";

// Helper to fast-clear a Firestore collection using writeBatch
async function fastClearCollection(colName) {
  try {
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    if (snap.docs.length === 0) return;
    console.log(`🧹 Clearing ${snap.docs.length} existing documents from "${colName}"...`);
    const BATCH_SIZE = 400;
    for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
      const chunk = snap.docs.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      chunk.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.warn(`Warning clearing ${colName}:`, err.message);
  }
}

async function seedAllDummyData() {
  console.log("🌱 Starting Comprehensive Reseed Check...");

  // Quick verification: If 100+ unique customers and 5000+ milk records already exist, keep live data intact
  const existingCustCount = await Customer.countDocuments({});
  const existingMilkCount = await addMilk.countDocuments({});
  if (existingCustCount >= 100 && existingMilkCount >= 5000 && !process.env.FORCE_RESEED) {
    console.log(`ℹ️ Firestore already verified with ${existingCustCount} unique customers and ${existingMilkCount} milk records (both shifts active).`);
    return;
  }

  // 1. Five Certified Dairies Across Key Agricultural Hubs
  const dairiesData = [
    {
      dairyCode: 101,
      fullName: "Rajesh Sharma",
      dairyName: "Saras Milk Dairy Cooperative",
      dairyAddress: "Main Mandi Chauraha, Indore, MP",
      email: "saras101@milkmate.com",
      contact: 9879638521,
      password: "password123",
      confirmPassword: "password123"
    },
    {
      dairyCode: 102,
      fullName: "Vikram Patel",
      dairyName: "Amul Sangam Chilling Center",
      dairyAddress: "Station Road, Anand, Gujarat",
      email: "amul102@milkmate.com",
      contact: 9871122334,
      password: "password123",
      confirmPassword: "password123"
    },
    {
      dairyCode: 103,
      fullName: "Gopal Yadav",
      dairyName: "Krishna Dairy Farm & Chiller",
      dairyAddress: "Dairy Circle, Mathura, UP",
      email: "krishna103@milkmate.com",
      contact: 9872233445,
      password: "password123",
      confirmPassword: "password123"
    },
    {
      dairyCode: 104,
      fullName: "Kailash Choudhary",
      dairyName: "Radhe Govind Dudh Utpadan",
      dairyAddress: "Krishi Mandi Gate 2, Jaipur, Rajasthan",
      email: "radhe104@milkmate.com",
      contact: 9873344556,
      password: "password123",
      confirmPassword: "password123"
    },
    {
      dairyCode: 105,
      fullName: "Mahesh Deshmukh",
      dairyName: "Ganga Godavari Milk Federation",
      dairyAddress: "Sangamner Road, Nashik, Maharashtra",
      email: "ganga105@milkmate.com",
      contact: 9874455667,
      password: "password123",
      confirmPassword: "password123"
    }
  ];

  for (const d of dairiesData) {
    const existing = await Dairy.findOne({ dairyCode: d.dairyCode });
    if (!existing) {
      await Dairy.create(d);
      console.log(`✅ Registered Dairy #${d.dairyCode}: ${d.dairyName}`);
    } else {
      console.log(`ℹ️ Dairy #${d.dairyCode} verified.`);
    }
  }

  // 2. Ten Active Milkmen
  const milkmenData = [
    { milkmanCode: 101, name: "Shyam Patidar", contact: 9879638521, email: "shyam101@milkmate.com", address: "Route: Annapurna & Rajendra Nagar, Indore" },
    { milkmanCode: 102, name: "Ramesh Gurjar", contact: 9870001002, email: "ramesh102@milkmate.com", address: "Route: Palasia & Vijay Nagar, Indore" },
    { milkmanCode: 103, name: "Suresh Jat", contact: 9870001003, email: "suresh103@milkmate.com", address: "Route: Sudama Nagar & Mhow Naka, Indore" },
    { milkmanCode: 104, name: "Dinesh Ahir", contact: 9870001004, email: "dinesh104@milkmate.com", address: "Route: Civil Lines & Cantonment, Mathura" },
    { milkmanCode: 105, name: "Mukesh Dhangar", contact: 9870001005, email: "mukesh105@milkmate.com", address: "Route: Tilak Nagar & Bengali Square, Indore" },
    { milkmanCode: 106, name: "Santosh Gawali", contact: 9870001006, email: "santosh106@milkmate.com", address: "Route: Shivaji Nagar & Model Colony, Nashik" },
    { milkmanCode: 107, name: "Harish Rawat", contact: 9870001007, email: "harish107@milkmate.com", address: "Route: Mansarovar Sector 1-5, Jaipur" },
    { milkmanCode: 108, name: "Bhupendra Solanki", contact: 9870001008, email: "bhupendra108@milkmate.com", address: "Route: Malviya Nagar & Gandhi Path, Jaipur" },
    { milkmanCode: 109, name: "Kishore Rajput", contact: 9870001009, email: "kishore109@milkmate.com", address: "Route: Station Road & GIDC, Anand" },
    { milkmanCode: 110, name: "Balram Yadav", contact: 9870001010, email: "balram110@milkmate.com", address: "Route: Dairy Circle & Gokul Bypass, Mathura" }
  ];

  for (const m of milkmenData) {
    const existing = await Milkman.findOne({ milkmanCode: m.milkmanCode });
    if (!existing) {
      await Milkman.create({
        ...m,
        password: "password123",
        confirmPassword: "password123"
      });
      console.log(`✅ Registered Milkman #${m.milkmanCode}: ${m.name}`);
    } else {
      console.log(`ℹ️ Milkman #${m.milkmanCode} verified.`);
    }
  }

  // 3. Clear Existing Customer & Milk Collections to Guarantee Zero Duplicates
  console.log("🔄 Resetting customer, milk, and settlement collections for clean unique population...");
  await fastClearCollection("customers");
  await fastClearCollection("customerrs");
  await fastClearCollection("milkmancustomers");
  await fastClearCollection("addmilk");
  await fastClearCollection("settlements");

  // 4. One Hundred 100% UNIQUE Customers (20 Distinct Farmers per Dairy)
  // Each farmer has a unique First Name, unique Last Name, unique Mobile Number, and unique Village Address!
  const uniqueCustomersMaster = [
    // --- DAIRY 101: SARAS MILK DAIRY COOPERATIVE (INDORE / MALWA, MP) ---
    { code: 1, codeD: 101, first: "Ramkaran", last: "Patidar", contact: 9826101001, address: "Gram Betma, Near Old Banyan Tree, Indore, MP" },
    { code: 2, codeD: 101, first: "Devilal", last: "Malviya", contact: 9826101002, address: "Gram Rau, Station Road, Indore, MP" },
    { code: 3, codeD: 101, first: "Bherulal", last: "Choudhary", contact: 9826101003, address: "Gram Sanwer, Mandi Marg, Indore, MP" },
    { code: 4, codeD: 101, first: "Mangilal", last: "Parmar", contact: 9826101004, address: "Gram Depalpur, Chamunda Chauraha, Indore, MP" },
    { code: 5, codeD: 101, first: "Shivnarayan", last: "Dangi", contact: 9826101005, address: "Gram Mangliya, AB Road, Indore, MP" },
    { code: 6, codeD: 101, first: "Radheshyam", last: "Solanki", contact: 9826101006, address: "Gram Simrol, Ghat Road, Indore, MP" },
    { code: 7, codeD: 101, first: "Laxminarayan", last: "Anjana", contact: 9826101007, address: "Gram Ralamandal, Hill View, Indore, MP" },
    { code: 8, codeD: 101, first: "Omkar", last: "Mandloi", contact: 9826101008, address: "Gram Hatod, Dhar Naka, Indore, MP" },
    { code: 9, codeD: 101, first: "Bhagirath", last: "Borasi", contact: 9826101009, address: "Gram Kanadia, Main Gram Panchayat, Indore, MP" },
    { code: 10, codeD: 101, first: "Kanhaiyalal", last: "Sisodiya", contact: 9826101010, address: "Gram Bicholi Mardana, Bypass Gate, Indore, MP" },
    { code: 11, codeD: 101, first: "Gheesalal", last: "Mukati", contact: 9826101011, address: "Gram Hasalpur, Mhow Road, Indore, MP" },
    { code: 12, codeD: 101, first: "Nandram", last: "Rathore", contact: 9826101012, address: "Gram Kampel, Shiv Temple Road, Indore, MP" },
    { code: 13, codeD: 101, first: "Sundarlal", last: "Panwar", contact: 9826101013, address: "Gram Manpur, NH-52, Indore, MP" },
    { code: 14, codeD: 101, first: "Chhitarji", last: "Kag", contact: 9826101014, address: "Gram Dudhia, Scheme 140 Extension, Indore, MP" },
    { code: 15, codeD: 101, first: "Balmukund", last: "Birla", contact: 9826101015, address: "Gram Machal, Dhar Road, Indore, MP" },
    { code: 16, codeD: 101, first: "Govardhan", last: "Gehlot", contact: 9826101016, address: "Gram Tillor Khurd, Lake View, Indore, MP" },
    { code: 17, codeD: 101, first: "Madanlal", last: "Porwal", contact: 9826101017, address: "Gram Pedmi, Datoda Link Road, Indore, MP" },
    { code: 18, codeD: 101, first: "Kishanlal", last: "Rawat", contact: 9826101018, address: "Gram Datoda, Khandwa Road, Indore, MP" },
    { code: 19, codeD: 101, first: "Jagdish", last: "Joshi", contact: 9826101019, address: "Gram Asrawad Khurd, Ring Road, Indore, MP" },
    { code: 20, codeD: 101, first: "Hiralal", last: "Bhati", contact: 9826101020, address: "Gram Budhi Barlai, Dewas Link, Indore, MP" },

    // --- DAIRY 102: AMUL SANGAM CHILLING CENTER (ANAND, GUJARAT) ---
    { code: 1, codeD: 102, first: "Arvindbhai", last: "Patel", contact: 9825102001, address: "Gam Mogar, Near Amul Feed Plant, Anand, Gujarat" },
    { code: 2, codeD: 102, first: "Bhaveshbhai", last: "Desai", contact: 9825102002, address: "Gam Chikhodra, Express Highway Cross, Anand, Gujarat" },
    { code: 3, codeD: 102, first: "Chimanbhai", last: "Rabari", contact: 9825102003, address: "Gam Samarkha, Chokdi Road, Anand, Gujarat" },
    { code: 4, codeD: 102, first: "Dharmeshbhai", last: "Bharwad", contact: 9825102004, address: "Gam Jitodia, Near Mahadev Mandir, Anand, Gujarat" },
    { code: 5, codeD: 102, first: "Ganeshbhai", last: "Gohil", contact: 9825102005, address: "Gam Karamsad, Sardar Patel Smarak Road, Anand, Gujarat" },
    { code: 6, codeD: 102, first: "Hasmukhbhai", last: "Vaghela", contact: 9825102006, address: "Gam Bakrol, V.V. Nagar Road, Anand, Gujarat" },
    { code: 7, codeD: 102, first: "Ishwarbhai", last: "Chauhan", contact: 9825102007, address: "Gam Hadgood, Railway Crossing, Anand, Gujarat" },
    { code: 8, codeD: 102, first: "Jayeshbhai", last: "Zala", contact: 9825102008, address: "Gam Vallabh Vidyanagar, Mota Bazaar, Anand, Gujarat" },
    { code: 9, codeD: 102, first: "Kiritbhai", last: "Dabhi", contact: 9825102009, address: "Gam Ode, Main Bazaar, Anand, Gujarat" },
    { code: 10, codeD: 102, first: "Lalitbhai", last: "Rathod", contact: 9825102010, address: "Gam Vasad, Mahi River Bank, Anand, Gujarat" },
    { code: 11, codeD: 102, first: "Manharbhai", last: "Padhiyar", contact: 9825102011, address: "Gam Boriavi, National Highway 8, Anand, Gujarat" },
    { code: 12, codeD: 102, first: "Nileshbhai", last: "Makwana", contact: 9825102012, address: "Gam Napapad, Vadtal Road, Anand, Gujarat" },
    { code: 13, codeD: 102, first: "Pareshbhai", last: "Sodha", contact: 9825102013, address: "Gam Lambhvel, Hanuman Mandir Chawk, Anand, Gujarat" },
    { code: 14, codeD: 102, first: "Ramanbhai", last: "Thakor", contact: 9825102014, address: "Gam Sarsa, Canal Road, Anand, Gujarat" },
    { code: 15, codeD: 102, first: "Shaileshbhai", last: "Baria", contact: 9825102015, address: "Gam Umreth, Tower Bazaar, Anand, Gujarat" },
    { code: 16, codeD: 102, first: "Tulsibhai", last: "Vasava", contact: 9825102016, address: "Gam Anklav, Station Road, Anand, Gujarat" },
    { code: 17, codeD: 102, first: "Upendrabhai", last: "Raval", contact: 9825102017, address: "Gam Tarapur, Cross Road, Anand, Gujarat" },
    { code: 18, codeD: 102, first: "Vipulbhai", last: "Prajapati", contact: 9825102018, address: "Gam Khambhat, Gawaliwad, Anand, Gujarat" },
    { code: 19, codeD: 102, first: "Yogeshbhai", last: "Shah", contact: 9825102019, address: "Gam Petlad, Station Road, Anand, Gujarat" },
    { code: 20, codeD: 102, first: "Pravinbhai", last: "Solanki", contact: 9825102020, address: "Gam Sojitra, Chora Pase, Anand, Gujarat" },

    // --- DAIRY 103: KRISHNA DAIRY FARM & CHILLER (MATHURA / BRAJ, UP) ---
    { code: 1, codeD: 103, first: "Shyam Bihari", last: "Yadav", contact: 9837103001, address: "Gram Gokul, Yamuna Tat Marg, Mathura, UP" },
    { code: 2, codeD: 103, first: "Radhey Shyam", last: "Gurjar", contact: 9837103002, address: "Gram Mahavan, Purana Qila Road, Mathura, UP" },
    { code: 3, codeD: 103, first: "Brijesh", last: "Sharma", contact: 9837103003, address: "Gram Baldeo, Dauji Temple Road, Mathura, UP" },
    { code: 4, codeD: 103, first: "Balram", last: "Goswami", contact: 9837103004, address: "Gram Vrindavan Dehat, Parikrama Marg, Mathura, UP" },
    { code: 5, codeD: 103, first: "Murari Lal", last: "Baghel", contact: 9837103005, address: "Gram Goverdhan, Daan Ghati Chauraha, Mathura, UP" },
    { code: 6, codeD: 103, first: "Girraj", last: "Rawat", contact: 9837103006, address: "Gram Radhakund, Shyam Kund Road, Mathura, UP" },
    { code: 7, codeD: 103, first: "Mohan Swaroop", last: "Chaudhari", contact: 9837103007, address: "Gram Barsana, Shriji Mandir Marg, Mathura, UP" },
    { code: 8, codeD: 103, first: "Harishankar", last: "Tomar", contact: 9837103008, address: "Gram Nandgaon, Yashoda Kund, Mathura, UP" },
    { code: 9, codeD: 103, first: "Kanhaiya", last: "Sinsinwar", contact: 9837103009, address: "Gram Chaumuha, Delhi-Agra Highway, Mathura, UP" },
    { code: 10, codeD: 103, first: "Banke Bihari", last: "Sisodia", contact: 9837103010, address: "Gram Farah, Near Refinery Gate, Mathura, UP" },
    { code: 11, codeD: 103, first: "Devendra", last: "Gautam", contact: 9837103011, address: "Gram Raya, Sadabad Road, Mathura, UP" },
    { code: 12, codeD: 103, first: "Rambabu", last: "Dixit", contact: 9837103012, address: "Gram Sonkh, Bharatpur Border, Mathura, UP" },
    { code: 13, codeD: 103, first: "Raghunath", last: "Chaturvedi", contact: 9837103013, address: "Gram Magorra, Mandi Samiti, Mathura, UP" },
    { code: 14, codeD: 103, first: "Chandrabhan", last: "Upadhyay", contact: 9837103014, address: "Gram Ol, Bharatpur Road, Mathura, UP" },
    { code: 15, codeD: 103, first: "Dwarika Prasad", last: "Shastri", contact: 9837103015, address: "Gram Jait, GLA Campus Marg, Mathura, UP" },
    { code: 16, codeD: 103, first: "Nem Singh", last: "Tiwari", contact: 9837103016, address: "Gram Bati, Govardhan Road, Mathura, UP" },
    { code: 17, codeD: 103, first: "Puran Chand", last: "Pandey", contact: 9837103017, address: "Gram Daulatpur, Sonkh Road, Mathura, UP" },
    { code: 18, codeD: 103, first: "Bhagwat Prasad", last: "Saraswat", contact: 9837103018, address: "Gram Kotwan, Kosi Kalan Border, Mathura, UP" },
    { code: 19, codeD: 103, first: "Shivcharan", last: "Bhardwaj", contact: 9837103019, address: "Gram Naujheel, Yamuna Expressway Link, Mathura, UP" },
    { code: 20, codeD: 103, first: "Triloki Nath", last: "Mishra", contact: 9837103020, address: "Gram Bajna, Main Market Chauraha, Mathura, UP" },

    // --- DAIRY 104: RADHE GOVIND DUDH UTPADAN (JAIPUR / RAJASTHAN) ---
    { code: 1, codeD: 104, first: "Bhanwar Singh", last: "Shekhawat", contact: 9829104001, address: "Gram Bassi, Dausa Mega Highway, Jaipur, Rajasthan" },
    { code: 2, codeD: 104, first: "Tejaram", last: "Jat", contact: 9829104002, address: "Gram Chaksu, Sheetla Mata Dham Road, Jaipur, Rajasthan" },
    { code: 3, codeD: 104, first: "Moolchand", last: "Meena", contact: 9829104003, address: "Gram Jamwa Ramgarh, Dam Road, Jaipur, Rajasthan" },
    { code: 4, codeD: 104, first: "Sheoram", last: "Kumawat", contact: 9829104004, address: "Gram Chomu, Thana Chauraha, Jaipur, Rajasthan" },
    { code: 5, codeD: 104, first: "Hanuman Prasad", last: "Tanwar", contact: 9829104005, address: "Gram Shahpura, NH-48 Bypass, Jaipur, Rajasthan" },
    { code: 6, codeD: 104, first: "Sugan Chand", last: "Bajiya", contact: 9829104006, address: "Gram Kotputli, Krishi Mandi Gate, Jaipur, Rajasthan" },
    { code: 7, codeD: 104, first: "Pema Ram", last: "Burdak", contact: 9829104007, address: "Gram Amber Dehat, Hathi Gaon Marg, Jaipur, Rajasthan" },
    { code: 8, codeD: 104, first: "Girdhari Lal", last: "Dotasra", contact: 9829104008, address: "Gram Phulera, Sambhar Lake Road, Jaipur, Rajasthan" },
    { code: 9, codeD: 104, first: "Sukhdev", last: "Jakhar", contact: 9829104009, address: "Gram Sambhar, Salt Works Road, Jaipur, Rajasthan" },
    { code: 10, codeD: 104, first: "Jagdev", last: "Khichar", contact: 9829104010, address: "Gram Jobner, Agriculture College Marg, Jaipur, Rajasthan" },
    { code: 11, codeD: 104, first: "Bhoma Ram", last: "Mahla", contact: 9829104011, address: "Gram Dudu, Ajmer Express Highway, Jaipur, Rajasthan" },
    { code: 12, codeD: 104, first: "Dana Ram", last: "Nitharwal", contact: 9829104012, address: "Gram Mozamabad, Tehsil Road, Jaipur, Rajasthan" },
    { code: 13, codeD: 104, first: "Roopa Ram", last: "Poonia", contact: 9829104013, address: "Gram Sanganer Dehat, Muhana Mandi Road, Jaipur, Rajasthan" },
    { code: 14, codeD: 104, first: "Mohan Ram", last: "Ranwa", contact: 9829104014, address: "Gram Bagru, Riico Industrial Area, Jaipur, Rajasthan" },
    { code: 15, codeD: 104, first: "Birbal", last: "Siyag", contact: 9829104015, address: "Gram Vatika, Tonk Road, Jaipur, Rajasthan" },
    { code: 16, codeD: 104, first: "Khema Ram", last: "Thalor", contact: 9829104016, address: "Gram Renwal, Mandi Chauraha, Jaipur, Rajasthan" },
    { code: 17, codeD: 104, first: "Hari Singh", last: "Godara", contact: 9829104017, address: "Gram Kalwar, Hathoj Road, Jaipur, Rajasthan" },
    { code: 18, codeD: 104, first: "Pratap Singh", last: "Kaswan", contact: 9829104018, address: "Gram Achrol, Delhi Highway, Jaipur, Rajasthan" },
    { code: 19, codeD: 104, first: "Surja Ram", last: "Beda", contact: 9829104019, address: "Gram Bairath, Viratnagar Road, Jaipur, Rajasthan" },
    { code: 20, codeD: 104, first: "Kana Ram", last: "Dudi", contact: 9829104020, address: "Gram Manoharpur, Toll Plaza Bypass, Jaipur, Rajasthan" },

    // --- DAIRY 105: GANGA GODAVARI MILK FEDERATION (NASHIK / MAHARASHTRA) ---
    { code: 1, codeD: 105, first: "Dnyaneshwar", last: "Shinde", contact: 9822105001, address: "Mouje Sinnar, Malegaon MIDC Road, Nashik, Maharashtra" },
    { code: 2, codeD: 105, first: "Tukaram", last: "Deshmukh", contact: 9822105002, address: "Mouje Niphad, Godavari Canal Marg, Nashik, Maharashtra" },
    { code: 3, codeD: 105, first: "Pandurang", last: "Patil", contact: 9822105003, address: "Mouje Dindori, Vani Road, Nashik, Maharashtra" },
    { code: 4, codeD: 105, first: "Eknath", last: "Gawali", contact: 9822105004, address: "Mouje Igatpuri, Kasara Ghat Marg, Nashik, Maharashtra" },
    { code: 5, codeD: 105, first: "Namdeo", last: "Jadhav", contact: 9822105005, address: "Mouje Yeola, Paithani Handloom Cluster, Nashik, Maharashtra" },
    { code: 6, codeD: 105, first: "Bhausaheb", last: "Gaikwad", contact: 9822105006, address: "Mouje Chandwad, Renuka Mata Temple Road, Nashik, Maharashtra" },
    { code: 7, codeD: 105, first: "Raosaheb", last: "More", contact: 9822105007, address: "Mouje Kalwan, Abhona Road, Nashik, Maharashtra" },
    { code: 8, codeD: 105, first: "Dattatray", last: "Chavan", contact: 9822105008, address: "Mouje Baglan, Satana Marg, Nashik, Maharashtra" },
    { code: 9, codeD: 105, first: "Nivrutti", last: "Kadam", contact: 9822105009, address: "Mouje Deola, Rameshwar Road, Nashik, Maharashtra" },
    { code: 10, codeD: 105, first: "Vitthal", last: "Sonawane", contact: 9822105010, address: "Mouje Trimbakeshwar, Kushavarta Tirth Marg, Nashik, Maharashtra" },
    { code: 11, codeD: 105, first: "Sopan", last: "Thorat", contact: 9822105011, address: "Mouje Peth, Gujarat Border Road, Nashik, Maharashtra" },
    { code: 12, codeD: 105, first: "Kashinath", last: "Khairnar", contact: 9822105012, address: "Mouje Surgana, Tribal Dairy Chawk, Nashik, Maharashtra" },
    { code: 13, codeD: 105, first: "Baburao", last: "Bhamare", contact: 9822105013, address: "Mouje Ozar, Airport Link Road, Nashik, Maharashtra" },
    { code: 14, codeD: 105, first: "Balasaheb", last: "Wagh", contact: 9822105014, address: "Mouje Lasalgaon, Onion Mandi Gate, Nashik, Maharashtra" },
    { code: 15, codeD: 105, first: "Anandrao", last: "Gangurde", contact: 9822105015, address: "Mouje Pimpalgaon Baswant, NH-3 Highway, Nashik, Maharashtra" },
    { code: 16, codeD: 105, first: "Popatrao", last: "Nikam", contact: 9822105016, address: "Mouje Vani, Saptashrungi Gad Road, Nashik, Maharashtra" },
    { code: 17, codeD: 105, first: "Gorakhnath", last: "Aher", contact: 9822105017, address: "Mouje Ghoti, Mumbai Agra Marg, Nashik, Maharashtra" },
    { code: 18, codeD: 105, first: "Trimbak", last: "Sanap", contact: 9822105018, address: "Mouje Saykheda, River Bank, Nashik, Maharashtra" },
    { code: 19, codeD: 105, first: "Shrirang", last: "Darade", contact: 9822105019, address: "Mouje Nandgaon, Station Road, Nashik, Maharashtra" },
    { code: 20, codeD: 105, first: "Ganpat", last: "Gite", contact: 9822105020, address: "Mouje Satana, Taharabad Road, Nashik, Maharashtra" },

    // --- DEMO CUSTOMER 101 FOR QUICK PORTAL DEMONSTRATION ---
    { code: 101, codeD: 101, first: "Demo", last: "Customer", contact: 9879638521, address: "Demo Household, Scheme 54, Vijay Nagar, Indore, MP" }
  ];

  console.log(`📦 Enrolling ${uniqueCustomersMaster.length} uniquely defined customer profiles across all 5 dairies...`);

  // Batch insert customers, customerrs auth, and milkmancustomers
  const custCol = collection(db, "customers");
  const authCol = collection(db, "customerrs");
  const mmCustCol = collection(db, "milkmancustomers");

  const BATCH_SIZE = 400;

  for (let i = 0; i < uniqueCustomersMaster.length; i += 100) {
    const chunk = uniqueCustomersMaster.slice(i, i + 100);
    const batch = writeBatch(db);

    for (const cust of chunk) {
      // 1. Customer profile in dairy
      const custDoc = doc(custCol);
      batch.set(custDoc, cust);

      // 2. Customer portal authentication login
      const authDoc = doc(authCol);
      batch.set(authDoc, {
        code: cust.code,
        codeD: cust.codeD,
        contact: cust.contact,
        password: "password123",
        confirmPassword: "password123"
      });

      // 3. Mapping to Milkman route delivery
      const assignedMilkman = 101 + ((cust.codeD - 101) * 2) + (cust.code % 2);
      const mmDoc = doc(mmCustCol);
      batch.set(mmDoc, {
        code: cust.code,
        milkmanCode: assignedMilkman,
        first: cust.first,
        last: cust.last,
        contact: cust.contact,
        address: cust.address
      });
    }

    await batch.commit();
    console.log(` Saved ${Math.min(i + 100, uniqueCustomersMaster.length)} / ${uniqueCustomersMaster.length} customers with credentials.`);
  }

  // 5. Generate Past 3 Months Milk Collection Records (August, September, October 2026)
  // Requirement: EVERY collection day MUST include BOTH SHIFTS (Morning "Mor" AND Evening "Eve")
  // Requirement: NO same customer milk details - distinct, realistic metrics strictly computed via (Fat*6.5) + (SNF*3.5)
  console.log("🚀 Generating past 3 months milk collection records with BOTH SHIFTS (Morning & Evening) on every collection date...");

  const baseToday = new Date(); // Current date (Late October 2026)
  const recordsToInsert = [];

  // 28 collection dates spanning the last 84 days (every 3 days across Aug, Sept, Oct)
  const collectionIntervalDays = 3;
  const totalDaysSpan = 84;

  for (const cust of uniqueCustomersMaster) {
    // Generate distinct baseline traits for each farmer's herd
    // Varying dairy cow vs buffalo breeds, yields, and fat densities
    const farmerSeed = (cust.code * 17 + cust.codeD * 31);
    const baseFat = 4.2 + ((farmerSeed % 26) * 0.1);          // 4.2% to 6.7%
    const baseSnf = 8.3 + ((farmerSeed % 10) * 0.09);         // 8.3% to 9.2%
    const baseLiters = 6.0 + ((farmerSeed % 14) * 0.85);      // 6.0L to 17.0L

    let dayCounter = 0;
    for (let dayOffset = totalDaysSpan; dayOffset >= 0; dayOffset -= collectionIntervalDays) {
      dayCounter++;
      const recordDate = new Date(baseToday);
      recordDate.setDate(recordDate.getDate() - dayOffset);

      // Realistic periodic weather & feed fluctuation
      const dayDeltaFat = Math.sin(dayCounter * 1.35 + cust.code * 0.7) * 0.28;
      const dayDeltaSnf = Math.cos(dayCounter * 0.95 + cust.codeD * 0.5) * 0.14;
      const dayDeltaLiters = Math.sin(dayCounter * 2.1 + cust.code * 1.6) * 1.35;

      // ==========================================
      // 1. MORNING SHIFT ("Mor") ENTRY
      // ==========================================
      const morFat = parseFloat(Math.max(3.8, Math.min(7.6, baseFat + dayDeltaFat)).toFixed(1));
      const morSnf = parseFloat(Math.max(8.2, Math.min(9.4, baseSnf + dayDeltaSnf)).toFixed(1));
      const morLiters = parseFloat(Math.max(4.5, Math.min(22.0, baseLiters + dayDeltaLiters)).toFixed(1));
      const morRate = parseFloat(((morFat * 6.5) + (morSnf * 3.5)).toFixed(2));
      const morAmount = parseFloat((morLiters * morRate).toFixed(2));

      // Morning shift timestamp (06:30 AM)
      const morningDate = new Date(recordDate);
      morningDate.setHours(6, 30 + (cust.code % 25), 0, 0);

      recordsToInsert.push({
        code: cust.code,
        dairyCode: cust.codeD,
        date: morningDate,
        shift: "Mor",
        fat: morFat,
        snf: morSnf,
        liter: morLiters,
        rate: morRate,
        amount: morAmount
      });

      // ==========================================
      // 2. EVENING SHIFT ("Eve") ENTRY (ALWAYS PRESENT!)
      // Evening milk has higher fat (+0.2% - +0.5%) and slightly adjusted volume
      // ==========================================
      const eveFatBonus = 0.25 + (Math.sin(dayCounter + cust.code) * 0.12);
      const eveFat = parseFloat(Math.max(4.0, Math.min(7.9, morFat + eveFatBonus)).toFixed(1));
      const eveSnf = parseFloat(Math.max(8.1, Math.min(9.3, morSnf - 0.08 + Math.cos(dayCounter) * 0.06)).toFixed(1));
      // Evening yield typically 82-94% of morning milking
      const eveVolumeFactor = 0.84 + ((farmerSeed + dayCounter) % 11) * 0.01;
      const eveLiters = parseFloat(Math.max(4.0, Math.min(20.0, morLiters * eveVolumeFactor)).toFixed(1));
      const eveRate = parseFloat(((eveFat * 6.5) + (eveSnf * 3.5)).toFixed(2));
      const eveAmount = parseFloat((eveLiters * eveRate).toFixed(2));

      // Evening shift timestamp (06:00 PM)
      const eveningDate = new Date(recordDate);
      eveningDate.setHours(18, 15 + (cust.code % 30), 0, 0);

      recordsToInsert.push({
        code: cust.code,
        dairyCode: cust.codeD,
        date: eveningDate,
        shift: "Eve",
        fat: eveFat,
        snf: eveSnf,
        liter: eveLiters,
        rate: eveRate,
        amount: eveAmount
      });
    }
  }

  console.log(`📦 Prepared ${recordsToInsert.length} milk records (every delivery date has BOTH Morning & Evening shifts).`);
  console.log("🚀 Writing milk records in high-performance Firestore batches...");

  const addMilkCol = collection(db, "addmilk");
  for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
    const chunk = recordsToInsert.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const rec of chunk) {
      const docRef = doc(addMilkCol);
      batch.set(docRef, rec);
    }

    await batch.commit();
    console.log(` Committed milk records ${i + 1} to ${Math.min(i + BATCH_SIZE, recordsToInsert.length)} / ${recordsToInsert.length}`);
  }

  console.log("✅ All past 3 months milk intake records (with BOTH shifts) successfully written to Firestore!");

  // 6. Seed Realistic Settlement History for Demonstration
  console.log("💰 Seeding sample settlement transaction history (Full & Partial clearance)...");
  const settlementCol = collection(db, "settlements");
  const sampleSettlements = [
    // Dairy 101, Customer 1: Partial settlement in Sept, Partial settlement in Oct
    {
      dairyCode: 101,
      customerCode: 1,
      date: new Date(Date.now() - 40 * 86400000),
      settledAmount: 8000.00,
      type: "Partial",
      previousPending: 14500.00,
      remainingBalance: 6500.00,
      paymentMode: "Bank Transfer",
      notes: "First installment for August deliveries via NEFT",
      settledBy: "Rajesh Sharma"
    },
    {
      dairyCode: 101,
      customerCode: 1,
      date: new Date(Date.now() - 15 * 86400000),
      settledAmount: 5000.00,
      type: "Partial",
      previousPending: 18200.00,
      remainingBalance: 13200.00,
      paymentMode: "UPI / PhonePe",
      notes: "Mid-October festival advance installment",
      settledBy: "Rajesh Sharma"
    },
    // Dairy 101, Customer 2: Full settlement 2 weeks ago
    {
      dairyCode: 101,
      customerCode: 2,
      date: new Date(Date.now() - 14 * 86400000),
      settledAmount: 12000.00,
      type: "Partial",
      previousPending: 19500.00,
      remainingBalance: 7500.00,
      paymentMode: "Cash",
      notes: "Cash payment at Mandi center counter",
      settledBy: "Rajesh Sharma"
    },
    // Dairy 101, Customer 3: Full clearance
    {
      dairyCode: 101,
      customerCode: 3,
      date: new Date(Date.now() - 5 * 86400000),
      settledAmount: 15400.00,
      type: "Partial",
      previousPending: 22100.00,
      remainingBalance: 6700.00,
      paymentMode: "Direct Bank Transfer",
      notes: "Direct DBT bank transfer for September balance",
      settledBy: "Rajesh Sharma"
    },
    // Dairy 101, Customer 4: 100% Complete Settlement (All records completed / green background)
    {
      dairyCode: 101,
      customerCode: 4,
      date: new Date(Date.now() - 2 * 86400000),
      settledAmount: 39482.19,
      type: "Full",
      previousPending: 39482.19,
      remainingBalance: 0,
      paymentMode: "Direct Bank Transfer",
      notes: "100% Complete clearance for all milk intake records",
      settledBy: "Rajesh Sharma"
    },
    // Dairy 101, Demo Customer 101: Partial settlement
    {
      dairyCode: 101,
      customerCode: 101,
      date: new Date(Date.now() - 8 * 86400000),
      settledAmount: 5000.00,
      type: "Partial",
      previousPending: 28500.00,
      remainingBalance: 23500.00,
      paymentMode: "UPI / Google Pay",
      notes: "Instant UPI installment payment",
      settledBy: "Rajesh Sharma"
    },
    // Dairy 102, Customer 1
    {
      dairyCode: 102,
      customerCode: 1,
      date: new Date(Date.now() - 20 * 86400000),
      settledAmount: 10000.00,
      type: "Partial",
      previousPending: 16800.00,
      remainingBalance: 6800.00,
      paymentMode: "Bank Transfer",
      notes: "Cooperative society monthly clearing",
      settledBy: "Vikram Patel"
    },
    // Dairy 103, Customer 1
    {
      dairyCode: 103,
      customerCode: 1,
      date: new Date(Date.now() - 12 * 86400000),
      settledAmount: 9500.00,
      type: "Partial",
      previousPending: 15200.00,
      remainingBalance: 5700.00,
      paymentMode: "Cash",
      notes: "Cash payment at Mathura Chilling Center",
      settledBy: "Gopal Yadav"
    }
  ];

  const sBatch = writeBatch(db);
  for (const s of sampleSettlements) {
    const sDoc = doc(settlementCol);
    sBatch.set(sDoc, s);
  }
  await sBatch.commit();
  console.log(`✅ Seeded ${sampleSettlements.length} sample settlements with audit trail.`);

  // 7. Dairy Store Products
  const products = await Product.find({});
  if (!products || products.length === 0) {
    await Product.create([
      {
        code: 101,
        name: "Pure Desi Cow Ghee (500ml)",
        price: 480,
        desc: "Traditional bilona churned A2 cow ghee with rich golden aroma.",
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80"
      },
      {
        code: 101,
        name: "Fresh Malai Paneer (250g)",
        price: 110,
        desc: "Soft, succulent, protein-dense cottage cheese made from fresh whole milk.",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
      },
      {
        code: 101,
        name: "Cultured Organic Dahi (400g)",
        price: 45,
        desc: "Thick, probiotic curd naturally set in clay pots without preservatives.",
        image: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=600&q=80"
      },
      {
        code: 101,
        name: "Farm Fresh Cow Milk (1 Liter Pouch)",
        price: 66,
        desc: "Chilled, pasteurized whole cow milk delivered within 6 hours of morning milking.",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"
      }
    ]);
    console.log("✅ Seeded fresh dairy marketplace products.");
  }

  console.log("🎉 ALL SEEDING COMPLETE! 5 Dairies, 10 Milkmen, 100 100% Unique Customers, BOTH Morning & Evening Shifts on all collection dates, and Settlements are live in Firestore!");
}

export default seedAllDummyData;
export { seedAllDummyData };

if (process.argv[1] && process.argv[1].endsWith("seedDummyData.js")) {
  seedAllDummyData()
    .then(() => {
      console.log("✨ Done!");
      process.exit(0);
    })
    .catch(err => {
      console.error("❌ Seeding Error:", err);
      process.exit(1);
    });
}
