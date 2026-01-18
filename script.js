// SELECT ELEMENTS
const canvas = document.getElementById("cert-canvas");
const ctx = canvas.getContext("2d");
const nameInput = document.getElementById("cert-name-input");
const dateInput = document.getElementById("cert-date-input");
const downloadBtn = document.getElementById("download-btn");
const previewBtn = document.getElementById("preview-btn");
const csvInput = document.getElementById("csv-upload");
const bulkBtn = document.getElementById("bulk-btn");

// CONFIGURATION
const imageSrc = "Meem-Certificate-Template.png";

const nameConfig = {
    font: '600 64px "Rubik", sans-serif',
    color: "#3a86ff",
    x: 220,
    y: 700,
    tracking: "4px",
};

const dateConfig = {
    font: '600 32px "Inter", sans-serif',
    color: "#3a86ff",
    x: 500,
    y: 1212,
    tracking: "4px",
};

dateInput.valueAsDate = new Date();

const image = new Image();
image.src = imageSrc;

image.onload = function () {
    drawCertificate();
};

// HELPERS


function formatDate(dateString) {
    const date = dateString ? new Date(dateString) : new Date();
    const options = { year: "numeric", month: "long" };
    return date.toLocaleDateString("en-US", options);
}


function drawCertificate(nameOverride = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const nameText =
        nameOverride !== null ? nameOverride : nameInput.value || "";
    const rawDate = dateInput.value;
    const dateText = formatDate(rawDate);

    if (nameText) {
        ctx.font = nameConfig.font;
        ctx.fillStyle = nameConfig.color;
        ctx.textAlign = "left";
        if (ctx.letterSpacing !== undefined) {
            ctx.letterSpacing = nameConfig.tracking;
        }
        ctx.fillText(nameText, nameConfig.x, nameConfig.y);
    }

    if (dateText) {
        ctx.font = dateConfig.font;
        ctx.fillStyle = dateConfig.color;
        if (ctx.letterSpacing !== undefined) {
            ctx.letterSpacing = dateConfig.tracking;
        }
        ctx.fillText(dateText, dateConfig.x, dateConfig.y);
    }
}

// EVENT LISTENERS

// Live Preview
nameInput.addEventListener("input", () => drawCertificate());
dateInput.addEventListener("change", () => drawCertificate());
if (previewBtn) previewBtn.addEventListener("click", () => drawCertificate());

// Single Download
downloadBtn.addEventListener("click", function () {
    if (!nameInput.value.trim()) {
        alert("Please enter a student name before downloading.");
        return;
    }
    const safeName = nameInput.value
        .trim()
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
    const filename = `Certificate_${safeName}.png`;

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
});

// Bulk Logic
bulkBtn.addEventListener("click", async function () {
    const file = csvInput.files[0];

    if (!file) {
        alert("Please upload a CSV file first.");
        return;
    }

    // Zip
    const zip = new JSZip();
    const folder = zip.folder("Certificates");
    const reader = new FileReader();

    bulkBtn.textContent = "Processing...";
    bulkBtn.disabled = true;

    reader.onload = async function (e) {
        const text = e.target.result;
        const names = text
            .split(/\r?\n/)
            .map((name) => name.trim())
            .filter((name) => name);

        if (names.length === 0) {
            alert("The file seems empty.");
            bulkBtn.textContent = "Generate .ZIP";
            bulkBtn.disabled = false;
            return;
        }

        for (let i = 0; i < names.length; i++) {
            const studentName = names[i];

            drawCertificate(studentName);

            const blob = await new Promise((resolve) =>
                canvas.toBlob(resolve, "image/png")
            );

            const safeName = studentName.replace(/[^a-z0-9]/gi, "_");
            folder.file(`${safeName}.png`, blob);
        }

        zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, "Meem_Certificates.zip");

            bulkBtn.textContent = "Generate .ZIP";
            bulkBtn.disabled = false;
            alert(`Success! Generated ${names.length} certificates.`);

            drawCertificate();
        });
    };

    reader.readAsText(file);
});
