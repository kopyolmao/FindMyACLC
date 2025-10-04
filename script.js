// Auth Modal Functions
function showSignInModal() {
  console.log('showSignInModal called'); // Debug log
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
  console.log('showSignUpModal called'); // Debug log
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

// Password Toggle Function
function initializePasswordToggles() {
  // Initialize for sign up password
  const signUpPasswordInput = document.getElementById('signUpPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const signInPasswordInput = document.getElementById('signInPassword');
  
  // Create wrapper and toggle for sign up password
  if (signUpPasswordInput) {
    const signUpWrapper = document.createElement('div');
    signUpWrapper.className = 'password-input-wrapper';
    signUpPasswordInput.parentNode.insertBefore(signUpWrapper, signUpPasswordInput);
    signUpWrapper.appendChild(signUpPasswordInput);
    
    const signUpToggle = document.createElement('button');
    signUpToggle.type = 'button';
    signUpToggle.className = 'password-toggle';
    signUpToggle.innerHTML = '🙈';
    signUpToggle.setAttribute('aria-label', 'Show password');
    signUpWrapper.appendChild(signUpToggle);
    
    signUpToggle.addEventListener('click', function() {
      const type = signUpPasswordInput.type === 'password' ? 'text' : 'password';
      signUpPasswordInput.type = type;
      this.innerHTML = type === 'password' ? '🙈' : '🫣';
      this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
    });
  }
  
  // Create wrapper and toggle for confirm password
  if (confirmPasswordInput) {
    const confirmWrapper = document.createElement('div');
    confirmWrapper.className = 'password-input-wrapper';
    confirmPasswordInput.parentNode.insertBefore(confirmWrapper, confirmPasswordInput);
    confirmWrapper.appendChild(confirmPasswordInput);
    
    const confirmToggle = document.createElement('button');
    confirmToggle.type = 'button';
    confirmToggle.className = 'password-toggle';
    confirmToggle.innerHTML = '🙈';
    confirmToggle.setAttribute('aria-label', 'Show password');
    confirmWrapper.appendChild(confirmToggle);
    
    confirmToggle.addEventListener('click', function() {
      const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
      confirmPasswordInput.type = type;
      this.innerHTML = type === 'password' ? '🙈' : '🫣';
      this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
    });
  }
  
  // Create wrapper and toggle for sign in password
  if (signInPasswordInput) {
    const signInWrapper = document.createElement('div');
    signInWrapper.className = 'password-input-wrapper';
    signInPasswordInput.parentNode.insertBefore(signInWrapper, signInPasswordInput);
    signInWrapper.appendChild(signInPasswordInput);
    
    const signInToggle = document.createElement('button');
    signInToggle.type = 'button';
    signInToggle.className = 'password-toggle';
    signInToggle.innerHTML = '🙈';
    signInToggle.setAttribute('aria-label', 'Show password');
    signInWrapper.appendChild(signInToggle);
    
    signInToggle.addEventListener('click', function() {
      const type = signInPasswordInput.type === 'password' ? 'text' : 'password';
      signInPasswordInput.type = type;
      this.innerHTML = type === 'password' ? '🙈' : '🫣';
      this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
    });
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log('DOM loaded - initializing event listeners'); // Debug log

  // Real-time email availability check (CASE-INSENSITIVE)
  document.getElementById("signUpEmail")?.addEventListener("input", async function() {
    const email = this.value.trim();
    const availabilityElement = document.getElementById("emailAvailability");
    
    // Remove existing availability element if it exists
    if (!availabilityElement) {
      const availabilityDiv = document.createElement('div');
      availabilityDiv.id = "emailAvailability";
      availabilityDiv.className = "input-hint";
      this.parentNode.appendChild(availabilityDiv);
    }
    
    const availabilityDisplay = document.getElementById("emailAvailability");
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      availabilityDisplay.textContent = "Please enter a valid email address";
      availabilityDisplay.style.color = "#666";
      return;
    }
    
    if (email.length > 0) {
      availabilityDisplay.textContent = "Checking availability...";
      availabilityDisplay.style.color = "#666";
      
      try {
        const usersRef = collection(window.db, "users");
        const allUsersSnapshot = await getDocs(usersRef);
        const emailExists = allUsersSnapshot.docs.some(doc => {
          const userData = doc.data();
          return userData.email && userData.email.toLowerCase() === email.toLowerCase();
        });
        
        if (emailExists) {
          availabilityDisplay.textContent = "✗ Email already registered";
          availabilityDisplay.style.color = "#ff4757";
        } else {
          availabilityDisplay.textContent = "✓ Email available";
          availabilityDisplay.style.color = "#2ed573";
        }
      } catch (error) {
        availabilityDisplay.textContent = "Unable to check email availability";
        availabilityDisplay.style.color = "#666";
      }
    } else {
      availabilityDisplay.textContent = "";
    }
  });

  // Real-time username availability check (CASE-INSENSITIVE)
  document.getElementById("signUpUsername")?.addEventListener("input", async function() {
    const username = this.value.trim();
    const availabilityElement = document.getElementById("usernameAvailability");
    
    // Remove existing availability element if it exists
    if (!availabilityElement) {
      const availabilityDiv = document.createElement('div');
      availabilityDiv.id = "usernameAvailability";
      availabilityDiv.className = "input-hint";
      this.parentNode.appendChild(availabilityDiv);
    }
    
    const availabilityDisplay = document.getElementById("usernameAvailability");
    
    if (username.length < 3) {
      availabilityDisplay.textContent = "Username must be at least 3 characters";
      availabilityDisplay.style.color = "#666";
      return;
    }
    
    if (username.length > 0) {
      availabilityDisplay.textContent = "Checking availability...";
      availabilityDisplay.style.color = "#666";
      
      try {
        const usersRef = collection(window.db, "users");
        const allUsersSnapshot = await getDocs(usersRef);
        const usernameExists = allUsersSnapshot.docs.some(doc => {
          const userData = doc.data();
          return userData.username && userData.username.toLowerCase() === username.toLowerCase();
        });
        
        if (usernameExists) {
          availabilityDisplay.textContent = "✗ Username already taken";
          availabilityDisplay.style.color = "#ff4757";
        } else {
          availabilityDisplay.textContent = "✓ Username available";
          availabilityDisplay.style.color = "#2ed573";
        }
      } catch (error) {
        console.error("Username check error:", error);
        availabilityDisplay.textContent = "⚠ Unable to check username availability";
        availabilityDisplay.style.color = "#ffa502";
      }
    } else {
      availabilityDisplay.textContent = "";
    }
  });

  // Forgot Password Link
  document.getElementById("forgotPasswordLink")?.addEventListener("click", function(e) {
    e.preventDefault();
    showForgotPasswordModal();
  });

  // Back to Sign In from Forgot Password
  document.getElementById("backToSignIn")?.addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("forgotPasswordModal").style.display = "none";
    showSignInModal();
  });

  // Close Forgot Password Modal
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  if (forgotPasswordModal) {
    const closeForgotModal = forgotPasswordModal.querySelector(".close-modal");
    closeForgotModal?.addEventListener("click", function() {
      forgotPasswordModal.style.display = "none";
    });
  }

  // Forgot Password Form Submission
  document.getElementById("forgotPasswordForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("resetEmail").value;
    const messageDiv = document.getElementById("forgotPasswordMessage");
    const submitBtn = this.querySelector(".auth-submit-btn");
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    
    sendPasswordResetEmail(auth, email)
      .then(() => {
        messageDiv.innerHTML = `
          <strong>Password reset email sent!</strong><br>
          Check your inbox at <strong>${email}</strong> for instructions to reset your password.
        `;
        messageDiv.className = "auth-message success";
        
        // Clear form and close modal after delay
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

  // Close forgot password modal when clicking outside
  window.addEventListener("click", function (event) {
    const forgotModal = document.getElementById("forgotPasswordModal");
    if (event.target === forgotModal) {
      forgotModal.style.display = "none";
    }
  });

  // Initialize password toggles - CORRECT PLACEMENT
  initializePasswordToggles();

  // Password strength real-time checking
  document.getElementById("signUpPassword")?.addEventListener("input", function() {
    updatePasswordStrength();
    checkPasswordMatch(); // Also check match when password changes
  });

  // Password confirmation real-time checking
  document.getElementById("confirmPassword")?.addEventListener("input", checkPasswordMatch);

  // Clear indicators when form is reset
  document.getElementById("signUpFormElement")?.addEventListener("reset", function() {
    setTimeout(() => {
      updatePasswordStrength();
      checkPasswordMatch();
    }, 0);
  });

  // Password Strength Checker
  function checkPasswordStrength(password) {
    let strength = 0;
    const messages = [];
    
    // Length check
    if (password.length >= 8) strength += 1;
    else messages.push("at least 8 characters");
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength += 1;
    else messages.push("one lowercase letter");
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 1;
    else messages.push("one uppercase letter");
    
    // Number check
    if (/[0-9]/.test(password)) strength += 1;
    else messages.push("one number");
    
    // Special character check
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

  // Update Password Strength Indicator
  function updatePasswordStrength() {
    const password = document.getElementById("signUpPassword").value;
    const strengthResult = checkPasswordStrength(password);
    const strengthBar = document.querySelector(".strength-bar");
    const strengthMessage = document.getElementById("strengthMessage");
    
    // Reset classes
    strengthBar.className = "strength-bar";
    
    if (password.length > 0) {
      strengthBar.classList.add(strengthResult.class);
      strengthMessage.textContent = strengthResult.text;
      strengthMessage.style.color = strengthResult.class === "weak" ? "#ff4757" : 
                                  strengthResult.class === "fair" ? "#ffa502" : "#2ed573";
    } else {
      strengthMessage.textContent = "Weak";
      strengthMessage.style.color = "#666";
    }
  }

  // Check Password Match
  function checkPasswordMatch() {
    const password = document.getElementById("signUpPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const matchMessage = document.getElementById("matchMessage");
    
    if (confirmPassword.length === 0) {
      matchMessage.textContent = "";
      matchMessage.className = "empty";
    } else if (password === confirmPassword) {
      matchMessage.textContent = "✓ Passwords match";
      matchMessage.className = "match";
    } else {
      matchMessage.textContent = "✗ Passwords do not match";
      matchMessage.className = "mismatch";
    }
  }

  // Close modal
  document.querySelector(".close-modal")?.addEventListener("click", function () {
    document.getElementById("authModal").style.display = "none";
  });

  // Switch between forms
  document.getElementById("switchToSignUp")?.addEventListener("click", function (e) {
    e.preventDefault();
    showSignUpModal();
  });

  document.getElementById("switchToSignIn")?.addEventListener("click", function (e) {
    e.preventDefault();
    showSignInModal();
  });

  // Close modals when clicking outside
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

  // Add event listeners for sign in/up buttons in header
  document.querySelector(".sign-in-btn")?.addEventListener("click", showSignInModal);
  document.querySelector(".sign-up-btn")?.addEventListener("click", showSignUpModal);

  // Sign In Form Submission
  document.getElementById("signInFormElement")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("signInEmail").value;
    const password = document.getElementById("signInPassword").value;
    const messageDiv = document.getElementById("authMessage");

    // Show loading state
    const submitBtn = document.querySelector("#signInFormElement .auth-submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Signing In...";
    submitBtn.disabled = true;

    signInWithEmailAndPassword(window.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Check if email is verified
        if (!user.emailVerified) {
          window.showVerificationReminder(user);
          messageDiv.textContent = "Please verify your email address to access all features.";
          messageDiv.className = "auth-message error";
          return signOut(window.auth);
        } else {
          messageDiv.textContent = "Successfully signed in! Welcome back!";
          messageDiv.className = "auth-message success";
          document.getElementById("authModal").style.display = "none";
          document.getElementById("signInFormElement").reset();
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = getAuthErrorMessage(errorCode);
        messageDiv.textContent = errorMessage;
        messageDiv.className = "auth-message error";
      })
      .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  });

  // Sign Up Form Submission
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

    // Validation checks (existing code remains the same)
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

    // Validate IDs based on user type
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
      if (year !== "24" && year !== "23" && year !== "22") {
        messageDiv.textContent = "Student ID should start with valid year digits (22, 23, 24, etc.).";
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

    // Show loading state
    const submitBtn = document.querySelector("#signUpFormElement .auth-submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Checking Availability...";
    submitBtn.disabled = true;

    try {
      // Check for existing user with same credentials (CASE-INSENSITIVE)
      const duplicateCheck = await checkForDuplicateUser(username, userType.value, studentId, staffId, email);
      
      if (duplicateCheck.exists) {
        messageDiv.textContent = duplicateCheck.message;
        messageDiv.className = "auth-message error";
        return;
      }

      // If no duplicates, proceed with account creation
      submitBtn.textContent = "Creating Account...";
      
      const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
      const user = userCredential.user;

      const userData = {
        username: username,
        email: email,
        userType: userType.value,
        createdAt: new Date(),
        role: userType.value,
        emailVerified: false
      };

      if (userType.value === "student") {
        userData.studentId = studentId;
        userData.formattedStudentId = `${studentId.substring(0, 2)}-${studentId.substring(2, 7)}-${studentId.substring(7)}`;
      } else if (userType.value === "staff") {
        userData.staffId = staffId;
      }

      await setDoc(doc(window.db, "users", user.uid), userData);
      await sendEmailVerification(user);

      messageDiv.innerHTML = `
        Account created successfully!<br>
        We've sent a verification email to <strong>${email}</strong><br>
        Please check your inbox and verify your email address.
      `;
      messageDiv.className = "auth-message success";

      setTimeout(() => {
        document.getElementById("authModal").style.display = "none";
        window.showVerificationReminder(user);
      }, 2000);

      document.getElementById("signUpFormElement").reset();
      document.getElementById("studentIdGroup").style.display = "none";
      document.getElementById("staffIdGroup").style.display = "none";
    } catch (error) {
      console.error("Full sign-up error:", error);
      const errorCode = error.code;
      let errorMessage = getAuthErrorMessage(errorCode);
      
      // Enhanced error details for debugging
      if (errorCode === 'auth/operation-not-allowed') {
        errorMessage = "Email/password accounts are not enabled in Firebase. Please check your Firebase Console settings.";
      } else if (errorCode === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (errorCode === 'auth/invalid-api-key') {
        errorMessage = "Firebase configuration error. Please check your API keys.";
      }
      
      messageDiv.textContent = `${errorMessage} (Error code: ${errorCode})`;
      messageDiv.className = "auth-message error";
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // User Type Selection Handler
  const userTypeRadios = document.querySelectorAll('input[name="userType"]');
  const studentIdGroup = document.getElementById("studentIdGroup");
  const staffIdGroup = document.getElementById("staffIdGroup");

  userTypeRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "student") {
        studentIdGroup.style.display = "block";
        staffIdGroup.style.display = "none";
        document.getElementById("staffId").value = "";
      } else if (this.value === "staff") {
        studentIdGroup.style.display = "none";
        staffIdGroup.style.display = "block";
        document.getElementById("studentId").value = "";
      }
    });
  });

  // Student ID input formatting
  const studentIdInput = document.getElementById("studentId");
  if (studentIdInput) {
    studentIdInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      e.target.value = value;
    });
  }
});

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please try signing in or use a different email.";
    case "auth/invalid-email":
      return "Please enter a valid email address (e.g., name@example.com).";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password with at least 6 characters.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support for assistance.";
    case "auth/user-not-found":
      return "No account found with this email. Please check your email or sign up for a new account.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again or reset your password if you've forgotten it.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again in a few minutes.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/invalid-credential":
      return "Invalid login credentials. Please check your email and password.";
    case "auth/requires-recent-login":
      return "Please sign out and sign in again to perform this action.";
    default:
      return "An unexpected error occurred. Please try again. If the problem continues, contact support.";
  }
}

// Forgot Password functionality
function showForgotPasswordModal() {
  document.getElementById("authModal").style.display = "none";
  document.getElementById("forgotPasswordModal").style.display = "block";
}

function getPasswordResetErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email address (e.g., name@example.com).";
    case "auth/user-not-found":
      return "No account found with this email. Please check your email or sign up for a new account.";
    case "auth/too-many-requests":
      return "Too many reset attempts. Please try again in a few minutes.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/operation-not-allowed":
      return "Password reset is not enabled. Please contact support.";
    default:
      return "An unexpected error occurred. Please try again. If the problem continues, contact support.";
  }
}

// Make function globally available
window.showForgotPasswordModal = showForgotPasswordModal;