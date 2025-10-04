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
  const messages = [];
  
  if (password.length >= 8) strength += 1;
  else messages.push("at least 8 characters");
  
  if (/[a-z]/.test(password)) strength += 1;
  else messages.push("one lowercase letter");
  
  if (/[A-Z]/.test(password)) strength += 1;
  else messages.push("one uppercase letter");
  
  if (/[0-9]/.test(password)) strength += 1;
  else messages.push("one number");
  
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  else messages.push("one special character");
  
  let strengthLevel, strengthText, strengthClass;
  
  if (password.length === 0) {
    strengthLevel = 0;
    strengthText = "Weak";
    strengthClass = "weak";
  } else if (strength <= 2) {
    strengthLevel = 1;
    strengthText = "Weak";
    strengthClass = "weak";
  } else if (strength <= 3) {
    strengthLevel = 2;
    strengthText = "Fair";
    strengthClass = "fair";
  } else {
    strengthLevel = 3;
    strengthText = "Strong";
    strengthClass = "strong";
  }
  
  return {
    level: strengthLevel,
    text: strengthText,
    class: strengthClass,
    messages: messages
  };
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
    case 'auth/user-not-found':
      return "No account found with this email address. Please sign up.";
    case 'auth/wrong-password':
      return "Incorrect password. Please try again or reset your password.";
    case 'auth/invalid-email':
      return "Invalid email address format.";
    case 'auth/user-disabled':
      return "This account has been disabled. Please contact support.";
    case 'auth/too-many-requests':
      return "Too many failed login attempts. Please try again later.";
    case 'auth/email-already-in-use':
      return "This email is already registered. Please sign in instead.";
    case 'auth/weak-password':
      return "Password is too weak. Please use at least 6 characters.";
    case 'auth/network-request-failed':
      return "Network error. Please check your internet connection.";
    case 'auth/invalid-credential':
      return "Invalid email or password. Please check your credentials.";
    default:
      return `Error: ${errorCode}`;
  }
}

function getPasswordResetErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return "Invalid email address format.";
    case 'auth/user-not-found':
      return "No account found with this email address.";
    case 'auth/too-many-requests':
      return "Too many requests. Please try again later.";
    default:
      return `Error: ${errorCode}`;
  }
}

async function checkForDuplicateUser(username, userType, studentId, staffId, email) {
  try {
    const usersRef = collection(window.db, "users");
    const allUsersSnapshot = await getDocs(usersRef);
    
    if (email) {
      const emailExists = allUsersSnapshot.docs.some(doc => {
        const userData = doc.data();
        return userData.email && userData.email.toLowerCase() === email.toLowerCase();
      });
      
      if (emailExists) {
        return {
          exists: true,
          message: "This email address is already registered. Please sign in or use a different email address."
        };
      }
    }
    
    if (username) {
      const usernameExists = allUsersSnapshot.docs.some(doc => {
        const userData = doc.data();
        return userData.username && userData.username.toLowerCase() === username.toLowerCase();
      });
      
      if (usernameExists) {
        return {
          exists: true,
          message: "This username is already taken. Please choose a different username."
        };
      }
    }
    
    if (userType === "student" && studentId) {
      const studentIdExists = allUsersSnapshot.docs.some(doc => {
        const userData = doc.data();
        return userData.studentId && userData.studentId === studentId;
      });
      
      if (studentIdExists) {
        return {
          exists: true,
          message: "This student ID is already registered. If this is your ID, please sign in with your existing account."
        };
      }
    }
    
    if (userType === "staff" && staffId) {
      const staffIdExists = allUsersSnapshot.docs.some(doc => {
        const userData = doc.data();
        return userData.staffId && userData.staffId === staffId;
      });
      
      if (staffIdExists) {
        return {
          exists: true,
          message: "This staff ID is already registered. If this is your ID, please sign in with your existing account."
        };
      }
    }
    
    return { exists: false, message: "" };
    
  } catch (error) {
    console.error("Error checking for duplicate user:", error);
    return { 
      exists: false, 
      message: "Note: Could not verify username availability due to connection issues." 
    };
  }
}

async function loadStudentDashboard() {
  try {
    const user = window.auth.currentUser;
    if (!user) return;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const lostItemsQuery = query(
      collection(window.db, "items"), 
      where("type", "==", "lost")
    );
    const lostItemsSnapshot = await getDocs(lostItemsQuery);
    const lostItems = lostItemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const foundItemsQuery = query(
      collection(window.db, "items"), 
      where("type", "==", "found")
    );
    const foundItemsSnapshot = await getDocs(foundItemsQuery);
    const foundItems = foundItemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const userClaimsQuery = query(
      collection(window.db, "claims"),
      where("claimedBy", "==", user.uid)
    );
    const userClaimsSnapshot = await getDocs(userClaimsQuery);
    const userClaims = userClaimsSnapshot.docs.map(doc => doc.data());
    
    const pendingClaims = userClaims.filter(claim => claim.status === 'pending');
    const userLostItemsQuery = query(
      collection(window.db, "items"),
      where("reportedBy", "==", user.uid),
      where("type", "==", "lost")
    );
    const userLostItemsSnapshot = await getDocs(userLostItemsQuery);
    
    updateItemsList('studentLostItemsList', lostItems.slice(0, 10));
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
    const lostItems = lostItemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const foundItemsQuery = query(collection(window.db, "items"), where("type", "==", "found"));
    const foundItemsSnapshot = await getDocs(foundItemsQuery);
    const foundItems = foundItemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const pendingClaimsQuery = query(
      collection(window.db, "claims"),
      where("status", "==", "pending")
    );
    const pendingClaimsSnapshot = await getDocs(pendingClaimsQuery);
    const pendingClaims = pendingClaimsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const allClaimsSnapshot = await getDocs(collection(window.db, "claims"));
    const resolvedClaims = allClaimsSnapshot.docs.filter(doc => {
      const data = doc.data();
      const resolvedAt = data.resolvedAt?.toDate();
      return (data.status === 'approved' || data.status === 'rejected') && resolvedAt >= weekAgo;
    });
    
    updateItemsList('staffLostItemsList', lostItems);
    updateItemsList('staffFoundItemsList', foundItems.filter(item => item.status !== 'claimed'));
    updatePendingClaimsList(pendingClaims);
    
    document.getElementById('totalItemsCount').textContent = lostItemsSnapshot.size + foundItemsSnapshot.size;
    document.getElementById('pendingClaimsCount').textContent = pendingClaimsSnapshot.size;
    document.getElementById('resolvedClaimsCount').textContent = resolvedClaims.length;
    
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

function updateItemsList(listId, items) {
  const listElement = document.getElementById(listId);
  if (!listElement) return;
  
  if (items.length === 0) {
    listElement.innerHTML = '<div class="no-items">No items found</div>';
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
  alert(`Viewing claim details for ${claimId} - Full claim details feature coming soon!`);
};

window.claimItem = (itemId) => {
  alert(`Claiming item ${itemId} - Item claiming feature coming soon!`);
};

window.viewItemDetails = (itemId) => {
  alert(`Viewing details for item ${itemId} - Full item details feature coming soon!`);
};

window.searchItems = (dashboardType) => {
  const searchTerm = document.getElementById(`${dashboardType}SearchInput`).value.toLowerCase();
  alert(`Searching for: "${searchTerm}" - Search functionality coming soon!`);
};

window.reportItem = (type) => {
  alert(`Reporting ${type} item - Item reporting feature coming soon!`);
};

window.showSignInModal = showSignInModal;
window.showSignUpModal = showSignUpModal;
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
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        window.showVerificationReminder(user);
        return;
      }
      
      messageDiv.textContent = "Sign in successful!";
      messageDiv.className = "auth-message success";
      
      setTimeout(() => {
        document.getElementById("authModal").style.display = "none";
        this.reset();
        messageDiv.textContent = "";
      }, 1000);
      
    } catch (error) {
      messageDiv.textContent = getAuthErrorMessage(error.code);
      messageDiv.className = "auth-message error";
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  document.getElementById("signUpEmail")?.addEventListener("input", async function() {
    const email = this.value.trim();
    let availabilityElement = document.getElementById("emailAvailability");
    
    if (!availabilityElement) {
      const availabilityDiv = document.createElement('div');
      availabilityDiv.id = "emailAvailability";
      availabilityDiv.className = "input-hint";
      this.parentNode.appendChild(availabilityDiv);
      availabilityElement = availabilityDiv;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      availabilityElement.textContent = "Please enter a valid email address";
      availabilityElement.style.color = "var(--text-tertiary)";
      return;
    }
    
    if (email.length > 0) {
      availabilityElement.textContent = "Checking availability...";
      availabilityElement.style.color = "var(--text-tertiary)";
      
      try {
        const usersRef = collection(window.db, "users");
        const allUsersSnapshot = await getDocs(usersRef);
        const emailExists = allUsersSnapshot.docs.some(doc => {
          const userData = doc.data();
          return userData.email && userData.email.toLowerCase() === email.toLowerCase();
        });
        
        if (emailExists) {
          availabilityElement.textContent = "Email already registered";
          availabilityElement.style.color = "var(--error)";
        } else {
          availabilityElement.textContent = "Email available";
          availabilityElement.style.color = "var(--success)";
        }
      } catch (error) {
        availabilityElement.textContent = "Unable to check email availability";
        availabilityElement.style.color = "var(--text-tertiary)";
      }
    } else {
      availabilityElement.textContent = "";
    }
  });

  document.getElementById("signUpUsername")?.addEventListener("input", async function() {
    const username = this.value.trim();
    let availabilityElement = document.getElementById("usernameAvailability");
    
    if (!availabilityElement) {
      const availabilityDiv = document.createElement('div');
      availabilityDiv.id = "usernameAvailability";
      availabilityDiv.className = "input-hint";
      this.parentNode.appendChild(availabilityDiv);
      availabilityElement = availabilityDiv;
    }
    
    if (username.length < 3) {
      availabilityElement.textContent = "Username must be at least 3 characters";
      availabilityElement.style.color = "var(--text-tertiary)";
      return;
    }
    
    if (username.length > 0) {
      availabilityElement.textContent = "Checking availability...";
      availabilityElement.style.color = "var(--text-tertiary)";
      
      try {
        const usersRef = collection(window.db, "users");
        const allUsersSnapshot = await getDocs(usersRef);
        const usernameExists = allUsersSnapshot.docs.some(doc => {
          const userData = doc.data();
          return userData.username && userData.username.toLowerCase() === username.toLowerCase();
        });
        
        if (usernameExists) {
          availabilityElement.textContent = "Username already taken";
          availabilityElement.style.color = "var(--error)";
        } else {
          availabilityElement.textContent = "Username available";
          availabilityElement.style.color = "var(--success)";
        }
      } catch (error) {
        console.error("Username check error:", error);
        availabilityElement.textContent = "Unable to check username availability";
        availabilityElement.style.color = "var(--warning)";
      }
    } else {
      availabilityElement.textContent = "";
    }
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

  document.getElementById("forgotPasswordLink")?.addEventListener("click", function(e) {
    e.preventDefault();
    showForgotPasswordModal();
  });

  document.getElementById("backToSignIn")?.addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("forgotPasswordModal").style.display = "none";
    showSignInModal();
  });

  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  if (forgotPasswordModal) {
    const closeForgotModal = forgotPasswordModal.querySelector(".close-modal");
    closeForgotModal?.addEventListener("click", function() {
      forgotPasswordModal.style.display = "none";
    });
  }

  document.getElementById("forgotPasswordForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("resetEmail").value;
    const messageDiv = document.getElementById("forgotPasswordMessage");
    const submitBtn = this.querySelector(".auth-submit-btn");
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    
    sendPasswordResetEmail(window.auth, email)
      .then(() => {
        messageDiv.innerHTML = `
          <strong>Password reset email sent!</strong><br>
          Check your inbox at <strong>${email}</strong> for instructions to reset your password.
        `;
        messageDiv.className = "auth-message success";
        
        setTimeout(() => {
          document.getElementById("forgotPasswordModal").style.display = "none";
          this.reset();
          messageDiv.textContent = "";
        }, 3000);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = getPasswordResetErrorMessage(errorCode);
        messageDiv.textContent = errorMessage;
        messageDiv.className = "auth-message error";
      })
      .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  });

  window.addEventListener("click", function (event) {
    const forgotModal = document.getElementById("forgotPasswordModal");
    if (event.target === forgotModal) {
      forgotModal.style.display = "none";
    }
  });

  initializePasswordToggles();

  document.getElementById("signUpPassword")?.addEventListener("input", function() {
    updatePasswordStrength();
    checkPasswordMatch();
  });

  document.getElementById("confirmPassword")?.addEventListener("input", checkPasswordMatch);

  document.getElementById("signUpFormElement")?.addEventListener("reset", function() {
    setTimeout(() => {
      updatePasswordStrength();
      checkPasswordMatch();
    }, 0);
  });

  document.querySelector(".close-modal")?.addEventListener("click", function () {
    document.getElementById("authModal").style.display = "none";
  });

  document.getElementById("switchToSignUp")?.addEventListener("click", function (e) {
    e.preventDefault();
    showSignUpModal();
  });

  document.getElementById("switchToSignIn")?.addEventListener("click", function (e) {
    e.preventDefault();
    showSignInModal();
  });

  window.addEventListener("click", function (event) {
    const authModal = document.getElementById("authModal");
    const forgotModal = document.getElementById("forgotPasswordModal");
    
    if (event.target === authModal) {
      authModal.style.display = "none";
    }
    if (event.target === forgotModal) {
      forgotModal.style.display = "none";
    }
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
    const confirmPassword = document.getElementById("confirmPassword").value;
    const messageDiv = document.getElementById("authMessage");

    if (!username) {
      messageDiv.textContent = "Please enter a username.";
      messageDiv.className = "auth-message error";
      return;
    }

    if (username.length < 3) {
      messageDiv.textContent = "Username must be at least 3 characters long.";
      messageDiv.className = "auth-message error";
      return;
    }

    if (!userType) {
      messageDiv.textContent = "Please select whether you are a student or staff.";
      messageDiv.className = "auth-message error";
      return;
    }

    if (userType.value === "student") {
      if (!studentId) {
        messageDiv.textContent = "Please enter your student ID.";
        messageDiv.className = "auth-message error";
        return;
      }

      const studentIdRegex = /^\d{11}$/;
      if (!studentIdRegex.test(studentId)) {
        messageDiv.textContent = "Please enter a valid 11-digit student ID.";
        messageDiv.className = "auth-message error";
        return;
      }

      const year = studentId.substring(0, 2);
      if (year !== "24" && year !== "23" && year !== "22" && year !== "25") {
        messageDiv.textContent = "Student ID should start with valid year digits (22, 23, 24, 25, etc.).";
        messageDiv.className = "auth-message error";
        return;
      }
    } else if (userType.value === "staff") {
      if (!staffId) {
        messageDiv.textContent = "Please enter your staff ID.";
        messageDiv.className = "auth-message error";
        return;
      }

      if (staffId.length < 3) {
        messageDiv.textContent = "Staff ID must be at least 3 characters long.";
        messageDiv.className = "auth-message error";
        return;
      }
    }

    if (password !== confirmPassword) {
      messageDiv.textContent = "Passwords do not match. Please check and try again.";
      messageDiv.className = "auth-message error";
      return;
    }

    if (password.length < 6) {
      messageDiv.textContent = "Password must be at least 6 characters long for security.";
      messageDiv.className = "auth-message error";
      return;
    }

    const submitBtn = document.querySelector("#signUpFormElement .auth-submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Checking Availability...";
    submitBtn.disabled = true;

    try {
      const duplicateCheck = await checkForDuplicateUser(username, userType.value, studentId, staffId, email);
      
      if (duplicateCheck.exists) {
        messageDiv.textContent = duplicateCheck.message;
        messageDiv.className = "auth-message error";
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      submitBtn.textContent = "Creating Account...";
      
      const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(window.db, "users", user.uid), {
        username: username,
        email: email,
        userType: userType.value,
        studentId: userType.value === "student" ? studentId : null,
        staffId: userType.value === "staff" ? staffId : null,
        createdAt: new Date(),
        emailVerified: false
      });

      await sendEmailVerification(user);

      messageDiv.innerHTML = `
        <strong>Account created successfully!</strong><br>
        We've sent a verification email to <strong>${email}</strong>.<br>
        Please verify your email before signing in.
      `;
      messageDiv.className = "auth-message success";

      this.reset();
      
      setTimeout(() => {
        document.getElementById("authModal").style.display = "none";
        window.showVerificationReminder(user);
      }, 2000);

    } catch (error) {
      const errorCode = error.code;
      const errorMessage = getAuthErrorMessage(errorCode);
      messageDiv.textContent = errorMessage;
      messageDiv.className = "auth-message error";
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  console.log('Event listeners initialized successfully');
});
