const express = require("express")
const csv = require("csvtojson");
const path = require("path");


const router = express.Router();

router.get("/stocks",async (req,res)=>{

    const csvPath = path.join(__dirname, "..","Nifty 50.csv");
    const data = await csv().fromFile(csvPath);
    const symbols = data.map(row => row.Symbol);
    const uniqueSymbols = [...new Set(symbols)];
    res.json(uniqueSymbols);
})

module.exports=router;