import mongoose from "mongoose";
import initData from "./data.js";
import Customer from "../Models/customer.js";
import Dairy from "../Models/dairy.js";
import Milkman from "../Models/milkman.js";
import customerr from "../Models/customerr.js";
import addMilk from "../Models/addmilk.js";


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


