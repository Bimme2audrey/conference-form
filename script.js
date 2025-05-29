let isSubmitAttempted = false;
let hasAvatar = false;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    const dropzone = document.getElementById('dropzone');
    
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

   
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, unhighlight, false);
    });

   
    dropzone.addEventListener('drop', handleDrop, false);
    
    
    dropzone.addEventListener('click', () => {
        console.log('Dropzone clicked');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png';
        input.onchange = (e) => {
            console.log('File selected:', e.target.files[0]);
            const file = e.target.files[0];
            handleFile(file);
        };
        input.click();
    });

    document.querySelectorAll('.error').forEach(error => {
        error.style.display = 'none';
    });


    form.addEventListener('submit', (e) => {
        e.preventDefault();
        isSubmitAttempted = true;
        
        let isValid = true;

      
        form.querySelectorAll('input[required]').forEach(input => {
            const errorElement = input.nextElementSibling;
            if (!input.value.trim()) {
                isValid = false;
                errorElement.style.display = 'flex';
            } else {
                errorElement.style.display = 'none';
            }
        });

        
        const emailInput = form.querySelector('#email');
        const emailError = emailInput.nextElementSibling;
        if (emailInput.value && !isValidEmail(emailInput.value)) {
            isValid = false;
            emailError.style.display = 'flex';
        }

       
        if (!hasAvatar) {
            isValid = false;
            const avatarError = document.getElementById('avatar-error');
            avatarError.textContent = 'Please upload a photo for your avatar.';
            avatarError.style.display = 'flex';
        }

        if (isValid) {
            const formData = {
                fullName: form.querySelector('#fullname').value,
                email: emailInput.value,
                github: form.querySelector('#github').value
            };
            showSuccessPage(formData);
        }
    });

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            if (isSubmitAttempted) {
                const errorElement = input.nextElementSibling;
                if (input.value.trim()) {
                    errorElement.style.display = 'none';
                }
                
                // Special check for email format
                if (input.type === 'email') {
                    errorElement.style.display = isValidEmail(input.value) ? 'none' : 'flex';
                }
            }
        });
    });
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const dropzone = document.getElementById('dropzone');
    dropzone.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    dropzone.style.background = 'rgba(0, 0, 0, 0.5)';
}

function unhighlight(e) {
    const dropzone = document.getElementById('dropzone');
    dropzone.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    dropzone.style.background = 'rgba(0, 0, 0, 0.4)';
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
}

function handleFile(file) {
    console.log('handleFile called with:', file);
    const avatarError = document.getElementById('avatar-error');
    const dropzone = document.getElementById('dropzone');
    
    if (file && file.type.startsWith('image/')) {
        console.log('File is an image');
        if (file.size <= 500 * 1024) { // 500KB
            console.log('File size is acceptable');
            hasAvatar = true;
            avatarError.style.display = 'none';
            
           
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('File read successfully');
                dropzone.innerHTML = `
                    <div class="avatar-container">
                        <img src="${e.target.result}" alt="Avatar preview" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover;">
                        <div class="avatar-actions">
                            <button type="button" class="avatar-btn" onclick="removeImage()">Remove Image</button>
                            <button type="button" class="avatar-btn" onclick="changeImage()">Change Image</button>
                        </div>
                    </div>`;
            };
            reader.onerror = function(e) {
                console.error('Error reading file:', e);
            };
            reader.readAsDataURL(file);
        } else {
            console.log('File too large:', file.size);
            hasAvatar = false;
            avatarError.textContent = 'File too large. Please upload a photo under 500KB.';
            avatarError.style.display = 'flex';
            resetDropzone();
        }
    } else {
        console.log('File is not an image:', file ? file.type : 'no file');
        hasAvatar = false;
        avatarError.textContent = 'Please upload a valid image file (JPG or PNG).';
        avatarError.style.display = 'flex';
        resetDropzone();
    }
}

function resetDropzone() {
    const dropzone = document.getElementById('dropzone');
    dropzone.innerHTML = `
        <img src="assets/images/icon-upload.svg" alt="Upload" class="upload-icon">
        <p>Drag and drop or click to upload</p>
    `;
}

function removeImage() {
    hasAvatar = false;
    resetDropzone();
    if (isSubmitAttempted) {
        const avatarError = document.getElementById('avatar-error');
        avatarError.textContent = 'Please upload a photo for your avatar.';
        avatarError.style.display = 'flex';
    }
}

function changeImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.onchange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };
    input.click();
}

function showSuccessPage(formData) {
    const form = document.querySelector('.form');
    const successContainer = document.querySelector('.success-container');
    
    
    document.querySelector('.user-name').textContent = formData.fullName;
    document.querySelector('.user-email').textContent = formData.email;
    document.querySelector('.attendee-name').textContent = formData.fullName;
    document.querySelector('.github-handle span').textContent = formData.github;
    
    
    const ticketAvatar = document.querySelector('.ticket-avatar');
    const dropzoneImg = document.querySelector('#dropzone img');
    ticketAvatar.src = dropzoneImg.src;

    const ticketNumber = Math.floor(Math.random() * 900000) + 100000;
    document.querySelector('.ticket-number').textContent = `#${ticketNumber}`;
    
    form.style.display = 'none';
    successContainer.style.display = 'flex';
} 