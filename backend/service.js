const express = require("express")
const predictionRoutes = require("./routes/prediction.route.js");
const stockNames = require("./routes/stockNames.route.js")

const PORT = 3000;

const app = new express();
app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        "status":"ok"
    })
})

app.use("/api",predictionRoutes);
app.use("/api",stockNames);

app.listen(PORT,()=>{
    console.log("Running at port 3000")
})