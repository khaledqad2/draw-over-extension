# DrawOver Chrome Extension

A powerful Chrome extension that lets you draw and annotate on any webpage using Manifest V3.

## ✨ Features

✅ **Modal Overlay** - Opens when clicking extension icon  
✅ **Bottom-Right Position** - Non-intrusive placement  
✅ **Isolated Styles** - Independent from website themes  
✅ **Close Button** - Easy dismissal with X button  
✅ **4 Drawing Tools** - Pencil, Line, Arrow, Rectangle  
✅ **Color Picker** - Choose any stroke color  
✅ **Screenshot** - Capture annotated pages  
✅ **Clear Function** - Remove all drawings  
✅ **Smooth Animations** - Professional UI/UX

## 📁 Project Structure

```
draw-over-extension/
├── manifest.json              # Extension configuration (Manifest V3)
├── background.js              # Service worker
├── content.js                 # Main extension logic
├── modal.css                  # Isolated modal styles
├── icons/                     # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── lib/                       # DrawOver library
    ├── draw-over.bundle.js
    └── draw-over.css
```

## 🚀 Installation

### Step 1: Prepare Your DrawOver Library

From your `draw-over` npm package directory:

```bash
# Build the library
npm run build

# Create extension directory
mkdir -p draw-over-extension/lib
mkdir -p draw-over-extension/icons

# Copy library files
cp dist/draw-over.es.js draw-over-extension/lib/draw-over.bundle.js
cp dist/draw-over.css draw-over-extension/lib/draw-over.css
```

### Step 2: Copy Extension Files

Copy these files to `draw-over-extension/`:

- `manifest.json`
- `background.js`
- `content.js`
- `modal.css`

### Step 3: Create Icons

Create 4 icon sizes (or use placeholders):

**Using ImageMagick (quick method):**

```bash
cd draw-over-extension/icons
convert -size 16x16 xc:#667eea icon16.png
convert -size 48x48 xc:#667eea icon48.png
convert -size 128x128 xc:#667eea icon128.png
```

**Or use an online tool:**

- Visit https://favicon.io/favicon-generator/
- Create and download all sizes

### Step 4: Load Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select your `draw-over-extension/` folder
5. Done! 🎉

## 🎯 How to Use

### Activating the Extension

1. **Click the extension icon** in Chrome toolbar
2. A **modal appears** in the bottom-right corner
3. The modal is fully isolated from the page's styles

### Using the Drawing Tools

#### Start Drawing

- Click the **"Start Drawing"** button
- The button changes to **"Stop Drawing"**
- Draw by clicking and dragging on the page

#### Select Tools

- **✏️ Pencil** - Freehand drawing with smooth curves
- **📏 Line** - Draw straight lines
- **➡️ Arrow** - Draw directional arrows
- **▭ Rectangle** - Draw rectangles and boxes

#### Change Colors

- Use the **color picker** to select stroke color
- Color updates in real-time
- Hex value displayed next to picker

#### Take Screenshot

- Click the **📸 Screenshot** button
- Captures the entire visible area with drawings
- Automatically downloads as PNG

#### Clear Drawings

- Click the **🗑️ Clear** button
- Removes all drawings from the page
- Drawing mode remains active

#### Close Modal

- Click the **X button** in header
- Modal smoothly animates out
- Drawings remain on page
- Click extension icon again to reopen

## 🎨 Features in Detail

### 1. Modal Overlay

- **Position**: Fixed bottom-right (20px from edges)
- **Size**: 320px wide, responsive height
- **Animation**: Smooth fade-in/scale animation
- **Draggable**: No (fixed position for consistency)
- **Z-index**: Maximum (2147483647) - always on top

### 2. Style Isolation

- Uses `all: initial` to reset all styles
- `!important` flags ensure style priority
- Independent from website CSS
- Consistent appearance across all sites
- Custom scrollbar styling

### 3. Drawing Features

- **Smooth curves** for pencil tool
- **Live preview** while drawing
- **Minimum length** checks (no accidental dots)
- **Persistent** until manually cleared
- **High z-index** (2147483646) - below modal

### 4. Screenshot Feature

- Captures **visible tab** using Chrome API
- Includes all drawings
- PNG format with maximum quality
- Automatic download with timestamp
- Filename: `drawover-[timestamp].png`

## 🔧 Customization

### Change Modal Position

Edit `modal.css`:

```css
/* Bottom-left instead of bottom-right */
.drawover-modal {
  bottom: 20px !important;
  left: 20px !important; /* Change from 'right' */
}
```

### Change Modal Size

Edit `modal.css`:

```css
.drawover-modal {
  width: 400px !important; /* Increase width */
}
```

### Change Color Scheme

Edit `modal.css`:

```css
.drawover-modal-header {
  background: linear-gradient(
    135deg,
    #YOUR_COLOR 0%,
    #YOUR_COLOR 100%
  ) !important;
}
```

### Add Keyboard Shortcuts

Add to `manifest.json`:

```json
"commands": {
  "toggle-modal": {
    "suggested_key": {
      "default": "Ctrl+Shift+D",
      "mac": "Command+Shift+D"
    },
    "description": "Toggle DrawOver modal"
  }
}
```

Then add to `background.js`:

```javascript
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-modal") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleModal" });
    });
  }
});
```

## 🐛 Troubleshooting

### Modal doesn't appear

- **Check console**: Press F12, look for errors
- **Verify files**: Ensure all files are in correct locations
- **Reload extension**: Go to `chrome://extensions/`, click reload icon
- **Refresh page**: Reload the webpage after loading extension

### Drawing doesn't work

- **Check library**: Verify `lib/draw-over.bundle.js` exists
- **Check console**: Look for "DrawOver library loaded" message
- **Click Start**: Ensure "Start Drawing" button was clicked
- **Try different tool**: Switch between tools to test

### Screenshot fails

- **Check permissions**: Extension needs `activeTab` permission
- **Try another page**: Some sites block screenshots (banking, etc.)
- **Check downloads**: Look in Chrome's download folder

### Modal looks broken

- **Clear cache**: Hard refresh with Ctrl+Shift+R
- **Check CSS**: Verify `modal.css` is loading
- **Browser console**: Check for CSS errors
- **Website conflict**: Try on a different website

### Styles conflict with page

- **Check isolation**: All styles should have `!important`
- **Increase z-index**: Modal should be maximum z-index
- **Verify all: initial**: Check if reset is applied
- **Report issue**: Some sites may need special handling

## 📦 Building for Production

### 1. Minify Code (Optional)

```bash
# Install terser for JS minification
npm install -g terser

# Minify content.js
terser content.js -c -m -o content.min.js

# Minify background.js
terser background.js -c -m -o background.min.js

# Update manifest.json to use .min.js files
```

### 2. Optimize Icons

```bash
# Install imagemagick
# Optimize PNG files
mogrify -strip -interlace Plane -quality 85 icons/*.png
```

### 3. Create Distribution Package

```bash
cd draw-over-extension
zip -r draw-over-extension.zip . -x "*.DS_Store" -x "__MACOSX/*"
```

### 4. Test Package

1. Remove development version from Chrome
2. Drag and drop ZIP to `chrome://extensions/`
3. Test all features thoroughly
4. Check performance on various websites

## 🚀 Publishing to Chrome Web Store

### Prerequisites

- Google account
- $5 one-time developer fee
- High-quality icons (128x128, 440x280, 1280x800)
- Privacy policy (if collecting data)
- Detailed description

### Steps

1. **Create Developer Account**

   - Visit https://chrome.google.com/webstore/devconsole
   - Pay $5 registration fee
   - Verify your identity

2. **Prepare Store Listing**

   - **Name**: "DrawOver - Web Annotator"
   - **Description**: Detailed explanation of features
   - **Category**: Productivity
   - **Language**: Your target language
   - **Screenshots**: 1280x800 or 640x400 (minimum 1, maximum 5)
   - **Promotional Images**: 440x280 small tile (required)
   - **Icon**: 128x128 (required)

3. **Upload Package**

   - Click "New Item"
   - Upload your .zip file
   - Fill in all required fields
   - Set pricing (free recommended for first version)

4. **Review & Submit**

   - Preview your listing
   - Submit for review
   - Review takes 1-5 business days
   - Address any feedback from Google

5. **Post-Publish**
   - Monitor reviews and ratings
   - Respond to user feedback
   - Release updates as needed
   - Track usage analytics

## 📊 Version Updates

To update your extension:

1. **Update version** in `manifest.json`:

```json
"version": "1.1.0"
```

2. **Build new package**:

```bash
zip -r draw-over-extension-v1.1.0.zip .
```

3. **Upload to Chrome Web Store**:
   - Go to developer console
   - Click on your extension
   - Upload new version
   - Submit for review

## 🎯 Roadmap

### Planned Features

- [ ] More drawing tools (circle, ellipse, polygon)
- [ ] Text tool for annotations
- [ ] Eraser tool
- [ ] Undo/Redo functionality
- [ ] Save/Load drawings
- [ ] Export to PDF
- [ ] Drawing templates
- [ ] Collaborative annotations
- [ ] Cloud sync
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Stroke width selector
- [ ] Fill color option

## 📝 Notes

- **Manifest V3**: Uses latest Chrome extension standard
- **Style Isolation**: `all: initial` + `!important` ensures independence
- **Performance**: Minimal impact on page load
- **Privacy**: No data collection, works offline
- **Compatibility**: Works on all websites (except Chrome Web Store pages)
- **Persistence**: Drawings cleared on page reload
- **Maximum Z-index**: Modal always on top (2147483647)

## 🤝 Contributing

Contributions welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation
- Share usage examples

## 📄 License

MIT License - Free to use and modify

---

**Need Help?** Check browser console (F12) for error messages or create an issue on GitHub.
