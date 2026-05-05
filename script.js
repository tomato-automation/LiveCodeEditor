// Live Code Editor - Professional Online IDE
// Real-time HTML, CSS, JS editing with live preview

class LiveCodeEditor {
    constructor() {
        this.htmlCode = document.getElementById('htmlCode');
        this.cssCode = document.getElementById('cssCode');
        this.jsCode = document.getElementById('jsCode');
        this.previewFrame = document.getElementById('previewFrame');
        this.lastUpdateSpan = document.getElementById('lastUpdate');
        this.previewOverlay = document.getElementById('previewOverlay');
        this.errorText = document.getElementById('errorText');
        
        this.updateTimeout = null;
        this.isUpdating = false;
        
        // Default templates
        this.defaultTemplates = {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
</head>
<body>
    <div class="container">
        <h1>✨ Welcome to Live Code Editor</h1>
        <p>Edit HTML, CSS, and JavaScript in real-time!</p>
        <button id="clickMe">Click Me!</button>
    </div>
</body>
</html>`,
            
            css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: white;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2rem;
}

p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

button:active {
    transform: translateY(0);
}`,
            
            js: `// Interactive JavaScript
document.getElementById('clickMe')?.addEventListener('click', function() {
    alert('🎉 Hello from Live Code Editor! You can edit me in the JS panel.');
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 200);
});

// Console log
console.log('Live Editor is ready! 🚀');

// Add a cool effect
const container = document.querySelector('.container');
if (container) {
    container.addEventListener('mouseenter', () => {
        container.style.transform = 'scale(1.02)';
        container.style.transition = 'transform 0.3s ease';
    });
    
    container.addEventListener('mouseleave', () => {
        container.style.transform = 'scale(1)';
    });
}`
        };
        
        this.init();
        this.setupEventListeners();
        this.loadDefaultCode();
        this.updatePreview();
    }
    
    init() {
        // Set initial values
        this.updateLastUpdate();
        
        // Add line numbers (simplified)
        this.setupEditorEnhancements();
    }
    
    setupEditorEnhancements() {
        // Auto-resize textareas based on content
        const textareas = [this.htmlCode, this.cssCode, this.jsCode];
        
        textareas.forEach(textarea => {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + 4;
                }
            });
        });
    }
    
    setupEventListeners() {
        // Real-time editing
        const editors = [this.htmlCode, this.cssCode, this.jsCode];
        editors.forEach(editor => {
            editor.addEventListener('input', () => {
                clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => {
                    this.updatePreview();
                }, 300);
            });
        });
        
        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        resetBtn.addEventListener('click', () => this.resetCode());
        
        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.addEventListener('click', () => this.downloadHTML());
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Manual refresh
        const refreshBtn = document.getElementById('refreshPreview');
        refreshBtn.addEventListener('click', () => this.updatePreview(true));
        
        // Open in new tab
        const openNewTab = document.getElementById('openNewTab');
        openNewTab.addEventListener('click', () => this.openInNewTab());
        
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codeType = btn.getAttribute('data-code');
                this.copyCode(codeType);
            });
        });
        
        // Expand/Collapse panels
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = btn.closest('.panel');
                panel.classList.toggle('expanded');
                btn.textContent = panel.classList.contains('expanded') ? '+' : '−';
            });
        });
        
        // Save on Ctrl+S
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.downloadHTML();
            }
        });
    }
    
    updatePreview(force = false) {
        if (this.isUpdating && !force) return;
        
        this.isUpdating = true;
        
        try {
            const html = this.htmlCode.value;
            const css = this.cssCode.value;
            const js = this.jsCode.value;
            
            // Combine everything into one document
            const combinedCode = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>
                        // Error handling for JavaScript
                        window.onerror = function(msg, url, line, col, error) {
                            console.error('Preview Error:', msg);
                            return false;
                        };
                    <\/script>
                    <script>
                        try {
                            ${js}
                        } catch(e) {
                            console.error('JavaScript Error:', e.message);
                            // Display error in preview
                            const errorDiv = document.createElement('div');
                            errorDiv.style.cssText = 'position:fixed;bottom:10px;left:10px;right:10px;background:#ff4444;color:white;padding:10px;border-radius:5px;font-family:monospace;font-size:12px;z-index:10000;';
                            errorDiv.innerHTML = '⚠️ JavaScript Error: ' + e.message;
                            document.body.appendChild(errorDiv);
                            setTimeout(() => errorDiv.remove(), 5000);
                        }
                    <\/script>
                </body>
                </html>
            `;
            
            // Update iframe
            const iframeDoc = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(combinedCode);
            iframeDoc.close();
            
            this.hideError();
            this.updateLastUpdate();
            this.isUpdating = false;
            
        } catch (error) {
            console.error('Preview update error:', error);
            this.showError(error.message);
            this.isUpdating = false;
        }
    }
    
    loadDefaultCode() {
        this.htmlCode.value = this.defaultTemplates.html;
        this.cssCode.value = this.defaultTemplates.css;
        this.jsCode.value = this.defaultTemplates.js;
    }
    
    resetCode() {
        if (confirm('Reset all code to default? This will erase your current work.')) {
            this.loadDefaultCode();
            this.updatePreview();
        }
    }
    
    downloadHTML() {
        const html = this.htmlCode.value;
        const css = this.cssCode.value;
        const js = this.jsCode.value;
        
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported from Live Code Editor</title>
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;
        
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-export-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Downloaded successfully!');
    }
    
    toggleFullscreen() {
        const previewFrame = document.querySelector('.preview-frame-wrapper');
        if (!document.fullscreenElement) {
            previewFrame.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    openInNewTab() {
        const html = this.htmlCode.value;
        const css = this.cssCode.value;
        const js = this.jsCode.value;
        
        const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;
        
        const newWindow = window.open();
        newWindow.document.write(fullHTML);
        newWindow.document.close();
    }
    
    async copyCode(codeType) {
        let code = '';
        switch(codeType) {
            case 'html':
                code = this.htmlCode.value;
                break;
            case 'css':
                code = this.cssCode.value;
                break;
            case 'js':
                code = this.jsCode.value;
                break;
        }
        
        try {
            await navigator.clipboard.writeText(code);
            this.showNotification(`${codeType.toUpperCase()} code copied!`);
        } catch (err) {
            this.showError('Failed to copy');
        }
    }
    
    showError(message) {
        this.errorText.textContent = message;
        this.previewOverlay.style.display = 'flex';
        setTimeout(() => {
            this.previewOverlay.style.display = 'none';
        }, 3000);
    }
    
    hideError() {
        this.previewOverlay.style.display = 'none';
    }
    
    updateLastUpdate() {
        const now = new Date();
        this.lastUpdateSpan.textContent = `Last update: ${now.toLocaleTimeString()}`;
        this.lastUpdateSpan.classList.add('updating');
        setTimeout(() => {
            this.lastUpdateSpan.classList.remove('updating');
        }, 500);
    }
    
    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new LiveCodeEditor();
});

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
