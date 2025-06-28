const mongoose = require('mongoose');
const initData=require("./data.js");
const Customer=require("../Models/customer.js");
const Dairy=require("../Models/dairy.js");
const Milkman=require("../Models/milkman.js");
const customerr=require("../Models/customerr.js");
const addMilk=require("../Models/addmilk.js")


const dbUrl="mongodb://localhost:27017/Milkman"

main().then(()=>
    {
        console.log("Connected with Database Successfully");
    }).catch(err=>{
        console.log(err)
    })
    async function main() {
        await mongoose.connect(dbUrl);
}

const initdb=async()=>{
    await addMilk.deleteMany();
    await addMilk.insertMany(initData.data5);  // data1 = customer ; data2 =dairy owner ; data3=milkman; data4=customerr  //data5=milkData
    console.log("Data Was initialized");
}

initdb();


