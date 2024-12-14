 // Import Firebase modules
 import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
 import { 
     getAuth, 
     createUserWithEmailAndPassword, 
     signInWithEmailAndPassword, 
     signOut, 
     updateProfile 
 } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
 import { 
     getStorage, 
     ref, 
     uploadBytes, 
     getDownloadURL 
 } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
 import { 
     getFirestore, 
     doc, 
     setDoc, 
     getDoc 
 } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
 
 // Firebase configuration
 const firebaseConfig = {
     apiKey: "AIzaSyC293rbJspVxRheRyvlBMPiivw8UWNEkjQ",
     authDomain: "messageapp-47727.firebaseapp.com",
     databaseURL: "https://messageapp-47727-default-rtdb.firebaseio.com",
     projectId: "messageapp-47727",
     storageBucket: "messageapp-47727.appspot.com",
     messagingSenderId: "121824970903",
     appId: "1:121824970903:web:2b31ddb44e54f9d80741d2",
     measurementId: "G-MZFT5YEK7S"
 };
 
 // Initialize Firebase
 try {
     const app = initializeApp(firebaseConfig);
     const auth = getAuth(app);
     const storage = getStorage(app);
     const db = getFirestore(app);
 
     // Get DOM elements
     const mainContent = document.querySelector('.main-content');
     const bottomNav = document.querySelector('.bottom-nav');
     const topNav = document.querySelector('.top-nav');
     const signupModal = document.getElementById('signupModal');
     const loginModal = document.getElementById('loginModal');
     const profileModal = document.getElementById('profileModal');
     const showLoginLink = document.getElementById('showLogin');
     const showSignupLink = document.getElementById('showSignup');
     const signupForm = document.getElementById('signupForm');
     const loginForm = document.getElementById('loginForm');
     const logoutBtn = document.getElementById('logoutBtn');
 
     // Hide main content and navigation
     function hideMainContent() {
         mainContent.style.display = 'none';
         bottomNav.style.display = 'none';
         topNav.style.display = 'none';
     }
 
     // Show main content and navigation
     function showMainContent() {
         mainContent.style.display = 'block';
         bottomNav.style.display = 'flex';
         topNav.style.display = 'block';
     }
 
     // Modal display handler
     function showModal(modal) {
         document.querySelectorAll('.auth-modal').forEach(m => m.style.display = 'none');
         modal.style.display = 'flex';
     }
 
     // Update UI for logged-in user
     async function updateUIForUser(user) {
         try {
             const userDoc = await getDoc(doc(db, 'users', user.uid));
             const userData = userDoc.data();
             
             // Update profile modal content
             document.getElementById('userProfilePhoto').src = userData.photoURL;
             document.getElementById('userName').textContent = userData.name;
             document.getElementById('userEmail').textContent = userData.email;
             document.getElementById('userMobile').textContent = userData.mobile;
 
             // Update account icon in nav
             const accountNav = document.querySelector('.nav-item:last-child');
             const accountIcon = accountNav.querySelector('.nav-icon');
             accountIcon.innerHTML = `<img src="${userData.photoURL}" alt="Profile" style="width: 24px; height: 24px; border-radius: 50%;">`;
             
             // Show main content
             showMainContent();
             document.querySelectorAll('.auth-modal').forEach(modal => modal.style.display = 'none');
         } catch (error) {
             console.error('Error updating UI:', error);
             alert('Error updating UI: ' + error.message);
         }
     }
 
     // Update UI for guest user
     function updateUIForGuest() {
         hideMainContent();
         showModal(loginModal);
     }
 
     // Modal switcher event listeners
     showLoginLink.addEventListener('click', (e) => {
         e.preventDefault();
         showModal(loginModal);
     });
 
     showSignupLink.addEventListener('click', (e) => {
         e.preventDefault();
         showModal(signupModal);
     });
 
     // Sign up form submission handler
     signupForm.addEventListener('submit', async (e) => {
         e.preventDefault();
         
         const file = document.getElementById('profilePhoto').files[0];
         const name = document.getElementById('signupName').value;
         const mobile = document.getElementById('signupMobile').value;
         const email = document.getElementById('signupEmail').value;
         const password = document.getElementById('signupPassword').value;
 
         try {
             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
             const user = userCredential.user;
 
             // Upload profile photo
             const storageRef = ref(storage, `profiles/${user.uid}`);
             await uploadBytes(storageRef, file);
             const photoURL = await getDownloadURL(storageRef);
 
             // Update profile and save to Firestore
             await updateProfile(user, { displayName: name, photoURL });
             await setDoc(doc(db, 'users', user.uid), {
                 name,
                 email,
                 mobile,
                 photoURL
             });
 
             signupForm.reset();
             await updateUIForUser(user);
         } catch (error) {
             console.error('Sign Up Error:', error);
             alert('Sign Up Error: ' + error.message);
         }
     });
 
     // Login form submission handler
     loginForm.addEventListener('submit', async (e) => {
         e.preventDefault();
 
         const email = document.getElementById('loginEmail').value;
         const password = document.getElementById('loginPassword').value;
 
         try {
             const userCredential = await signInWithEmailAndPassword(auth, email, password);
             loginForm.reset();
             await updateUIForUser(userCredential.user);
         } catch (error) {
             console.error('Login Error:', error);
             alert('Login Error: ' + error.message);
         }
     });
 
     // Logout button handler
     logoutBtn.addEventListener('click', async () => {
         try {
             await signOut(auth);
             updateUIForGuest();
         } catch (error) {
             console.error('Logout Error:', error);
             alert('Logout Error: ' + error.message);
         }
     });
 
     // Account icon click handler
     document.querySelector('.nav-item:last-child').addEventListener('click', () => {
         if (auth.currentUser) {
             showModal(profileModal);
         }
     });
 
     // Auth state change listener
     auth.onAuthStateChanged((user) => {
         if (user) {
             updateUIForUser(user);
         } else {
             updateUIForGuest();
         }
     });
 
     // Initial state setup
     hideMainContent();
     showModal(loginModal);
 
 } catch (error) {
     console.error('Firebase initialization error:', error);
     alert('Firebase initialization error: ' + error.message);
 }