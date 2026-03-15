document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dropzone = document.getElementById('dropzone');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const generateBtn = document.getElementById('generateBtn');
    const humorStyleSelect = document.getElementById('humorStyle');
    const resultsContainer = document.getElementById('resultsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const uploadContent = document.querySelector('.upload-content');
    
    let selectedFile = null;

    // Default Empty State HTML
    const emptyStateHTML = `
        <div class="placeholder-icon"><i class="fa-regular fa-image"></i></div>
        <p>Your hilarious captions will appear here.</p>
    `;

    // --- Validate Form State ---
    function validateForm() {
        if (selectedFile) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    }

    // --- Drag and Drop Logic ---
    
    // Clicking the dropzone triggers the hidden file input
    dropzone.addEventListener('click', (e) => {
        if(e.target !== removeImageBtn && !removeImageBtn.contains(e.target)) {
            imageInput.click();
        }
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropzone.addEventListener(type, (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Handle File processing for preview
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert("Please upload a valid image file (JPG, PNG).");
            return;
        }
        
        selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            removeImageBtn.style.display = 'flex';
            uploadContent.style.opacity = '0'; // Hide text/icon
        };
        reader.readAsDataURL(file);
        
        validateForm();
    }

    // Remove Image
    removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents triggering the file input
        selectedFile = null;
        imageInput.value = '';
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        removeImageBtn.style.display = 'none';
        uploadContent.style.opacity = '1';
        validateForm();
    });

    // --- Generate Api Call ---
    generateBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // UI Updates: Disable button, show loading, clear previous results
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span>Working...</span>';
        loadingIndicator.style.display = 'flex';
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('empty-state');

        // Form Data
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('humor_style', humorStyleSelect.value);

        try {
            // Note: Since everything is served from FastAPI we can use relative path
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Something went wrong on the server');
            }

            // Success: Parse markdown using marked.js
            const htmlContent = marked.parse(data.captions);
            resultsContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error(error);
            resultsContainer.innerHTML = `<div style="color: var(--error);"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${error.message}</div>`;
        } finally {
            // Reset UI
            loadingIndicator.style.display = 'none';
            generateBtn.innerHTML = '<span>Generate Memes</span><i class="fa-solid fa-wand-magic-sparkles"></i>';
            validateForm(); // Re-evaluate if button should be enabled
        }
    });
});
