# Archive Downloader Pro

A modern web application for downloading files from Archive.org with a beautiful dashboard interface.

🌐 [Live Preview](https://archive-downloader-xi.vercel.app/) (Preview Only - Downloads work on local setup)

## Features

- 📊 Beautiful dashboard with real-time statistics
- 📁 File management with preview support
- 📈 Visual file extension distribution
- 🔍 Advanced file filtering and search
- ⚡ Real-time download progress tracking
- 🎵 Media preview for audio, video, and images
- 🎨 Modern UI with responsive design

## Local Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/archive-downloader.git
   cd archive-downloader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a downloads directory:
   ```bash
   mkdir downloads
   ```

4. Start the local server:
   ```bash
   node server.js
   ```

5. Access the application:
   Open your browser and visit `http://localhost:3000`

## Usage

1. Enter an Archive.org item URL in the format:
   `https://archive.org/details/your-item-identifier`

2. Click "Fetch Files" to retrieve available files

3. Select files using filters or checkboxes

4. Click "Download Selected" to start downloading

5. Monitor progress in the bottom progress bar

6. Access downloaded files in the "Downloaded Files" section

## Supported File Types

### Preview Support
- Images: jpg, jpeg, png, gif
- Audio: mp3, wav
- Video: mp4, webm, ogg

### Download Support
- All file types available on Archive.org

## Important Notes

- This application works only on local setup for downloading files
- The live preview site is for demonstration purposes only
- Downloads are stored in the `downloads` directory of your local setup
- Ensure adequate disk space for your downloads

## License

MIT License - Feel free to use and modify

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ by Abdulrehman
