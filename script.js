// Global variable to store fetched items for client-side search
let allLostItems = [];

// =====================================================
// IMAGE UPLOAD SYSTEM (Using Rujnak's Firebase)
// =====================================================

// Initialize Rujnak's Firebase for image storage
const rujnakFirebaseConfig = {
    apiKey: "AIzaSyCHjcXg1N6bQlXGMQa8uB7rDjBhEDX0r6s",
    authDomain: "fir-javas-a282c.firebaseapp.com",
    databaseURL: "https://fir-javas-a282c-default-rtdb.firebaseio.com",
    projectId: "fir-javas-a282c",
    storageBucket: "fir-javas-a282c.appspot.com",
    messagingSenderId: "507372768409",
    appId: "1:507372768409:web:3bf174c1d02c5dc13a7c08"
};

// Initialize Rujnak's Firebase app
const rujnakApp = firebase.initializeApp(rujnakFirebaseConfig, 'RujnakApp');
const rujnakStorage = rujnakApp.storage();
const rujnakDatabase = rujnakApp.database();

// Global variables for image upload
let selectedImageFile = null;
let imagePreviewUrl = '';

// =====================================================
// IMAGE UPLOAD FUNCTIONS
// =====================================================

function initializeImageUpload() {
    const selectBtn = document.getElementById('selectImageBtn');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const imageInput = document.getElementById('itemImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (selectBtn && uploadBtn && imageInput && imagePreview) {
        selectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            imageInput.click();
        });
        
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (max 200MB as per Rujnak's system)
                if (file.size > 200 * 1024 * 1024) {
                    alert('File size too large. Maximum size is 200MB.');
                    return;
                }
                
                selectedImageFile = file;
                
                // Create preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreviewUrl = e.target.result;
                    imagePreview.src = imagePreviewUrl;
                    imagePreview.style.display = 'block';
                    
                    // Show upload button
                    uploadBtn.style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        uploadBtn.addEventListener('click', uploadImageToRujnakStorage);
    }
}

function resetUploadUI() {
    const uploadBtn = document.getElementById('uploadImageBtn');
    const progressBar = document.getElementById('uploadProgressBar');
    const progressText = document.getElementById('uploadProgressText');
    
    if (uploadBtn) {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Image';
        uploadBtn.style.backgroundColor = '';
    }
    if (progressBar) {
        progressBar.style.display = 'none';
        progressBar.value = 0;
    }
    if (progressText) {
        progressText.style.display = 'none';
        progressText.textContent = '';
        progressText.className = '';
    }
}

function getImageUrlForDisplay(rujnakImageUrl) {
    if (!rujnakImageUrl) return '';
    return rujnakImageUrl;
}

// =====================================================
// UPDATED REPORT ITEM MODAL WITH IMAGE UPLOAD
// =====================================================

function showReportItemModal(type) {
    const modal = document.getElementById('reportItemModal');
    if (!modal) {
        console.error('Report Item Modal not found');
        return;
    }

    const user = window.auth.currentUser;
    if (!user || !user.emailVerified) {
        alert('You must be signed in and verified to report an item.');
        showSignInModal();
        return;
    }

    const title = document.getElementById('reportItemModalTitle');
    const typeInput = document.getElementById('reportItemType');
    const locationLabel = document.querySelector('label[for="itemLocation"]');
    const dateLabel = document.querySelector('label[for="itemDate"]');
    const form = document.getElementById('reportItemForm');

    if (type === 'lost') {
        title.textContent = 'Report a Lost Item';
        locationLabel.textContent = 'Last Seen Location';
        dateLabel.textContent = 'Date Lost';
    } else {
        title.textContent = 'Report a Found Item';
        locationLabel.textContent = 'Location Found';
        dateLabel.textContent = 'Date Found';
    }

    typeInput.value = type;
    form.reset();
    
    // Reset image upload UI
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }
    document.getElementById('uploadProgressBar').style.display = 'none';
    document.getElementById('uploadProgressText').style.display = 'none';
    const uploadBtn = document.getElementById('uploadImageBtn');
    if (uploadBtn) {
        uploadBtn.style.display = 'none';
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Image';
        uploadBtn.style.backgroundColor = '';
    }
    
    selectedImageFile = null;
    imagePreviewUrl = '';
    window.currentImageUrl = '';
    
    document.getElementById('reportItemMessage').textContent = '';
    document.getElementById('reportItemMessage').className = 'auth-message';
    modal.style.display = 'block';
}

async function uploadImageToRujnakStorage() {
    if (!selectedImageFile) {
        alert('Please select an image first.');
        return;
    }
    
    const uploadBtn = document.getElementById('uploadImageBtn');
    const progressBar = document.getElementById('uploadProgressBar');
    const progressText = document.getElementById('uploadProgressText');
    
    // Get item name for filename - FIXED: Remove all invalid characters
    const itemName = document.getElementById('itemName')?.value || 'unknown_item';
    
    // Properly sanitize filename for Firebase Storage
    const safeItemName = itemName
        .replace(/[^a-zA-Z0-9]/g, '_')  // Replace non-alphanumeric with underscore
        .replace(/\./g, '_')            // Explicitly replace periods
        .replace(/#/g, '_')             // Replace #
        .replace(/\$/g, '_')            // Replace $
        .replace(/\[/g, '_')            // Replace [
        .replace(/\]/g, '_');           // Replace ]
    
    const fileExtension = selectedImageFile.name.split('.').pop();
    
    // Create filename in Rujnak's format: Name + Extension
    const fileName = `${safeItemName}.${fileExtension}`;
    
    try {
        // Show progress
        if (progressBar) {
            progressBar.style.display = 'block';
            progressBar.value = 0;
        }
        if (progressText) {
            progressText.style.display = 'block';
            progressText.textContent = 'Uploading: 0%';
        }
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading...';
        }
        
        // Upload to Rujnak's Storage - FIXED PATH
        const storageRef = rujnakStorage.ref('Files/' + fileName);
        const uploadTask = storageRef.put(selectedImageFile);
        
        // Monitor upload progress
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progressBar) progressBar.value = progress;
                if (progressText) progressText.textContent = `Uploading: ${Math.round(progress)}%`;
            },
            (error) => {
                console.error('Upload error:', error);
                alert('Error uploading image. Please try again.');
                resetUploadUI();
            },
            async () => {
                // Upload completed successfully
                try {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    
                    // Store the URL for form submission
                    window.currentImageUrl = downloadURL;
                    
                    // Update UI
                    if (progressText) {
                        progressText.textContent = 'Upload complete!';
                        progressText.className = 'upload-success';
                    }
                    if (uploadBtn) {
                        uploadBtn.textContent = 'Uploaded ✓';
                        uploadBtn.style.backgroundColor = 'var(--success)';
                    }
                    
                    console.log('Image uploaded successfully:', downloadURL);
                    
                } catch (error) {
                    console.error('Error getting download URL:', error);
                    alert('Upload completed but failed to get URL. Please try again.');
                    resetUploadUI();
                }
            }
        );
        
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
        resetUploadUI();
    }
}

// =====================================================
// UPDATED REPORT SUBMISSION WITH IMAGE SUPPORT
// =====================================================

document.getElementById('reportItemForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = window.auth.currentUser;
    if (!user) { 
        alert('You must be signed in.'); 
        return; 
    }

    const submitBtn = this.querySelector('.auth-submit-btn');
    const messageDiv = document.getElementById('reportItemMessage');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        // Check if image was uploaded
        let imageUrl = window.currentImageUrl || '';
        
        if (!imageUrl && selectedImageFile) {
            messageDiv.textContent = 'Please complete image upload before submitting.';
            messageDiv.className = 'auth-message error';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Report';
            return;
        }

        // Prepare item data for Your Firebase (findmyaclc)
        const itemData = {
            name: document.getElementById('itemName').value,
            description: document.getElementById('itemDescription').value,
            category: document.getElementById('itemCategory').value,
            location: document.getElementById('itemLocation').value,
            date: Timestamp.fromDate(new Date(document.getElementById('itemDate').value)),
            type: document.getElementById('reportItemType').value,
            imageUrl: imageUrl, // This is from Rujnak's storage
            status: 'active',
            reportedBy: user.uid,
            reportedAt: Timestamp.now(),
            // Additional metadata
            hasImage: !!imageUrl,
            imageStorage: imageUrl ? 'rujnak_firebase' : 'none'
        };

        // Save to Your Firebase (findmyaclc)
        await addDoc(collection(window.db, 'items'), itemData);

        messageDiv.textContent = 'Report submitted successfully!' + (imageUrl ? ' (Image included)' : '');
        messageDiv.className = 'auth-message success';
        
        // Refresh dashboard
        await loadStudentDashboard();
        
        setTimeout(() => { 
            document.getElementById('reportItemModal').style.display = 'none'; 
            this.reset();
            resetUploadUI();
        }, 1500);

    } catch (error) {
        console.error('Error submitting report:', error);
        messageDiv.textContent = 'Failed to submit report. Please try again.';
        messageDiv.className = 'auth-message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
    }
});

// =====================================================
// UPDATED ITEM DISPLAY WITH SQUARE IMAGE SUPPORT
// =====================================================

function updateItemsList(listId, items, isSearchResult = false) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;
    
    if (items.length === 0) {
        listElement.innerHTML = isSearchResult 
            ? '<div class="no-items">No items match your search.</div>' 
            : '<div class="no-items">No items found.</div>';
        return;
    }
    
    listElement.innerHTML = items.map(item => `
        <div class="item-card" data-testid="card-item-${item.id}">
            <div class="item-header" data-testid="header-item-${item.id}">
                <h4 data-testid="heading-item-${item.id}">${item.name || 'Unknown Item'}</h4>
                <span class="item-status ${item.type || 'lost'}" data-testid="status-item-${item.id}">${item.type || 'lost'}</span>
            </div>
            
            ${item.imageUrl ? `
                <div class="item-image-container">
                    <img src="${getImageUrlForDisplay(item.imageUrl)}" 
                         alt="${item.name}" 
                         class="item-image"
                         data-testid="image-item-${item.id}" />
                </div>
            ` : ''}
            
            <p class="item-description" data-testid="description-item-${item.id}">${item.description || 'No description available'}</p>
            <div class="item-details" data-testid="details-item-${item.id}">
                <span class="item-location" data-testid="location-item-${item.id}">📍 ${item.location || 'Unknown location'}</span>
                <span class="item-date" data-testid="date-item-${item.id}">📅 ${item.date ? new Date(item.date.toDate ? item.date.toDate() : item.date).toLocaleDateString() : 'Unknown date'}</span>
            </div>
            <div class="item-actions" data-testid="actions-item-${item.id}">
                <button class="action-btn claim-btn" onclick="claimItem('${item.id}')" data-testid="button-claim-${item.id}">Claim</button>
                <button class="action-btn details-btn" onclick="viewItemDetails('${item.id}')" data-testid="button-details-${item.id}">Details</button>
            </div>
        </div>
    `).join('');
}

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM loaded - initializing systems');
    
    // Initialize the image upload system
    initializeImageUpload();
    
    // ... rest of your existing initialization code ...

    // [YOUR EXISTING DOM CONTENT LOADED CODE CONTINUES HERE...]
    console.log('DOM loaded - initializing event listeners');

    document.getElementById("signInFormElement")?.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const email = document.getElementById("signInEmail").value.trim();
        const password = document.getElementById("signInPassword").value;
        const messageDiv = document.getElementById("authMessage");
        const submitBtn = this.querySelector(".auth-submit-btn");
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = "Signing In...";
        submitBtn.disabled = true;
        messageDiv.textContent = "";
        
        try {
            const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                messageDiv.innerHTML = `<strong>Email not verified!</strong><br>Please verify your email before signing in.`;
                messageDiv.className = "auth-message error";
                await signOut(window.auth);
                window.showVerificationReminder(user);
                return;
            }
            
            messageDiv.textContent = "Sign in successful!";
            messageDiv.className = "auth-message success";
            
            setTimeout(() => {
                document.getElementById("authModal").style.display = "none";
                this.reset();
            }, 1000);
            
        } catch (error) {
            messageDiv.textContent = getAuthErrorMessage(error.code);
            messageDiv.className = "auth-message error";
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // [CONTINUE WITH ALL YOUR OTHER EXISTING EVENT LISTENERS...]
    document.getElementById("signUpEmail")?.addEventListener("input", async function() {
        // Logic for checking email availability
    });

    document.getElementById("signUpUsername")?.addEventListener("input", async function() {
        // Logic for checking username availability
    });

    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    userTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const studentIdGroup = document.getElementById('studentIdGroup');
            const staffIdGroup = document.getElementById('staffIdGroup');
            
            if (this.value === 'student') {
                studentIdGroup.style.display = 'block';
                staffIdGroup.style.display = 'none';
                document.getElementById('studentId').required = true;
                document.getElementById('staffId').required = false;
            } else if (this.value === 'staff') {
                studentIdGroup.style.display = 'none';
                staffIdGroup.style.display = 'block';
                document.getElementById('studentId').required = false;
                document.getElementById('staffId').required = true;
            }
        });
    });

    document.getElementById("forgotPasswordLink")?.addEventListener("click", (e) => { e.preventDefault(); showForgotPasswordModal(); });
    document.getElementById("backToSignIn")?.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("forgotPasswordModal").style.display = "none"; showSignInModal(); });
    document.getElementById("forgotPasswordModal")?.querySelector(".close-modal")?.addEventListener("click", () => { document.getElementById("forgotPasswordModal").style.display = "none"; });

    document.getElementById("forgotPasswordForm")?.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("resetEmail").value;
        const messageDiv = document.getElementById("forgotPasswordMessage");
        const submitBtn = this.querySelector(".auth-submit-btn");
        submitBtn.disabled = true;
        sendPasswordResetEmail(window.auth, email).then(() => {
            messageDiv.innerHTML = `Password reset email sent to <strong>${email}</strong>.`;
            messageDiv.className = "auth-message success";
            setTimeout(() => { document.getElementById("forgotPasswordModal").style.display = "none"; this.reset(); }, 3000);
        }).catch((error) => {
            messageDiv.textContent = getPasswordResetErrorMessage(error.code);
            messageDiv.className = "auth-message error";
        }).finally(() => { submitBtn.disabled = false; });
    });

    initializePasswordToggles();

    document.getElementById("signUpPassword")?.addEventListener("input", () => { updatePasswordStrength(); checkPasswordMatch(); });
    document.getElementById("confirmPassword")?.addEventListener("input", checkPasswordMatch);
    document.getElementById("signUpFormElement")?.addEventListener("reset", () => { setTimeout(() => { updatePasswordStrength(); checkPasswordMatch(); }, 0); });

    document.querySelector("#authModal .close-modal")?.addEventListener("click", () => { document.getElementById("authModal").style.display = "none"; });
    document.getElementById("switchToSignUp")?.addEventListener("click", (e) => { e.preventDefault(); showSignUpModal(); });
    document.getElementById("switchToSignIn")?.addEventListener("click", (e) => { e.preventDefault(); showSignInModal(); });

    window.addEventListener("click", function (event) {
        const authModal = document.getElementById("authModal");
        const forgotModal = document.getElementById("forgotPasswordModal");
        const reportModal = document.getElementById('reportItemModal');
        if (event.target === authModal) authModal.style.display = "none";
        if (event.target === forgotModal) forgotModal.style.display = "none";
        if (event.target === reportModal) reportModal.style.display = "none";
    });

    document.querySelector(".sign-in-btn")?.addEventListener("click", showSignInModal);
    document.querySelector(".sign-up-btn")?.addEventListener("click", showSignUpModal);

    document.getElementById("signUpFormElement")?.addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("signUpUsername").value.trim();
        const userType = document.querySelector('input[name="userType"]:checked');
        const studentId = document.getElementById("studentId").value.trim();
        const staffId = document.getElementById("staffId").value.trim();
        const email = document.getElementById("signUpEmail").value;
        const password = document.getElementById("signUpPassword").value;
        const messageDiv = document.getElementById("authMessage");
        
        // Simplified validation (full validation logic is assumed)
        if (password.length < 6 || !userType) {
            messageDiv.textContent = "Please fill all required fields correctly.";
            messageDiv.className = "auth-message error";
            return;
        }
        
        const submitBtn = this.querySelector(".auth-submit-btn");
        submitBtn.disabled = true;

        try {
            const duplicateCheck = await checkForDuplicateUser(username, userType.value, studentId, staffId, email);
            if (duplicateCheck.exists) {
                messageDiv.textContent = duplicateCheck.message;
                messageDiv.className = "auth-message error";
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(window.db, "users", user.uid), {
                username, email, userType: userType.value,
                studentId: userType.value === "student" ? studentId : null,
                staffId: userType.value === "staff" ? staffId : null,
                createdAt: new Date(), emailVerified: false
            });

            await sendEmailVerification(user);
            messageDiv.innerHTML = `<strong>Account created!</strong><br>Verification email sent to <strong>${email}</strong>.`;
            messageDiv.className = "auth-message success";
            setTimeout(() => { document.getElementById("authModal").style.display = "none"; window.showVerificationReminder(user); }, 2000);

        } catch (error) {
            messageDiv.textContent = getAuthErrorMessage(error.code);
            messageDiv.className = "auth-message error";
        } finally {
            submitBtn.disabled = false;
        }
    });

    const reportModal = document.getElementById('reportItemModal');
    if (reportModal) {
        reportModal.querySelector('.close-modal').addEventListener('click', () => { reportModal.style.display = 'none'; });
    }

    document.getElementById('studentSearchInput')?.addEventListener('keyup', () => searchItems('student'));

    console.log('Event listeners initialized successfully');
    
    // Initialize chatbot
    initializeChatbot();
});

// [REST OF YOUR EXISTING FUNCTIONS...]

// Auth Modal Functions
function showSignInModal() {
    console.log('showSignInModal called');
    const modal = document.getElementById("authModal");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");

    if (modal && signInForm && signUpForm) {
        signInForm.style.display = "block";
        signUpForm.style.display = "none";
        modal.style.display = "block";
        document.getElementById("authMessage").textContent = "";
    } else {
        console.error('Modal elements not found');
    }
}

function showSignUpModal() {
    console.log('showSignUpModal called');
    const modal = document.getElementById("authModal");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");

    if (modal && signInForm && signUpForm) {
        signInForm.style.display = "none";
        signUpForm.style.display = "block";
        modal.style.display = "block";
        document.getElementById("authMessage").textContent = "";
    } else {
        console.error('Modal elements not found');
    }
}

function showForgotPasswordModal() {
    const authModal = document.getElementById("authModal");
    const forgotModal = document.getElementById("forgotPasswordModal");
    
    authModal.style.display = "none";
    forgotModal.style.display = "block";
    document.getElementById("forgotPasswordMessage").textContent = "";
}

// =====================================================
// AI CLAIM VERIFICATION SYSTEM
// =====================================================

let currentClaimItem = null;
let claimConversationHistory = [];
let isClaimVerificationActive = false;

// Initialize claim verification system
function initializeClaimVerification() {
    const claimModal = document.getElementById('claimVerificationModal');
    const closeBtn = claimModal.querySelector('.close-modal');
    const sendBtn = document.getElementById('claimSendBtn');
    const userInput = document.getElementById('claimUserInput');
    const downloadBtn = document.getElementById('downloadYmlBtn');

    closeBtn.addEventListener('click', closeClaimModal);
    sendBtn.addEventListener('click', handleClaimResponse);
    downloadBtn.addEventListener('click', downloadClaimVerificationLog);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleClaimResponse();
        }
    });

    claimModal.addEventListener('click', (e) => {
        if (e.target === claimModal) {
            closeClaimModal();
        }
    });
}

// Show claim verification modal
async function startClaimVerification(itemId) {
    const user = window.auth.currentUser;
    if (!user) {
        alert('You must be signed in to claim an item.');
        showSignInModal();
        return;
    }

    try {
        // Get item data from Firestore
        const itemDoc = await getDoc(doc(window.db, "items", itemId));
        if (!itemDoc.exists()) {
            alert('Item not found.');
            return;
        }

        currentClaimItem = { id: itemId, ...itemDoc.data() };
        claimConversationHistory = [];
        isClaimVerificationActive = true;

        // Show modal
        const modal = document.getElementById('claimVerificationModal');
        modal.style.display = 'block';

        // Reset UI
        document.getElementById('claimChatContainer').innerHTML = '';
        document.getElementById('claimMessage').textContent = '';
        document.getElementById('claimMessage').className = 'auth-message';
        document.getElementById('downloadSection').style.display = 'none';
        document.getElementById('verificationProgressText').textContent = 'Verification: 0%';
        document.getElementById('verificationProgressBar').style.width = '0%';
        document.querySelector('.verification-progress').style.display = 'block';

        // Start AI verification
        await startAIVerification();

    } catch (error) {
        console.error('Error starting claim verification:', error);
        alert('Failed to start verification process.');
    }
}

// Start AI verification process
async function startAIVerification() {
    if (!currentClaimItem) return;

    const user = window.auth.currentUser;
    let userData = null;
    
    try {
        const userDoc = await getDoc(doc(window.db, "users", user.uid));
        if (userDoc.exists()) {
            userData = userDoc.data();
        }
    } catch (error) {
        console.warn("Could not fetch user data for AI verification:", error);
    }

    // Prepare system message for AI
    const systemMessage = `You are an AI verification assistant for a lost and found system. Your task is to verify if the user is the legitimate owner of a lost item.

ITEM INFORMATION:
- Name: ${currentClaimItem.name}
- Description: ${currentClaimItem.description}
- Category: ${currentClaimItem.category}
- Location: ${currentClaimItem.location}
- Date: ${currentClaimItem.date?.toDate ? currentClaimItem.date.toDate().toLocaleDateString() : currentClaimItem.date}
- Type: ${currentClaimItem.type}

USER INFORMATION:
- Name: ${userData?.username || 'Unknown'}
- User Type: ${userData?.userType || 'Unknown'}

VERIFICATION PROCESS:
1. Analyze the item details and determine what specific questions to ask
2. Ask 2-4 targeted questions that only the real owner would know
3. Focus on unique identifying features, contents, or specific circumstances
4. Make questions natural and conversational
5. After asking questions, provide a verification score and recommendation

RESPONSE FORMAT:
Return JSON with:
{
    "questions": ["question1", "question2", ...],
    "analysis": "brief analysis of what to verify",
    "nextStep": "start_verification"
}

Keep questions specific to this particular item.`;

    try {
        showTypingIndicator(true);
        
        const response = await fetch('https://findmyaclc.skysalvador2004.workers.dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: systemMessage,
                user: {
                    uid: user.uid,
                    type: userData?.userType || 'student',
                    name: userData?.username || user.email.split('@')[0]
                },
                history: []
            })
        });

        if (!response.ok) {
            throw new Error(`AI service responded with status: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.response || "{}";
        
        let verificationPlan;
        try {
            verificationPlan = JSON.parse(aiResponse);
        } catch (e) {
            // If JSON parsing fails, create a default verification plan
            verificationPlan = {
                questions: [
                    "Can you describe the specific color and any unique features of this item?",
                    "Where exactly did you last see or lose this item?",
                    "Are there any specific contents or identifying marks that would prove ownership?"
                ],
                analysis: "Standard verification questions based on item description",
                nextStep: "start_verification"
            };
        }

        // Store verification plan
        window.verificationPlan = verificationPlan;
        
        // Add welcome message
        addClaimMessage(`Hello! I'm your verification assistant. I need to ask you a few questions to verify you're the legitimate owner of the "${currentClaimItem.name}".`, 'ai');
        
        // Start asking questions
        await askNextVerificationQuestion(0);

    } catch (error) {
        console.error('AI verification error:', error);
        addClaimMessage("I'm having trouble starting the verification process. Please try again later.", 'ai');
    } finally {
        showTypingIndicator(false);
    }
}

// Ask verification questions
async function askNextVerificationQuestion(questionIndex) {
    if (!window.verificationPlan || !window.verificationPlan.questions) {
        addClaimMessage("Verification process configuration error. Please try again.", 'ai');
        return;
    }

    const questions = window.verificationPlan.questions;
    
    if (questionIndex < questions.length) {
        // Update progress
        const progress = ((questionIndex) / questions.length) * 100;
        updateVerificationProgress(progress);
        
        // Ask question
        setTimeout(() => {
            addClaimMessage(questions[questionIndex], 'ai');
            window.currentQuestionIndex = questionIndex;
        }, 1000);
    } else {
        // All questions asked, evaluate responses
        await evaluateVerificationResponses();
    }
}

// Handle user response
async function handleClaimResponse() {
    if (!isClaimVerificationActive) return;

    const userInput = document.getElementById('claimUserInput');
    const message = userInput.value.trim();
    
    if (!message) return;

    // Add user message to chat
    addClaimMessage(message, 'user');
    userInput.value = '';
    
    // Store response
    if (!window.verificationResponses) {
        window.verificationResponses = [];
    }
    window.verificationResponses.push({
        questionIndex: window.currentQuestionIndex,
        response: message
    });

    // Disable input while processing
    document.getElementById('claimSendBtn').disabled = true;
    userInput.disabled = true;
    
    showTypingIndicator(true);

    // Process response and ask next question
    setTimeout(async () => {
        showTypingIndicator(false);
        document.getElementById('claimSendBtn').disabled = false;
        userInput.disabled = false;
        userInput.focus();

        await askNextVerificationQuestion(window.currentQuestionIndex + 1);
    }, 1500);
}

// Evaluate all responses and provide verification result
async function evaluateVerificationResponses() {
    if (!window.verificationResponses || !currentClaimItem) return;

    const user = window.auth.currentUser;
    let userData = null;
    
    try {
        const userDoc = await getDoc(doc(window.db, "users", user.uid));
        if (userDoc.exists()) {
            userData = userDoc.data();
        }
    } catch (error) {
        console.warn("Could not fetch user data for evaluation:", error);
    }

    // Prepare evaluation request for AI
    const evaluationData = {
        item: currentClaimItem,
        questions: window.verificationPlan.questions,
        responses: window.verificationResponses,
        user: userData
    };

    const systemMessage = `Evaluate the user's verification responses and provide a confidence score.

EVALUATION DATA:
${JSON.stringify(evaluationData, null, 2)}

ANALYSIS REQUIREMENTS:
1. Score each response based on accuracy and specificity (0-10)
2. Calculate overall confidence percentage (0-100%)
3. Provide brief analysis of each response
4. Recommend whether to approve or review manually

RESPONSE FORMAT:
{
    "score": 85,
    "analysis": "Overall analysis of responses...",
    "recommendation": "approve|review|reject",
    "breakdown": [
        {"question": "Q1", "response": "R1", "score": 8, "analysis": "Analysis..."}
    ]
}`;

    try {
        showTypingIndicator(true);
        
        const response = await fetch('https://findmyaclc.skysalvador2004.workers.dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: systemMessage,
                user: {
                    uid: user.uid,
                    type: userData?.userType || 'student',
                    name: userData?.username || user.email.split('@')[0]
                },
                history: []
            })
        });

        if (!response.ok) {
            throw new Error(`AI service responded with status: ${response.status}`);
        }

        const data = await response.json();
        const aiEvaluation = JSON.parse(data.response || '{"score": 50, "recommendation": "review", "analysis": "Unable to complete evaluation."}');

        // Show evaluation results
        showVerificationResults(aiEvaluation);

    } catch (error) {
        console.error('Evaluation error:', error);
        showVerificationResults({
            score: 50,
            recommendation: 'review',
            analysis: 'Evaluation service unavailable. Submitted for manual review.'
        });
    } finally {
        showTypingIndicator(false);
    }
}

// Show verification results and submit claim
async function showVerificationResults(evaluation) {
    // Update progress to 100%
    updateVerificationProgress(100);

    // Show score
    const scoreHtml = `
        <div class="verification-score">
            <div class="score-value">${evaluation.score}%</div>
            <div class="score-label">Confidence Score</div>
        </div>
    `;
    addClaimMessage(scoreHtml, 'ai', false);

    // Show analysis
    addClaimMessage(`Analysis: ${evaluation.analysis}`, 'ai');

    // Show recommendation and next steps
    let recommendationMessage = '';
    if (evaluation.recommendation === 'approve') {
        recommendationMessage = "Based on your responses, I'm confident you're the legitimate owner. Submitting your claim...";
    } else {
        recommendationMessage = "Your claim has been submitted for staff review. We'll contact you once it's processed.";
    }

    addClaimMessage(recommendationMessage, 'ai');

    // Submit claim to Firestore
    await submitClaimToFirestore(evaluation);

    // Show download option
    document.getElementById('downloadSection').style.display = 'block';
}

// Submit claim to Firestore
async function submitClaimToFirestore(evaluation) {
    try {
        const user = window.auth.currentUser;
        const userDoc = await getDoc(doc(window.db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const claimData = {
            itemId: currentClaimItem.id,
            itemName: currentClaimItem.name,
            itemDescription: currentClaimItem.description,
            itemImageUrl: currentClaimItem.imageUrl,
            claimedBy: user.uid,
            claimedByName: userData.username || user.email.split('@')[0],
            claimedByEmail: user.email,
            claimedAt: Timestamp.now(),
            status: 'pending',
            itemType: currentClaimItem.type,
            verificationScore: evaluation.score,
            aiRecommendation: evaluation.recommendation,
            verificationLog: claimConversationHistory,
            responses: window.verificationResponses || []
        };

        await addDoc(collection(window.db, "claims"), claimData);
        
        // Update UI
        document.getElementById('claimMessage').textContent = 'Claim submitted successfully!';
        document.getElementById('claimMessage').className = 'auth-message success';

        // Refresh dashboard
        setTimeout(() => {
            loadStudentDashboard();
        }, 2000);

    } catch (error) {
        console.error('Error submitting claim:', error);
        document.getElementById('claimMessage').textContent = 'Error submitting claim. Please try again.';
        document.getElementById('claimMessage').className = 'auth-message error';
    }
}

// UI Helper Functions
function addClaimMessage(text, sender, isText = true) {
    const container = document.getElementById('claimChatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `claim-message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'claim-message-content';
    
    if (isText) {
        contentDiv.textContent = text;
    } else {
        contentDiv.innerHTML = text;
    }
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'claim-message-time';
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    // Add to conversation history
    claimConversationHistory.push({
        role: sender,
        message: isText ? text : 'Score display',
        timestamp: new Date().toISOString(),
        isHtml: !isText
    });
}

function showTypingIndicator(show) {
    const indicator = document.getElementById('claimTypingIndicator');
    indicator.style.display = show ? 'flex' : 'none';
}

function updateVerificationProgress(percent) {
    const progressBar = document.getElementById('verificationProgressBar');
    const progressText = document.getElementById('verificationProgressText');
    
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `Verification: ${Math.round(percent)}%`;
}

function closeClaimModal() {
    const modal = document.getElementById('claimVerificationModal');
    modal.style.display = 'none';
    isClaimVerificationActive = false;
    currentClaimItem = null;
    claimConversationHistory = [];
}

// Download verification log
function downloadClaimVerificationLog() {
    const logData = {
        item: currentClaimItem,
        conversation: claimConversationHistory,
        verification: window.verificationPlan,
        responses: window.verificationResponses || [],
        timestamp: new Date().toISOString()
    };

    const ymlContent = generateVerificationYML(logData);
    const blob = new Blob([ymlContent], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `claim_verification_${currentClaimItem.id}_${new Date().toISOString().split('T')[0]}.yml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateVerificationYML(logData) {
    return `# AI Claim Verification Log
# Item: ${logData.item.name}
# Claim Date: ${logData.timestamp}
# Verification ID: ${logData.item.id}

conversation:
${logData.conversation.map(entry => `  - role: ${entry.role}
    message: "${entry.message.replace(/"/g, '\\"')}"
    timestamp: ${entry.timestamp}
    type: ${entry.isHtml ? 'html' : 'text'}`).join('\n')}

verification_questions:
${(logData.verification?.questions || []).map((question, index) => `  - question_${index + 1}: "${question.replace(/"/g, '\\"')}"`).join('\n')}

user_responses:
${(logData.responses || []).map((response, index) => `  - response_${index + 1}:
      question_index: ${response.questionIndex}
      response: "${response.response.replace(/"/g, '\\"')}"`).join('\n')}

item_details:
  name: "${logData.item.name}"
  description: "${logData.item.description}"
  category: "${logData.item.category}"
  location: "${logData.item.location}"
  date: "${logData.item.date}"
  type: "${logData.item.type}"

summary:
  total_questions: ${logData.verification?.questions?.length || 0}
  total_responses: ${logData.responses?.length || 0}
  status: "completed"`;
}

// Update the existing claimItem function to use AI verification
function claimItem(itemId) {
    startClaimVerification(itemId);
}

// Initialize claim verification when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeClaimVerification();
});

function initializePasswordToggles() {
    const signUpPasswordInput = document.getElementById('signUpPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signInPasswordInput = document.getElementById('signInPassword');
    
    if (signUpPasswordInput && !signUpPasswordInput.parentElement.classList.contains('password-input-wrapper')) {
        const signUpWrapper = document.createElement('div');
        signUpWrapper.className = 'password-input-wrapper';
        signUpPasswordInput.parentNode.insertBefore(signUpWrapper, signUpPasswordInput);
        signUpWrapper.appendChild(signUpPasswordInput);
        
        const signUpToggle = document.createElement('button');
        signUpToggle.type = 'button';
        signUpToggle.className = 'password-toggle';
        signUpToggle.textContent = 'Show';
        signUpToggle.setAttribute('aria-label', 'Show password');
        signUpWrapper.appendChild(signUpToggle);
        
        signUpToggle.addEventListener('click', function() {
            const type = signUpPasswordInput.type === 'password' ? 'text' : 'password';
            signUpPasswordInput.type = type;
            this.textContent = type === 'password' ? 'Show' : 'Hide';
            this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
        });
    }
    
    if (confirmPasswordInput && !confirmPasswordInput.parentElement.classList.contains('password-input-wrapper')) {
        const confirmWrapper = document.createElement('div');
        confirmWrapper.className = 'password-input-wrapper';
        confirmPasswordInput.parentNode.insertBefore(confirmWrapper, confirmPasswordInput);
        confirmWrapper.appendChild(confirmPasswordInput);
        
        const confirmToggle = document.createElement('button');
        confirmToggle.type = 'button';
        confirmToggle.className = 'password-toggle';
        confirmToggle.textContent = 'Show';
        confirmToggle.setAttribute('aria-label', 'Show password');
        confirmWrapper.appendChild(confirmToggle);
        
        confirmToggle.addEventListener('click', function() {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;
            this.textContent = type === 'password' ? 'Show' : 'Hide';
            this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
        });
    }
    
    if (signInPasswordInput && !signInPasswordInput.parentElement.classList.contains('password-input-wrapper')) {
        const signInWrapper = document.createElement('div');
        signInWrapper.className = 'password-input-wrapper';
        signInPasswordInput.parentNode.insertBefore(signInWrapper, signInPasswordInput);
        signInWrapper.appendChild(signInPasswordInput);
        
        const signInToggle = document.createElement('button');
        signInToggle.type = 'button';
        signInToggle.className = 'password-toggle';
        signInToggle.textContent = 'Show';
        signInToggle.setAttribute('aria-label', 'Show password');
        signInWrapper.appendChild(signInToggle);
        
        signInToggle.addEventListener('click', function() {
            const type = signInPasswordInput.type === 'password' ? 'text' : 'password';
            signInPasswordInput.type = type;
            this.textContent = type === 'password' ? 'Show' : 'Hide';
            this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
        });
    }
}

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    let strengthText, strengthClass;
    
    if (strength <= 2) {
        strengthText = "Weak";
        strengthClass = "weak";
    } else if (strength <= 4) {
        strengthText = "Fair";
        strengthClass = "fair";
    } else {
        strengthText = "Strong";
        strengthClass = "strong";
    }
    
    return { text: strengthText, class: strengthClass };
}

function updatePasswordStrength() {
    const password = document.getElementById("signUpPassword").value;
    const strengthResult = checkPasswordStrength(password);
    const strengthBar = document.querySelector(".strength-bar");
    const strengthMessage = document.getElementById("strengthMessage");
    
    strengthBar.className = "strength-bar";
    
    if (password.length > 0) {
        strengthBar.classList.add(strengthResult.class);
        strengthMessage.textContent = strengthResult.text;
        strengthMessage.style.color = strengthResult.class === "weak" ? "var(--error)" : 
                                    strengthResult.class === "fair" ? "var(--warning)" : "var(--success)";
    } else {
        strengthMessage.textContent = "Weak";
        strengthMessage.style.color = "var(--text-tertiary)";
    }
}

function checkPasswordMatch() {
    const password = document.getElementById("signUpPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const matchMessage = document.getElementById("matchMessage");
    
    if (confirmPassword.length === 0) {
        matchMessage.textContent = "";
        matchMessage.className = "password-match";
    } else if (password === confirmPassword) {
        matchMessage.textContent = "Passwords match";
        matchMessage.className = "password-match match";
    } else {
        matchMessage.textContent = "Passwords do not match";
        matchMessage.className = "password-match mismatch";
    }
}

function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found': return "No account found with this email address.";
        case 'auth/wrong-password': return "Incorrect password. Please try again.";
        case 'auth/invalid-email': return "Invalid email address format.";
        case 'auth/user-disabled': return "This account has been disabled.";
        case 'auth/too-many-requests': return "Too many failed login attempts. Please try again later.";
        case 'auth/email-already-in-use': return "This email is already registered. Please sign in.";
        case 'auth/weak-password': return "Password is too weak. Please use at least 6 characters.";
        case 'auth/network-request-failed': return "Network error. Please check your internet connection.";
        case 'auth/invalid-credential': return "Invalid email or password.";
        default: return `Error: ${errorCode}`;
    }
}

function getPasswordResetErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email': return "Invalid email address format.";
        case 'auth/user-not-found': return "No account found with this email address.";
        case 'auth/too-many-requests': return "Too many requests. Please try again later.";
        default: return `Error: ${errorCode}`;
    }
}

async function checkForDuplicateUser(username, userType, studentId, staffId, email) {
    try {
        const usersRef = collection(window.db, "users");
        
        const emailQuery = query(usersRef, where("email", "==", email));
        if (!(await getDocs(emailQuery)).empty) {
            return { exists: true, message: "This email is already registered." };
        }

        const usernameQuery = query(usersRef, where("username", "==", username));
        if (!(await getDocs(usernameQuery)).empty) {
            return { exists: true, message: "This username is already taken." };
        }

        if (userType === "student" && studentId) {
            const studentIdQuery = query(usersRef, where("studentId", "==", studentId));
            if (!(await getDocs(studentIdQuery)).empty) {
                return { exists: true, message: "This student ID is already registered." };
            }
        }

        if (userType === "staff" && staffId) {
            const staffIdQuery = query(usersRef, where("staffId", "==", staffId));
            if (!(await getDocs(staffIdQuery)).empty) {
                return { exists: true, message: "This staff ID is already registered." };
            }
        }
        
        return { exists: false, message: "" };
        
    } catch (error) {
        console.error("Error checking for duplicate user:", error);
        return { 
            exists: false, 
            message: "Could not verify user details. Please check your connection." 
        };
    }
}

async function loadStudentDashboard() {
    try {
        const user = window.auth.currentUser;
        if (!user) return;

        // NOTE: If you get a Firestore error about needing an index,
        // the console will provide a direct link to create it.
        const lostItemsQuery = query(
            collection(window.db, "items"), 
            where("type", "==", "lost"),
            orderBy("reportedAt", "desc")
        );
        const lostItemsSnapshot = await getDocs(lostItemsQuery);
        allLostItems = lostItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const foundItemsQuery = query(
            collection(window.db, "items"), 
            where("type", "==", "found"),
            orderBy("reportedAt", "desc")
        );
        const foundItemsSnapshot = await getDocs(foundItemsQuery);
        const foundItems = foundItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const userClaimsQuery = query(collection(window.db, "claims"), where("claimedBy", "==", user.uid));
        const userClaimsSnapshot = await getDocs(userClaimsQuery);
        const userClaims = userClaimsSnapshot.docs.map(doc => doc.data());
        
        const pendingClaims = userClaims.filter(claim => claim.status === 'pending');
        const userLostItemsQuery = query(collection(window.db, "items"), where("reportedBy", "==", user.uid), where("type", "==", "lost"));
        const userLostItemsSnapshot = await getDocs(userLostItemsQuery);
        
        updateItemsList('studentLostItemsList', allLostItems);
        updateItemsList('studentFoundItemsList', foundItems.slice(0, 10));
        
        document.getElementById('studentLostCount').textContent = userLostItemsSnapshot.size;
        document.getElementById('studentClaimedCount').textContent = userClaims.length;
        document.getElementById('studentPendingCount').textContent = pendingClaims.length;
        
    } catch (error) {
        console.error("Error loading student dashboard:", error);
    }
}

async function loadStaffDashboard() {
    try {
        const lostItemsQuery = query(collection(window.db, "items"), where("type", "==", "lost"));
        const lostItemsSnapshot = await getDocs(lostItemsQuery);
        const lostItems = lostItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const foundItemsQuery = query(collection(window.db, "items"), where("type", "==", "found"));
        const foundItemsSnapshot = await getDocs(foundItemsQuery);
        const foundItems = foundItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const pendingClaimsQuery = query(collection(window.db, "claims"), where("status", "==", "pending"));
        const pendingClaimsSnapshot = await getDocs(pendingClaimsQuery);
        const pendingClaims = pendingClaimsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const resolvedClaimsQuery = query(
            collection(window.db, "claims"),
            where("resolvedAt", ">=", weekAgo)
        );
        const resolvedClaimsSnapshot = await getDocs(resolvedClaimsQuery);
        const resolvedClaimsCount = resolvedClaimsSnapshot.docs.filter(doc => ['approved', 'rejected'].includes(doc.data().status)).length;

        
        updateItemsList('staffLostItemsList', lostItems);
        updateItemsList('staffFoundItemsList', foundItems.filter(item => item.status !== 'claimed'));
        updatePendingClaimsList(pendingClaims);
        
        document.getElementById('totalItemsCount').textContent = lostItemsSnapshot.size + foundItemsSnapshot.size;
        document.getElementById('pendingClaimsCount').textContent = pendingClaimsSnapshot.size;
        document.getElementById('resolvedClaimsCount').textContent = resolvedClaimsCount;
        
    } catch (error) {
        console.error("Error loading staff dashboard:", error);
    }
}

function updatePendingClaimsList(claims) {
    const listElement = document.getElementById('pendingClaimsList');
    if (claims.length === 0) {
        listElement.innerHTML = '<div class="no-items">No pending claims at the moment</div>';
        return;
    }
    
    listElement.innerHTML = claims.map(claim => `
        <div class="item-card" data-testid="card-claim-${claim.id}">
            <div class="item-header" data-testid="header-claim-${claim.id}">
                <h4 data-testid="heading-claim-item-${claim.id}">Claim for: ${claim.itemName || 'Unknown Item'}</h4>
                <span class="claim-status pending" data-testid="status-claim-${claim.id}">Pending Review</span>
            </div>
            <p class="item-description" data-testid="description-claim-${claim.id}">Claimed by: ${claim.claimedByName || 'Unknown User'}</p>
            <div class="item-details" data-testid="details-claim-${claim.id}">
                <span class="item-location" data-testid="date-claim-${claim.id}">📅 Claimed on: ${claim.claimedAt ? new Date(claim.claimedAt.toDate ? claim.claimedAt.toDate() : claim.claimedAt).toLocaleDateString() : 'Unknown date'}</span>
            </div>
            <div class="item-actions" data-testid="actions-claim-${claim.id}">
                <button class="action-btn approve-btn" onclick="reviewClaim('${claim.id}', 'approve')" data-testid="button-approve-${claim.id}">Approve</button>
                <button class="action-btn reject-btn" onclick="reviewClaim('${claim.id}', 'reject')" data-testid="button-reject-${claim.id}">Reject</button>
                <button class="action-btn details-btn" onclick="viewClaimDetails('${claim.id}')" data-testid="button-details-${claim.id}">Details</button>
            </div>
        </div>
    `).join('');
}

// Replace this function:
async function claimItem(itemId) {
    const user = window.auth.currentUser;
    if (!user) {
        alert('You must be signed in to claim an item.');
        showSignInModal();
        return;
    }

    try {
        const itemDoc = await getDoc(doc(window.db, "items", itemId));
        if (!itemDoc.exists()) {
            alert('Item not found.');
            return;
        }

        const itemData = itemDoc.data();
        
        const userDoc = await getDoc(doc(window.db, "users", user.uid));
        const userData = userDoc.data();
        
        const existingClaimsQuery = query(
            collection(window.db, "claims"),
            where("itemId", "==", itemId),
            where("claimedBy", "==", user.uid)
        );
        const existingClaims = await getDocs(existingClaimsQuery);
        
        if (!existingClaims.empty) {
            alert('You have already claimed this item.');
            return;
        }

        // Start AI verification instead of direct claim
        startClaimVerification(itemId);
        
    } catch (error) {
        console.error("Error starting claim process:", error);
        alert('Failed to start claim process. Please try again.');
    }
}

async function reviewClaim(claimId, action) {
    try {
        const claimDoc = await getDoc(doc(window.db, "claims", claimId));
        if (!claimDoc.exists()) {
            alert('Claim not found.');
            return;
        }

        const claimData = claimDoc.data();
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        
        await updateDoc(doc(window.db, "claims", claimId), {
            status: newStatus,
            resolvedAt: Timestamp.now(),
            resolvedBy: window.auth.currentUser.uid
        });

        if (action === 'approve') {
            await updateDoc(doc(window.db, "items", claimData.itemId), {
                status: 'claimed',
                claimedBy: claimData.claimedBy,
                claimedAt: Timestamp.now()
            });
        }

        alert(`Claim ${newStatus} successfully!`);
        await loadStaffDashboard();
        
    } catch (error) {
        console.error("Error reviewing claim:", error);
        alert('Failed to process claim. Please try again.');
    }
}

function viewItemDetails(itemId) {
    alert(`View details for item: ${itemId}\nThis would show a detailed view with more information.`);
}

function viewClaimDetails(claimId) {
    alert(`View details for claim: ${claimId}\nThis would show claim details and supporting information.`);
}

function searchItems(userType) {
    const searchInput = document.getElementById(`${userType}SearchInput`);
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        if (userType === 'student') {
            updateItemsList('studentLostItemsList', allLostItems);
        } else if (userType === 'staff') {
            // For staff, you might want to reload from server or use cached data
            loadStaffDashboard();
        }
        return;
    }
    
    let itemsToSearch = [];
    if (userType === 'student') {
        itemsToSearch = allLostItems;
    } else if (userType === 'staff') {
        // For staff search, you might want to implement separate search logic
        const lostItemsList = document.getElementById('staffLostItemsList');
        const foundItemsList = document.getElementById('staffFoundItemsList');
        // This is a simplified approach - you might want to cache staff items too
        console.log('Staff search not fully implemented yet');
        return;
    }
    
    const filteredItems = itemsToSearch.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.location && item.location.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
    );
    
    updateItemsList(`${userType}LostItemsList`, filteredItems, true);
}

window.showVerificationReminder = function(user) {
    const reminderDiv = document.getElementById('verificationReminder');
    if (reminderDiv) {
        reminderDiv.style.display = 'block';
        document.getElementById('verificationEmail').textContent = user.email;
        
        document.getElementById('resendVerificationBtn').onclick = async function() {
            try {
                await sendEmailVerification(user);
                alert('Verification email sent! Please check your inbox.');
            } catch (error) {
                alert('Failed to send verification email: ' + error.message);
            }
        };
    }
};

function initializeChatbot() {
  const bubble = document.getElementById('chatbotBubble');
  const chatWindow = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const sendBtn = document.getElementById('chatbotSend');
  const input = document.getElementById('chatbotInput');
  const messagesContainer = document.getElementById('chatbotMessages');
  const statusDot = document.getElementById('chatbotStatusDot');
  const subtitle = document.getElementById('chatbotSubtitle');

  // Check if required elements exist
  if (!bubble || !chatWindow) {
    console.log('Chatbot elements not found - skipping initialization');
    return;
  }

  // Use global chatHistory to persist across function calls
  if (!window.chatHistory) {
    window.chatHistory = [];
  }
  let chatHistory = window.chatHistory;
  
  let isOpen = false;

  // Load chat history from sessionStorage
  function loadChatHistory() {
    const user = window.auth?.currentUser;
    const storageKey = user ? `chatHistory_${user.uid}` : 'chatHistory_guest';
    const saved = sessionStorage.getItem(storageKey);
    
    // Clear the messages container
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    
    if (saved) {
      chatHistory = JSON.parse(saved);
      window.chatHistory = chatHistory; // Update global reference
      chatHistory.forEach(msg => {
        if (msg.role === 'user') {
          addMessageToUI(msg.content, 'user', msg.timestamp);
        } else if (msg.role === 'assistant') {
          addMessageToUI(msg.content, 'ai', msg.timestamp);
        }
      });
    } else {
      // No saved history - add welcome message
      addWelcomeMessage();
    }
  }

  // Add welcome message based on auth status
  function addWelcomeMessage() {
    const user = window.auth?.currentUser;
    let welcomeMessage = "Hello! I'm your Lost & Found assistant. How can I help you today?";
    
    if (user && user.emailVerified) {
      welcomeMessage = `Hello! I'm your Lost & Found assistant. Welcome back! How can I help you today?`;
    }
    
    const message = {
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date().toISOString()
    };
    
    chatHistory.push(message);
    window.chatHistory = chatHistory;
    saveChatHistory();
    addMessageToUI(message.content, 'ai', message.timestamp);
  }

  // Save chat history to sessionStorage
  function saveChatHistory() {
    const user = window.auth?.currentUser;
    const storageKey = user ? `chatHistory_${user.uid}` : 'chatHistory_guest';
    sessionStorage.setItem(storageKey, JSON.stringify(chatHistory));
  }

  // Save chat history to sessionStorage
  function saveChatHistory() {
    const user = window.auth?.currentUser;
    const storageKey = user ? `chatHistory_${user.uid}` : 'chatHistory_guest';
    sessionStorage.setItem(storageKey, JSON.stringify(chatHistory));
  }

  // Update chatbot status based on auth
  async function updateChatbotStatus() {
    const user = window.auth?.currentUser;
    
    if (user && user.emailVerified) {
      let userData = null;
      try {
        const userDoc = await getDoc(doc(window.db, "users", user.uid));
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
      } catch (error) {
        console.warn("Could not access user data for chatbot:", error.message);
      }
      
      const username = userData?.username || user.email.split('@')[0];
      const userType = userData?.userType || 'student';
      
      if (statusDot) statusDot.classList.add('online');
      if (subtitle) subtitle.textContent = `Welcome, ${username}`;
    } else {
      if (statusDot) statusDot.classList.remove('online');
      if (subtitle) subtitle.textContent = 'Guest Mode';
    }
  }

  // Toggle chat window
  bubble.addEventListener('click', () => {
    if (!isOpen) {
      chatWindow.style.display = 'flex';
      bubble.style.display = 'none';
      isOpen = true;
      loadChatHistory();
      updateChatbotStatus();
      scrollToBottom();
      if (input) input.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      bubble.style.display = 'flex';
      isOpen = false;
    });
  }

  // Send message - IMPROVED VERSION
    async function sendMessage() {
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
      
        // Disable input
        input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
      
        // Add user message to UI
        addMessageToUI(message, 'user');
        chatHistory.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });
        saveChatHistory();
      
        // Clear input
        input.value = '';
        scrollToBottom();
      
        // Show typing indicator
        const typingIndicator = document.getElementById('chatbotTyping');
        if (typingIndicator) {
          typingIndicator.style.display = 'flex';
        }
        scrollToBottom();
      
        try {
          // Prepare user info
          const user = window.auth?.currentUser;
          let userInfo = {
            uid: null,
            type: 'guest',
            name: 'Guest'
          };
    
          if (user && user.emailVerified) {
            try {
              const userDoc = await getDoc(doc(window.db, "users", user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                userInfo = {
                  uid: user.uid,
                  type: userData.userType || 'student',
                  name: userData.username || user.email.split('@')[0]
                };
              }
            } catch (error) {
              console.warn("Could not fetch user data for AI:", error);
            }
          }
    
          // Get Firestore data for logged-in users
          let firestoreContext = null;
          if (user && user.emailVerified) {
            try {
              const itemsQuery = query(collection(window.db, "items"), orderBy("reportedAt", "desc"));
              const itemsSnapshot = await getDocs(itemsQuery);
              const items = itemsSnapshot.docs.slice(0, 20).map(doc => ({
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                type: doc.data().type,
                category: doc.data().category,
                location: doc.data().location,
                date: doc.data().date?.toDate?.() || doc.data().date,
                reportedAt: doc.data().reportedAt?.toDate?.() || doc.data().reportedAt,
                hasImage: doc.data().hasImage || false
              }));
              
              firestoreContext = {
                recentItems: items,
                totalItems: items.length,
                lostItems: items.filter(item => item.type === 'lost'),
                foundItems: items.filter(item => item.type === 'found')
              };
              
              console.log('Firestore context loaded:', firestoreContext);
            } catch (error) {
              console.warn("Could not fetch Firestore data:", error);
            }
          }
    
          // Helper function to find matching items
          function findMatchingItems(query, items) {
            const searchTerm = query.toLowerCase();
            return items.filter(item => 
              item.name.toLowerCase().includes(searchTerm) ||
              item.description.toLowerCase().includes(searchTerm) ||
              item.category.toLowerCase().includes(searchTerm) ||
              (item.type && item.type.toLowerCase().includes(searchTerm))
            );
          }
    
          // Determine if this is a search query or general question
          const isSearchQuery = message.toLowerCase().includes('search') || 
                               message.toLowerCase().includes('find') || 
                               message.toLowerCase().includes('look for') ||
                               message.toLowerCase().includes('book') ||
                               message.toLowerCase().includes('item') && 
                               !message.toLowerCase().includes('list');
    
          // Find items matching the current query (only for search queries)
          const matchingItems = isSearchQuery && firestoreContext ? 
                              findMatchingItems(message, firestoreContext.recentItems) : [];
    
          // Build system message - IMPROVED VERSION
          let systemMessage = `You are a helpful assistant for the ACLC Lost and Found system.
          
          RESPONSE FORMATTING REQUIREMENTS:
          - ALWAYS format item information in clean, readable lists
          - Use line breaks (\\n) to separate different sections
          
          FOR SPECIFIC SEARCHES (when user asks about specific items):
          - Use this format for single items:\\n\\n
            Currently, we have one [lost/found] item matching your search:\\n\\n
            Item: [Item Name]\\n
            Description: [Item Description]\\n
            Location: [Location]\\n
            Date: [Month Day, Year]\\n\\n
    
          - Use this format for multiple matching items:\\n\\n
            We found [number] items matching your search:\\n\\n
            
            1. [Item Name]\\n
               Description: [Description]\\n
               Location: [Location]\\n
               Date: [Month Day, Year]\\n\\n
               
            2. [Item Name]\\n
               Description: [Description]\\n
               Location: [Location]\\n
               Date: [Month Day, Year]\\n\\n
    
          FOR GENERAL LISTS (when user asks for all items):
          - Use this format for listing all found items:\\n\\n
            Here are all the currently found items in our system:\\n\\n
            
            Found Items ([count] total):\\n\\n
            1. [Item Name]\\n
               Description: [Description]\\n
               Location: [Location]\\n
               Date: [Month Day, Year]\\n\\n
               
            2. [Item Name]\\n
               Description: [Description]\\n
               Location: [Location]\\n
               Date: [Month Day, Year]\\n\\n
    
          - Format dates as "Oct 9, 2025" NOT "10/9/2025"
          - Use line breaks between items for readability
          - Keep the tone helpful and professional
          
          QUERY TYPE DETECTION:
          - If user asks for "list", "all", "current", "show me all" - show ALL items of that type
          - If user asks about specific items like "book", "backpack", etc. - search for matching items
          - If no specific items mentioned but asks for "found items" or "lost items" - show all of that type
          `;
    
          if (userInfo.type === 'guest') {
            systemMessage += "CURRENT USER: Guest (not logged in). Explain features and guide them to sign in for full access to the item database.";
          } else {
            systemMessage += `CURRENT USER: ${userInfo.name} (${userInfo.type}) - Logged in with full database access.\\n\\n`;
            
            if (firestoreContext && firestoreContext.recentItems.length > 0) {
              systemMessage += `CURRENT LOST & FOUND DATABASE (${firestoreContext.totalItems} total items):\\n`;
              
              if (firestoreContext.lostItems.length > 0) {
                systemMessage += `LOST ITEMS (${firestoreContext.lostItems.length}):\\n`;
                firestoreContext.lostItems.forEach(item => {
                  const dateStr = item.date ? new Date(item.date).toLocaleDateString() : 'Unknown date';
                  systemMessage += `- "${item.name}" (${item.category}): ${item.description} | Location: ${item.location} | Date: ${dateStr}\\n`;
                });
              }
              
              if (firestoreContext.foundItems.length > 0) {
                systemMessage += `\\nFOUND ITEMS (${firestoreContext.foundItems.length}):\\n`;
                firestoreContext.foundItems.forEach(item => {
                  const dateStr = item.date ? new Date(item.date).toLocaleDateString() : 'Unknown date';
                  systemMessage += `- "${item.name}" (${item.category}): ${item.description} | Location: ${item.location} | Date: ${dateStr}\\n`;
                });
              }
              
              // Add matching items context only for search queries
              if (isSearchQuery && matchingItems.length > 0) {
                systemMessage += `\\nQUERY MATCH: Found ${matchingItems.length} items matching "${message}":\\n`;
                matchingItems.forEach(item => {
                  const dateStr = item.date ? new Date(item.date).toLocaleDateString() : 'Unknown date';
                  systemMessage += `- ${item.name} (${item.type} ${item.category}): "${item.description}" at ${item.location} on ${dateStr}\\n`;
                });
              }
              
              systemMessage += `\\nUse this database information to answer user questions accurately. Provide specific details when available.`;
            } else {
              systemMessage += "No items currently in the database. Suggest reporting lost/found items.";
            }
          }
    
          // Prepare history for API (last 10 messages)
          const historyForAPI = chatHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }));
    
          // Call Cloudflare Worker API
          const response = await fetch('https://findmyaclc.skysalvador2004.workers.dev', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: systemMessage + "\\n\\nUser Question: " + message,
              user: userInfo,
              history: historyForAPI
            })
          });
    
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
    
          const data = await response.json();
          const aiResponse = data.response || "Sorry, I couldn't generate a response.";
    
          // Hide typing indicator
          if (typingIndicator) {
            typingIndicator.style.display = 'none';
          }
    
          // Add AI response to UI
          addMessageToUI(aiResponse, 'ai');
          chatHistory.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
          });
          saveChatHistory();
    
        } catch (error) {
          console.error('Chatbot error:', error);
          if (typingIndicator) {
            typingIndicator.style.display = 'none';
          }
          addMessageToUI('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
          if (input) input.disabled = false;
          if (sendBtn) sendBtn.disabled = false;
          if (input) input.focus();
          scrollToBottom();
        }
      }

  // Add message to UI
  function addMessageToUI(text, type, timestamp = null) {
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'chatbot-message-content';
    contentDiv.innerHTML = text.replace(/\n/g, '<br>');
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'chatbot-message-time';
    timeDiv.textContent = formatTime(timestamp);
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  // Format timestamp
  function formatTime(timestamp) {
    if (!timestamp) {
      return 'Just now';
    }
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }

  // Scroll to bottom
  function scrollToBottom() {
    setTimeout(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  // Event listeners
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Initialize status
  updateChatbotStatus();
  
  // Add welcome message if no history
  if (chatHistory.length === 0) {
    chatHistory.push({
      role: 'assistant',
      content: "Hello! I'm your Lost & Found assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    });
    saveChatHistory();
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded - initializing systems');
        initializeImageUpload();
    });
} else {
    console.log('DOM already loaded - initializing systems');
    initializeImageUpload();
}