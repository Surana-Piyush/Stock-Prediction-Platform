const express = require("express")
const csv = require("csvtojson");
const path = require("path");

const STOCKS = [
    "ADANIENT.NS",
    "ADANIPORTS.NS",
    "APOLLOHOSP.NS",
    "AXISBANK.NS",
    "BAJAJ-AUTO.NS",
    "BAJAJFINSV.NS",
    "BAJFINANCE.NS",
    "BEL.NS",
    "BHARTIARTL.NS",
    "BPCL.NS",
    "BRITANNIA.NS",
    "CIPLA.NS",
    "COALINDIA.NS",
    "DIVISLAB.NS",
    "DRREDDY.NS",
    "EICHERMOT.NS",
    "GRASIM.NS",
    "HCLTECH.NS",
    "HDFCBANK.NS",
    "HDFCLIFE.NS",
    "HINDALCO.NS",
    "HINDUNILVR.NS",
    "ICICIBANK.NS",
    "INFY.NS",
    "ITC.NS",
    "JSWSTEEL.NS",
    "KOTAKBANK.NS",
    "LT.NS",
    "M&M.NS",
    "MARUTI.NS",
    "NESTLEIND.NS",
    "NTPC.NS",
    "ONGC.NS",
    "POWERGRID.NS",
    "RELIANCE.NS",
    "SBILIFE.NS",
    "SBIN.NS",
    "SHRIRAMFIN.NS",
    "SUNPHARMA.NS",
    "TATACONSUM.NS",
    "TATAPOWER.NS",
    "TATASTEEL.NS",
    "TCS.NS",
    "TECHM.NS",
    "TRENT.NS",
    "ULTRACEMCO.NS",
    "UPL.NS",
    "WIPRO.NS"
];

const router = express.Router();

router.get("/stocks",(req,res)=>{

    // Backend server takes to much time to load all stocks
    // const csvPath = path.join(__dirname, "..","Nifty 50.csv");
    // const data = await csv().fromFile(csvPath);
    // const symbols = data.map(row => row.Symbol);
    // const uniqueSymbols = [...new Set(symbols)];
    // res.json(uniqueSymbols);

    res.json(STOCKS);
})

module.exports=router;