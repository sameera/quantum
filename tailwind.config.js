const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require("./tailwind.preset.js")],
    content: [
        join(
            __dirname,
            "src/**/*!(*.stories|*.spec).{ts,tsx}"
        ),
    ],
};
