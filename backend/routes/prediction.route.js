const express = require("express");
const { exec } = require("child_process");
const path = require("path");

const router = express.Router();

router.post("/predict", (req, res) => {

    const stock = req.body.stock;

    const pythonFile = path.join(
        __dirname,
        "..",
        "predict.py"
    );

    exec(
        `python "${pythonFile}" ${stock}`,
        (error, stdout, stderr) => {

            if (error) {
                console.error(`Execution error: ${error.message}`);

                return res.status(500).json({
                    error: error.message
                });
            }

            if (stderr) {
                console.error(`Shell stderr: ${stderr}`);
            }

            try {

                const result = JSON.parse(stdout);

                res.json(result);

            } catch (err) {

                console.error("JSON Parse Error:", err);

                res.status(500).json({
                    error: "Invalid response from Python script"
                });

            }
        }
    );

});

module.exports = router;