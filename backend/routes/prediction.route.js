const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.post("/predict", (req, res) => {

    const stock = req.body.stock;

    const predictionsPath = path.join(
        __dirname,
        "..", "..",
        "predictions.json"
    );

    const predictions = JSON.parse(
        fs.readFileSync(
            predictionsPath,
            "utf8"
        )
    );

    if (!predictions[stock]) {
        return res.status(404).json({
            error: "Stock not found"
        });
    }

    res.json(
        predictions[stock]
    );

});

module.exports = router;