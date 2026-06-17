    const express = require("express")
    const { exec } = require("child_process");

    const router = express.Router();

    router.post("/predict",(req,res)=>{
        const stock = req.body.stock;

        exec(`python ../predict.py ${stock}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Shell stderr: ${stderr}`);
            return;
        }
            const result = JSON.parse(stdout);
            res.json(result);
        });

        
    });

    module.exports=router;