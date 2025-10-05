// Global variable to store fetched items for client-side search
let allLostItems = [];

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
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('reportItemMessage').textContent = '';
  document.getElementById('reportItemMessage').className = 'auth-message';
  modal.style.display = 'block';
}

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
      <p class="item-description" data-testid="text-claimer-${claim.id}">Claimed by: ${claim.claimedByName || 'User'}</p>
      <div class="item-details" data-testid="details-claim-${claim.id}">
        <span class="item-date" data-testid="date-claim-${claim.id}">Claimed on: ${claim.claimedAt ? new Date(claim.claimedAt.toDate()).toLocaleDateString() : 'Unknown'}</span>
      </div>
      <div class="staff-action-buttons" data-testid="actions-claim-${claim.id}">
        <button class="staff-action-btn approve-btn" onclick="processClaim('${claim.id}', 'approved')" data-testid="button-approve-${claim.id}">Approve</button>
        <button class="staff-action-btn reject-btn" onclick="processClaim('${claim.id}', 'rejected')" data-testid="button-reject-${claim.id}">Reject</button>
        <button class="staff-action-btn view-btn" onclick="viewClaimDetails('${claim.id}')" data-testid="button-view-claim-${claim.id}">Details</button>
      </div>
    </div>
  `).join('');
}

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
      <p class="item-description" data-testid="description-item-${item.id}">${item.description || 'No description available'}</p>
      <div class="item-details" data-testid="details-item-${item.id}">
        <span class="item-location" data-testid="location-item-${item.id}">Location: ${item.location || 'Unknown location'}</span>
        <span class="item-date" data-testid="date-item-${item.id}">Date: ${item.date ? new Date(item.date.toDate ? item.date.toDate() : item.date).toLocaleDateString() : 'Unknown date'}</span>
      </div>
      <div class="item-actions" data-testid="actions-item-${item.id}">
        <button class="action-btn claim-btn" onclick="claimItem('${item.id}')" data-testid="button-claim-${item.id}">Claim</button>
        <button class="action-btn details-btn" onclick="viewItemDetails('${item.id}')" data-testid="button-details-${item.id}">Details</button>
      </div>
    </div>
  `).join('');
}

window.processClaim = async (claimId, status) => {
  try {
    await setDoc(doc(window.db, "claims", claimId), {
      status: status,
      resolvedAt: new Date(),
      resolvedBy: window.auth.currentUser.uid
    }, { merge: true });
    
    alert(`Claim ${status} successfully!`);
    window.loadStaffDashboard();
  } catch (error) {
    console.error("Error processing claim:", error);
    alert("Error processing claim. Please try again.");
  }
};

window.viewClaimDetails = (claimId) => {
  alert(`Viewing claim details for ${claimId} - Feature coming soon!`);
};

window.claimItem = (itemId) => {
  alert(`Claiming item ${itemId} - Feature coming soon!`);
};

window.viewItemDetails = (itemId) => {
  alert(`Viewing details for item ${itemId} - Feature coming soon!`);
};

window.searchItems = (dashboardType) => {
  if (dashboardType !== 'student') {
    alert("Search for this dashboard is not yet implemented.");
    return;
  }
  
  const searchTerm = document.getElementById('studentSearchInput').value.toLowerCase().trim();
  
  if (!searchTerm) {
    updateItemsList('studentLostItemsList', allLostItems, false);
    return;
  }

  const filteredItems = allLostItems.filter(item => {
    const name = item.name?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const category = item.category?.toLowerCase() || '';
    const location = item.location?.toLowerCase() || '';

    return name.includes(searchTerm) ||
           description.includes(searchTerm) ||
           category.includes(searchTerm) ||
           location.includes(searchTerm);
  });

  updateItemsList('studentLostItemsList', filteredItems, true);
};

window.showSignInModal = showSignInModal;
window.showSignUpModal = showSignUpModal;
window.showReportItemModal = showReportItemModal;
window.loadStudentDashboard = loadStudentDashboard;
window.loadStaffDashboard = loadStaffDashboard;

document.addEventListener("DOMContentLoaded", function () {
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

  const itemImageInput = document.getElementById('itemImage');
  const imagePreview = document.getElementById('imagePreview');
  if (itemImageInput && imagePreview) {
    itemImageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { imagePreview.src = e.target.result; imagePreview.style.display = 'block'; };
        reader.readAsDataURL(file);
      } else {
        imagePreview.src = ''; imagePreview.style.display = 'none';
      }
    });
  }

  document.getElementById('reportItemForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = window.auth.currentUser;
    if (!user) { alert('You must be signed in.'); return; }

    const submitBtn = this.querySelector('.auth-submit-btn');
    const messageDiv = document.getElementById('reportItemMessage');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
      const imageFile = document.getElementById('itemImage').files[0];
      let imageUrl = '';
      if (imageFile) {
        submitBtn.textContent = 'Uploading Image...';
        const imageRef = ref(window.storage, `item_images/${user.uid}_${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      submitBtn.textContent = 'Saving Report...';
      const itemData = {
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDescription').value,
        category: document.getElementById('itemCategory').value,
        location: document.getElementById('itemLocation').value,
        date: Timestamp.fromDate(new Date(document.getElementById('itemDate').value)),
        type: document.getElementById('reportItemType').value,
        imageUrl,
        status: 'active',
        reportedBy: user.uid,
        reportedAt: Timestamp.now()
      };
      await addDoc(collection(window.db, 'items'), itemData);

      messageDiv.textContent = 'Report submitted successfully!';
      messageDiv.className = 'auth-message success';
      await loadStudentDashboard(); // Refresh list
      setTimeout(() => { document.getElementById('reportItemModal').style.display = 'none'; }, 1500);

    } catch (error) {
      console.error('Error submitting report:', error);
      messageDiv.textContent = 'Failed to submit report. Please try again.';
      messageDiv.className = 'auth-message error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    }
  });

  document.getElementById('studentSearchInput')?.addEventListener('keyup', () => searchItems('student'));

  console.log('Event listeners initialized successfully');
});