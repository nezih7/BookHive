
let allBooks = [];
let currentPage = 1;
const booksPerPage = 7;
const targetBooks = 300;

// Shuffle function to mix up the books from different genres
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    // Allow Arabic, English, digits, space, dot, comma, and escape quotes safely
    return text
        .replace(/\\/g, '\\\\')     // escape backslashes
        .replace(/"/g, '\\"')       // escape double quotes
        .replace(/'/g, "\\'")       // escape single quotes
        .replace(/[^\u0600-\u06FFa-zA-Z0-9 .,]/g, ''); // allow only safe characters
}





async function displayRandomBooks() {
    const writerResultDiv = document.getElementById("writerResult");
    writerResultDiv.style.marginTop = "120px";

    const storedBooks = localStorage.getItem("allBooks");
    const storedQuery = localStorage.getItem("lastQuery");
    if (storedBooks && storedQuery) {
        allBooks = JSON.parse(storedBooks);
        console.log(`Loaded books for query: ${storedQuery}`);
        displayBooks();
        return;
    }

    writerResultDiv.innerHTML = '<center><div class="loader" style="font-size: 70px;margin-top: 20%;color:orange;">Loading...</div></center>';

    const queries = ["fiction", "science", "history", "fantasy", "biography", "poetry", "mystery", "romance", "adventure", "horror"];
    const booksPerGenre = Math.ceil(targetBooks / queries.length);
    let fetchedBooks = [];
    const maxResults = 40;
    let queryIndex = 0;

    while (queryIndex < queries.length) {
        const query = queries[queryIndex];
        let startIndex = 0;
        let genreBooks = [];

        while (genreBooks.length < booksPerGenre && startIndex <= 1000) {
            const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}&startIndex=${startIndex}&filter=free-ebooks`;

            try {
                const response = await fetch(searchUrl);
                const data = await response.json();

                if (!data.items || data.items.length === 0) break;

                const pdfBooks = data.items
                    .filter(item => item.accessInfo?.pdf?.isAvailable && item.accessInfo?.pdf?.downloadLink)
                    .map(item => ({
                        title: item.volumeInfo.title|| "No title",
                        author: item.volumeInfo.authors?.join(", ") || "Unknown author",
                        coverUrl: item.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/120x180?text=No+Cover",
                        description: item.volumeInfo.description || "No description available.",
                        bookFileURL: item.accessInfo.pdf.downloadLink,
                        type: query
                    }));

                genreBooks = genreBooks.concat(pdfBooks);
                startIndex += maxResults;
            } catch (error) {
                console.error(`Error fetching books for "${query}":`, error);
                break;
            }
        }

        fetchedBooks = fetchedBooks.concat(genreBooks.slice(0, booksPerGenre));
        queryIndex++;
    }

    if (fetchedBooks.length > 0) {
        shuffleArray(fetchedBooks);
        allBooks = fetchedBooks.slice(0, targetBooks);
        localStorage.setItem("allBooks", JSON.stringify(allBooks));
        localStorage.setItem("lastQuery", "multi-genre");
        currentPage = 1;
        displayBooks();
    } else {
        writerResultDiv.innerHTML = `
            <p class="error">No books with available PDFs found. Try again later or with a different query.</p>
            <button class="retry-button" onclick="displayRandomBooks()">Retry</button>
        `;
    }
}

function displayBooks() {
    const writerResultDiv = document.getElementById("writerResult");
    const paginationDiv = document.getElementById("pagination");

    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = allBooks.slice(startIndex, endIndex);

    const booksHTML = booksToDisplay.map((book, index) => `
    <div class="book-card" onclick="goToBookDetail(${(currentPage - 1) * booksPerPage + index})">
      <img src="${book.coverUrl}" alt="Book Cover">
      <div class="book-info">
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <p><strong>Type:</strong> ${book.type}</p>
      </div>
    </div>
`).join('');

    writerResultDiv.innerHTML = `<div class="book-grid">${booksHTML}</div>`;

    const totalPages = Math.ceil(allBooks.length / booksPerPage);
    paginationDiv.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
        <span style="color: white;">Page ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
    `;
}

function goToBookDetail(bookIndex) {
    const book = allBooks[bookIndex];
    const bookToStore = {
        title: sanitizeText(book.title),
        author: sanitizeText(book.author),
        coverUrl: book.coverUrl,
        description: sanitizeText(book.description),
        bookFileURL: book.bookFileURL,
        type: sanitizeText(book.type)
    };
    localStorage.removeItem("selectedBook");
    localStorage.setItem("selectedBook", JSON.stringify(bookToStore));
    window.open("../HTML/bookdetails.html", "_blank");
}

function changePage(newPage) {
    const totalPages = Math.ceil(allBooks.length / booksPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayBooks();
    }
}

function clearPagination() {
    const paginationDiv = document.getElementById("pagination");
    if (paginationDiv) {
        paginationDiv.innerHTML = "";
    }
    const writerResultDiv = document.getElementById("writerResult");
    writerResultDiv.innerHTML = "";
}

window.onload = displayRandomBooks;
