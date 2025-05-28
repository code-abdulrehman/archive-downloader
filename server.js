const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Store active downloads for progress tracking
const activeDownloads = new Map();

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const files = fs.readdirSync(downloadsDir);
    const fileStats = [];
    let totalSize = 0;
    let largestFile = { name: '', size: 0 };
    let lastUpdate = 0;
    const extensionCounts = {};

    for (const file of files) {
      const filePath = path.join(downloadsDir, file);
      const stats = fs.statSync(filePath);
      const ext = path.extname(file).toLowerCase() || 'no extension';
      
      extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
      totalSize += stats.size;
      
      if (stats.size > largestFile.size) {
        largestFile = { name: file, size: stats.size };
      }
      
      if (stats.mtime.getTime() > lastUpdate) {
        lastUpdate = stats.mtime.getTime();
      }

      fileStats.push({
        name: file,
        size: stats.size,
        extension: ext,
        modified: stats.mtime.getTime(),
        created: stats.birthtime.getTime()
      });
    }

    res.json({
      totalFiles: files.length,
      totalSize,
      largestFile,
      lastUpdate,
      extensionCounts,
      files: fileStats.sort((a, b) => b.modified - a.modified)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get download progress
app.get('/api/download-progress', (req, res) => {
  const progress = Array.from(activeDownloads.entries()).map(([id, data]) => ({
    id,
    ...data
  }));
  res.json(progress);
});

// Delete files
app.delete('/api/files/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(downloadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/download', async (req, res) => {
  const { files } = req.body;
  const downloadId = Date.now().toString();
  
  // Initialize progress tracking
  activeDownloads.set(downloadId, {
    totalFiles: files.length,
    completedFiles: 0,
    currentFile: '',
    progress: 0,
    status: 'starting'
  });

  const downloadPromises = files.map(async (file, index) => {
    try {
      // Update current file being downloaded
      activeDownloads.set(downloadId, {
        ...activeDownloads.get(downloadId),
        currentFile: file.name,
        status: 'downloading'
      });

      const response = await axios.get(file.url, { 
        responseType: 'stream',
        timeout: 30000
      });
      
      const filePath = path.join(__dirname, 'downloads', file.name);
      const writer = fs.createWriteStream(filePath);
      
      let downloadedBytes = 0;
      const totalBytes = parseInt(response.headers['content-length'] || '0');

      response.data.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const fileProgress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0;
        const overallProgress = ((index + fileProgress / 100) / files.length) * 100;
        
        activeDownloads.set(downloadId, {
          ...activeDownloads.get(downloadId),
          progress: Math.round(overallProgress)
        });
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          const currentData = activeDownloads.get(downloadId);
          activeDownloads.set(downloadId, {
            ...currentData,
            completedFiles: currentData.completedFiles + 1
          });
          resolve(filePath);
        });
        writer.on('error', reject);
        response.data.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to download ${file.name}: ${error.message}`);
    }
  });

  try {
    const downloadedFiles = await Promise.all(downloadPromises);
    
    // Mark as completed
    activeDownloads.set(downloadId, {
      ...activeDownloads.get(downloadId),
      status: 'completed',
      progress: 100
    });

    // Remove from active downloads after 5 seconds
    setTimeout(() => {
      activeDownloads.delete(downloadId);
    }, 5000);

    res.json({ success: true, files: downloadedFiles, downloadId });
  } catch (error) {
    activeDownloads.set(downloadId, {
      ...activeDownloads.get(downloadId),
      status: 'error',
      error: error.message
    });
    
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});