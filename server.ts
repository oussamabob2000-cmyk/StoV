import express from "express";
import { createServer as createViteServer } from "vite";
import puppeteer from "puppeteer";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for capturing screenshots
  app.post("/api/screenshot", async (req, res) => {
    const { url, width, height, fullPage = false } = req.body;

    if (!url || !width || !height) {
      return res.status(400).json({ error: "Missing required parameters: url, width, height" });
    }

    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });

      const page = await browser.newPage();
      
      // Set viewport to match the requested dimensions and high density
      await page.setViewport({
        width: parseInt(width, 10),
        height: parseInt(height, 10),
        deviceScaleFactor: 2,
      });

      // Navigate to the URL and wait for network to be idle
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Capture screenshot
      const screenshotBuffer = await page.screenshot({
        fullPage: fullPage,
        type: 'jpeg',
        quality: 90,
      });

      await browser.close();

      // Send the image back as base64
      const base64Image = Buffer.from(screenshotBuffer).toString('base64');
      res.json({ image: `data:image/jpeg;base64,${base64Image}` });
    } catch (error: any) {
      console.error("Screenshot error:", error);
      res.status(500).json({ error: error.message || "Failed to capture screenshot" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
