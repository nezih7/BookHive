// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Import Appwrite SDK
import * as Appwrite from "https://cdn.jsdelivr.net/npm/appwrite@13.0.1/+esm";

// Firebase configuration
const firebaseConfig = {
    //put your Firebase configuration here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Initialize Appwrite
const client = new Appwrite.Client();
client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("put your Appwrite project ID here");

const storage = new Appwrite.Storage(client);
const database = new Appwrite.Databases(client);

// Redirect if not authenticated or email not verified
onAuthStateChanged(auth, (user) => {
    if (!user || !user.emailVerified) {
        window.location.href = "site.html";
    }
});

// DOM Elements
const form = document.getElementById("writer-form");
const submitButton = document.getElementById("btn");

async function handleFormSubmission() {
    const title = document.getElementById("title").value.trim();
    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value.trim();
    const author = document.getElementById("author").value.trim();
    const price = document.getElementById("price").value.trim();
    const file = document.getElementById("file").files[0];
    const cover = document.getElementById("cover").files[0];

    if (!title || !type || !description || !author || !price || !file || !cover) {
        alert("Please fill out all fields and upload the required files.");
        return;
    }

    const allowedFileTypes = [".pdf", ".doc", ".docx"];
    const allowedImageTypes = [".jpg", ".jpeg", ".png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const coverExtension = cover.name.split(".").pop().toLowerCase();

    if (!allowedFileTypes.includes(`.${fileExtension}`)) {
        alert("Invalid book file type.");
        return;
    }

    if (!allowedImageTypes.includes(`.${coverExtension}`)) {
        alert("Invalid image file type.");
        return;
    }

    try {
        const bookFileResponse = await storage.createFile(
            "put your bucket ID here", // Bucket ID
            "unique()",
            file
        );
        const bookFileURL = storage.getFileView("put your bucket ID here", bookFileResponse.$id);

        const coverImageResponse = await storage.createFile(
            "put your bucket ID here",
            "unique()",
            cover
        );
        const coverImageURL = storage.getFileView("put your bucket ID here", coverImageResponse.$id);
        function sanitizeText(text) {
            if (typeof text !== 'string') return '';
            
            // Allow Arabic, English, digits, space, dot, comma, and escape quotes safely
            return text
                .replace(/\\/g, '\\\\')     // escape backslashes
                .replace(/"/g, '\\"')       // escape double quotes
                .replace(/'/g, "\\'")       // escape single quotes
                .replace(/[^\u0600-\u06FFa-zA-Z0-9 .,]/g, ''); // allow only safe characters
        }
        
        
        
        
        
        const bookData = {
            title: sanitizeText(title),
            type: sanitizeText(type),
            description: sanitizeText(description),
            author: sanitizeText(author),
            price: parseFloat(price), // Ensure price is stored as a number
            bookFileURL,
            coverImageURL,
            timestamp: new Date().toISOString() // Add a timestamp
        };

        await database.createDocument(
            "put your database ID here", // Database ID
            "put your collection ID here", // Collection ID
            "unique()", // Document ID
            bookData, // Document data
            
            
        );

        alert("Book uploaded successfully!");
        form.reset();
    } catch (error) {
        console.error("Error uploading files or saving book data:", error);
        alert("An error occurred. Please try again.");
    }
}

submitButton.addEventListener("click", handleFormSubmission);
