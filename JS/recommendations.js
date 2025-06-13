// Recommender Function: Calls Gemini API
async function Recommended(my_list, old_list) {
    try {
        const bookString = my_list.length > 0
            ? my_list.map(book => `${book.bookTitle}, ${book.bookAuthor}`).join('\n')
            : "None";

        const oldBookString = old_list.length > 0
            ? old_list.map(book => `${book.book}, ${book.author}`).join('\n')
            : "None";

        const response = await fetch(
            'put your Gemini API endpoint here',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `
                            Favorite books (title, author):
                            ${bookString}
                            
                            Exclude these (already recommended):
                            ${oldBookString},ignore this list if it's empty.
                            
                            You may include sequels, spin-offs, or companion books.
                            
                            Recommend 5–10 new books with similar emotional depth, narrative style, or genre. Avoid duplicates and repetitive themes.
                            
                            Format:
                            Book Title, Author
                            
                            No quotes, numbers, or extra text—just plain lines of recommendations.
                            `
                            
                        }]
                    }]
                })
            }
        );

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const recommendedBooks = generatedText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.includes(','))
            .map(line => {
                const [book, author] = line.split(',').map(str => str.trim());
                return { book, author };
            });

        console.log("Recommended Books:", recommendedBooks);
        return recommendedBooks;

    } catch (error) {
        console.error("Error during recommendation:", error.message);
        return [];
    }
}

// Book Search via OpenLibrary
async function Search(my_list) {
    const container = document.getElementById("recommendations");
    container.innerHTML = "";

    for (const item of my_list) {
        const query = `${item.book} ${item.author}`.replace(/\s+/g, '+');

        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
            const data = await response.json();
            if (!data.docs || data.docs.length === 0) continue;

            const book = data.docs[0];
            const title = book.title || "No title";
            const author = book.author_name?.join(", ") || "Unknown author";
            const coverUrl = book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                : "https://via.placeholder.com/120x180?text=No+Cover";

            let readLink = book.preview_url || null;
            if (!readLink && book.ia?.length > 0) {
                readLink = `https://archive.org/details/${book.ia[0]}/mode/2up`;
            } else if (!readLink && book.key) {
                readLink = `https://openlibrary.org${book.key}/borrow`;
            }

            let description = "No description available.";
            let bookType = "Not provided";

            if (book.key) {
                const workResp = await fetch(`https://openlibrary.org${book.key}.json`);
                const workData = await workResp.json();

                if (workData.description) {
                    description = sanitizeText(
                        typeof workData.description === "string"
                            ? workData.description
                            : workData.description.value
                    );
                }

                if (workData.subjects?.length > 0) {
                    const fullType = sanitizeText(workData.subjects.join(", "));
                    bookType = fullType.split(" ")[0] || "Unknown";
                }
            }

            const card = document.createElement('div');
            card.className = 'book-card';

            const bookInfo = {
                title: sanitizeText(title),
                author: sanitizeText(author),
                coverImageURL: coverUrl,
                description: sanitizeText(description),
                bookFileURL: readLink,
                bookType: sanitizeText(bookType),
                type: sanitizeText(bookType)
            };

            card.setAttribute("data-book", JSON.stringify(bookInfo));
            card.innerHTML = `
                <img src="${coverUrl}" alt="Cover of ${sanitizeText(title)}">
                <div class="book-info">
                    <h3>${sanitizeText(title)}</h3>
                    <p><strong>Author:</strong> ${sanitizeText(author)}</p>
                    <p><strong>Type:</strong> ${sanitizeText(bookType)}</p>
                </div>
            `;

            card.addEventListener("click", () => {
                try {
                    const bookData = JSON.parse(card.getAttribute("data-book"));
                    localStorage.setItem("selectedBook", JSON.stringify(bookData));
                    window.open("bookdetails.html", "_blank");
                } catch (error) {
                    console.error("Error parsing book data:", error);
                }
            });

            container.appendChild(card);

        } catch (error) {
            console.error("Error fetching book data:", error.message);
        }
    }
}

// Get full book description
async function getBookDescription(bookKey) {
    if (!bookKey) return "No description available.";
    try {
        const res = await fetch(`https://openlibrary.org${bookKey}.json`);
        const data = await res.json();
        return typeof data.description === "string" ? sanitizeText(data.description) : sanitizeText(data.description?.value) || "No description.";
    } catch {
        return "No description available.";
    }
}

// Basic text sanitizer
function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    // Allow Arabic, English, digits, space, dot, comma, and escape quotes safely
    return text
        .replace(/\\/g, '\\\\')     // escape backslashes
        .replace(/"/g, '\\"')       // escape double quotes
        .replace(/'/g, "\\'")       // escape single quotes
        .replace(/[^\u0600-\u06FFa-zA-Z0-9 .,]/g, ''); // allow only safe characters
}




