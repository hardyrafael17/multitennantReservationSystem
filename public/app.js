// Wait for Firebase SDKs to load
document.addEventListener("DOMContentLoaded", () => {
    // ⚠️ IMPORTANT: The developer must replace these with the project's actual Firebase configuration.
    // These values can be found in the Firebase console:
    // Project Overview (gear icon) > Project settings > General > Your apps > SDK setup and configuration.
    // The projectId is "gastby-navarenas".
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY", // TODO: Replace with your actual API Key
        authDomain: "gastby-navarenas.firebaseapp.com",
        projectId: "gastby-navarenas",
        storageBucket: "gastby-navarenas.appspot.com", // TODO: Confirm or replace if different
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // TODO: Replace with your actual Sender ID
        appId: "YOUR_APP_ID" // TODO: Replace with your actual App ID
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    const signInBtn = document.getElementById("signInBtn");
    const signOutBtn = document.getElementById("signOutBtn");
    const userInfoDiv = document.getElementById("user-info");
    const userNameSpan = document.getElementById("userName");
    const userEmailSpan = document.getElementById("userEmail");
    const userUIDSpan = document.getElementById("userUID");
    const tenantIdClaimSpan = document.getElementById("tenantIdClaim");
    const rolesClaimSpan = document.getElementById("rolesClaim");
    const callApiBtn = document.getElementById("callApiBtn");
    const apiResponsePre = document.getElementById("apiResponse");

    // Google Sign-In Provider
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    signInBtn.addEventListener("click", () => {
        auth.signInWithPopup(googleProvider)
            .then((result) => {
                console.log("User signed in:", result.user);
                // onAuthStateChanged will handle UI updates and token refresh.
            })
            .catch((error) => {
                console.error("Google Sign-in error:", error);
                apiResponsePre.textContent = `Sign-in error: ${error.message} (Code: ${error.code})`;
            });
    });

    signOutBtn.addEventListener("click", () => {
        auth.signOut().then(() => {
            console.log("User signed out");
            // onAuthStateChanged will handle UI updates.
        }).catch((error) => {
            console.error("Sign-out error:", error);
        });
    });

    callApiBtn.addEventListener("click", async () => {
        apiResponsePre.textContent = "Calling API...";
        const user = auth.currentUser;
        if (user) {
            try {
                const idToken = await user.getIdToken(); // Gets the current ID token

                // Determine API base URL (local emulator vs. deployed)
                // For local emulators: http://127.0.0.1:5001/gastby-navarenas/us-central1/api
                // For deployed: https://us-central1-gastby-navarenas.cloudfunctions.net/api
                // The /helloWorld endpoint is defined in functions/src/index.ts as part of the 'api' Express app.
                const apiUrl = `http://127.0.0.1:5001/gastby-navarenas/us-central1/api/helloWorld`;
                // const apiUrl = `https://us-central1-gastby-navarenas.cloudfunctions.net/api/helloWorld`; // Uncomment for deployed

                console.log(`Calling API: ${apiUrl} with token: ${idToken.substring(0, 20)}...`);

                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${idToken}`
                    }
                });

                const responseText = await response.text();
                if (!response.ok) {
                    throw new Error(`API call failed (${response.status}): ${responseText}`);
                }
                apiResponsePre.textContent = `API Response: ${responseText}`;
            } catch (error) {
                console.error("Error calling API:", error);
                apiResponsePre.textContent = `Error calling API: ${error.message}`;
            }
        } else {
            apiResponsePre.textContent = "You must be signed in to call the API.";
        }
    });

    // Observe Auth state changes
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            signInBtn.style.display = "none";
            signOutBtn.style.display = "block";
            userInfoDiv.style.display = "block";

            userNameSpan.textContent = user.displayName || "N/A";
            userEmailSpan.textContent = user.email || "N/A";
            userUIDSpan.textContent = user.uid;

            // Get ID token result, forcing refresh to get latest custom claims
            try {
                const idTokenResult = await user.getIdTokenResult(true);
                console.log("User ID Token acquired. Claims:", idTokenResult.claims);

                const tenantId = idTokenResult.claims.tenantId || "N/A (Claim not set)";
                const roles = idTokenResult.claims.roles ? idTokenResult.claims.roles.join(", ") : "N/A (Claim not set)";

                tenantIdClaimSpan.textContent = tenantId;
                rolesClaimSpan.textContent = roles;

                if (tenantId.startsWith("N/A")) {
                    console.warn("User is authenticated but 'tenantId' custom claim is not set. Access to tenant-specific resources will be restricted until this claim is set by a backend process (e.g., after tenant creation or assignment).");
                }
            } catch (error) {
                console.error("Error getting ID token result or decoding claims:", error);
                tenantIdClaimSpan.textContent = "Error fetching claims";
                rolesClaimSpan.textContent = "Error fetching claims";
            }
        } else {
            // User is signed out
            signInBtn.style.display = "block";
            signOutBtn.style.display = "none";
            userInfoDiv.style.display = "none";
            userNameSpan.textContent = "";
            userEmailSpan.textContent = "";
            userUIDSpan.textContent = "";
            tenantIdClaimSpan.textContent = "N/A";
            rolesClaimSpan.textContent = "N/A";
            apiResponsePre.textContent = "";
        }
    });
});
