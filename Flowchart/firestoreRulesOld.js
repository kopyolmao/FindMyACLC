rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users rules - CORRECTED VERSION
    match /users/{userId} {
      // Allow public read access for username/email availability checks during signup
      allow read: if request.auth == null;
      
      // Authenticated users can read their own user document
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Authenticated users can write their own user document
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Staff can read all user documents
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'staff';
    }

    // Items rules - CORRECTED VERSION
    match /items/{itemId} {
      // Authenticated and verified users can read items
      allow read: if request.auth != null && request.auth.token.email_verified == true;
      
      // Authenticated and verified users can create items
      allow create: if request.auth != null && request.auth.token.email_verified == true;
      
      // Users can update their own items, staff can update any
      allow update: if request.auth != null && request.auth.token.email_verified == true
        && (resource.data.reportedBy == request.auth.uid 
            || (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'staff'));
      
      // Only staff can delete items
      allow delete: if request.auth != null && request.auth.token.email_verified == true
        && exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'staff';
    }

    // Claims rules - FIXED FOR STAFF ACCESS
    match /claims/{claimId} {
      // Authenticated and verified users can read their own claims
      allow read: if request.auth != null && request.auth.token.email_verified == true
        && resource.data.claimedBy == request.auth.uid;
      
      // Staff can read all claims
      allow read: if request.auth != null && request.auth.token.email_verified == true
        && exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'staff';
      
      // Authenticated and verified users can create claims
      allow create: if request.auth != null && request.auth.token.email_verified == true;
      
      // Staff can update claims (approve/reject)
      allow update: if request.auth != null && request.auth.token.email_verified == true
        && exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'staff';
    }
  }
}
